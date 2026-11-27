import { lstat } from 'node:fs/promises';
import path from 'node:path';
import type { SourceInput } from '@tasteforge/core/audit';
import { MAX_BYTES, readText, within } from './files.js';

const excluded = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache',
  'vendor',
]);
/** Check original components before realpath can hide a project-local symlink. */
export async function validateAuditImportSelection(
  root: string,
  file: string,
  allowDirectory = true,
): Promise<void> {
  const target = path.resolve(root, file);
  if (!within(root, target)) throw new Error('Import escapes the project boundary');
  const relative = path.relative(root, target);
  const parts = relative ? relative.split(path.sep) : [];
  if (parts.length > 64 || parts.some((part) => excluded.has(part.toLowerCase())))
    throw new Error('Import is inside an excluded/deep directory');
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const info = await lstat(current);
    if (info.isSymbolicLink()) throw new Error('Symlink import components are not followed');
    if (
      index === parts.length - 1
        ? !(info.isFile() || (allowDirectory && info.isDirectory()))
        : !info.isDirectory()
    )
      throw new Error('Expected regular stylesheet files and directory components');
    if (info.isFile() && info.nlink > 1)
      throw new Error('Hardlinked stylesheet files are not followed');
  }
}
export async function collectAuditStylesheets(
  root: string,
  selected: readonly string[],
): Promise<{
  sources: SourceInput[];
  roots: string[];
  unavailable: Record<string, string>;
}> {
  const { AUDIT_IMPORT_LIMITS: limits, inspectCssImports } = await import('@tasteforge/core/audit');
  const roots = selected.filter((file) => file.endsWith('.css')).sort();
  if (roots.length > limits.files)
    throw new Error('More than 256 CSS audit roots; use a narrower --path');
  const rootSet = new Set(roots);
  const queue: { file: string; depth: number }[] = roots.map((file) => ({ file, depth: 0 }));
  const queued = new Set(roots);
  const loaded = new Map<string, string>();
  const unavailable: Record<string, string> = Object.create(null) as Record<string, string>;
  let bytes = 0,
    edges = 0;
  while (queue.length) {
    const { file, depth } = queue.shift()!;
    if (loaded.has(file)) continue;
    if (loaded.size >= limits.files)
      throw new Error('CSS import file limit reached; use a narrower --path');
    let source: string;
    try {
      await validateAuditImportSelection(root, file, false);
      source = await readText(root, file);
    } catch (error) {
      if (rootSet.has(file)) throw error;
      const info = error as NodeJS.ErrnoException;
      unavailable[file] = info.code ? `Local stylesheet read failed (${info.code})` : info.message;
      continue;
    }
    const size = Buffer.byteLength(source, 'utf8');
    if (size > MAX_BYTES || bytes + size > limits.totalBytes)
      throw new Error('CSS import byte budget reached; use a narrower --path');
    bytes += size;
    loaded.set(file, source);
    const imports = inspectCssImports(file, source);
    edges += imports.length;
    if (edges > limits.imports)
      throw new Error('CSS import edge limit reached; use a narrower --path');
    for (const request of imports) {
      if (!request.target || queued.has(request.target)) continue;
      if (depth >= limits.importDepth) {
        unavailable[request.target] = `Import hop limit ${limits.importDepth} reached`;
        continue;
      }
      queued.add(request.target);
      queue.push({ file: request.target, depth: depth + 1 });
    }
  }
  return {
    sources: [...loaded]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([file, source]) => ({ file, source })),
    roots,
    unavailable,
  };
}
