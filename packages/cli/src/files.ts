import { constants } from 'node:fs';
import { open, realpath, lstat, mkdir, readdir, rename, unlink, link } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const MAX_BYTES = 2_000_000;
export async function exists(file: string): Promise<boolean> {
  try {
    await lstat(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}
export function within(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return (
    relative === '' ||
    (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
  );
}
export async function projectRoot(input: string): Promise<string> {
  const root = await realpath(path.resolve(input));
  if (!(await lstat(root)).isDirectory())
    throw new Error('--project must name an existing directory');
  return root;
}
export async function safeReadPath(root: string, input: string): Promise<string> {
  const target = path.resolve(root, input);
  if (!within(root, target)) throw new Error(`Path escapes project: ${input}`);
  const canonical = await realpath(target);
  if (!within(root, canonical)) throw new Error(`Symlink escapes project: ${input}`);
  return canonical;
}
export async function readText(root: string, input: string): Promise<string> {
  const target = await safeReadPath(root, input);
  const file = await open(target, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size > MAX_BYTES)
      throw new Error(`Expected a regular file no larger than ${MAX_BYTES} bytes: ${input}`);
    const bytes = await file.readFile();
    if (bytes.length > MAX_BYTES) throw new Error(`File grew beyond ${MAX_BYTES} bytes: ${input}`);
    return bytes.toString('utf8');
  } finally {
    await file.close();
  }
}
export async function readJson(root: string, input: string): Promise<unknown> {
  try {
    return JSON.parse(await readText(root, input)) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`Invalid JSON in ${input}: ${error.message}`);
    throw error;
  }
}
export async function stateDirectory(root: string, create: boolean): Promise<string> {
  const dir = path.join(root, '.tasteforge');
  if (!(await exists(dir))) {
    if (create) await mkdir(dir);
    return dir;
  }
  const stat = await lstat(dir);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (await realpath(dir)) !== dir)
    throw new Error(
      'Refusing unsafe .tasteforge directory (must be a real project-local directory)',
    );
  return dir;
}
const filenames = new Set([
  'brief.json',
  'config.json',
  'design-dna.json',
  'tokens.css',
  'DESIGN.md',
]);
export async function writeArtifacts(
  root: string,
  files: Record<string, string>,
  options: { force: boolean; dryRun: boolean },
): Promise<string[]> {
  const names = Object.keys(files);
  if (!names.length || names.some((name) => !filenames.has(name)))
    throw new Error('Unsupported artifact filename');
  const directory = await stateDirectory(root, !options.dryRun);
  const inspect = async () => {
    for (const name of names) {
      const target = path.join(directory, name);
      if (await exists(target)) {
        const stat = await lstat(target);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink > 1)
          throw new Error(`Refusing linked or non-regular output: ${name}`);
        if (!options.force)
          throw new Error(
            `${name} already exists. Review it and use --force to explicitly replace artifacts.`,
          );
      }
    }
  };
  await inspect();
  if (options.dryRun) return names.map((name) => path.join('.tasteforge', name));
  const lockPath = path.join(directory, '.write-lock');
  const lock = await open(lockPath, 'wx').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'EEXIST')
      throw new Error(
        'Another write is active, or a stale .tasteforge/.write-lock remains. Inspect before removing it.',
      );
    throw error;
  });
  const staged: string[] = [];
  try {
    await inspect();
    for (const name of names) {
      const temp = path.join(directory, `.tmp-${randomUUID()}`);
      const handle = await open(temp, 'wx', 0o600);
      staged.push(temp);
      try {
        await handle.writeFile(files[name]!, 'utf8');
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    for (const [index, name] of names.entries()) {
      const target = path.join(directory, name);
      if (options.force) {
        await inspect();
        await rename(staged[index]!, target);
      } else {
        await link(staged[index]!, target);
        await unlink(staged[index]!);
      }
    }
  } finally {
    for (const temp of staged) if (await exists(temp)) await unlink(temp);
    await lock.close();
    await unlink(lockPath);
  }
  return names.map((name) => path.join('.tasteforge', name));
}
export async function collectSources(root: string, input: string): Promise<string[]> {
  const start = await safeReadPath(root, input);
  const result: string[] = [];
  const skip = new Set([
    'node_modules',
    '.git',
    '.tasteforge',
    'dist',
    'build',
    'coverage',
    '.next',
    '.cache',
    'vendor',
  ]);
  let visited = 0;
  const walk = async (target: string, depth: number): Promise<void> => {
    if (depth > 64 || ++visited > 20000)
      throw new Error('Audit traversal limit reached; use a narrower --path');
    const stat = await lstat(target);
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      const entries = await readdir(target, { withFileTypes: true });
      entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      for (const entry of entries)
        if (!skip.has(entry.name) && !entry.isSymbolicLink())
          await walk(path.join(target, entry.name), depth + 1);
    } else if (stat.isFile() && /\.(css|tsx|jsx)$/.test(target)) {
      if (result.length >= 5000)
        throw new Error('More than 5000 supported files; use a narrower --path');
      result.push(path.relative(root, target).split(path.sep).join('/'));
    }
  };
  await walk(start, 0);
  if (!result.length) throw new Error('No supported .css, .tsx, or .jsx source files found');
  return result;
}
