import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('..', import.meta.url));
const temporary = await mkdtemp(path.join(tmpdir(), 'tasteforge-package-'));
const command = (bin, args, cwd = repository) =>
  execFileSync(bin, args, {
    cwd,
    encoding: 'utf8',
    timeout: 120000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
try {
  const packages = [
    ['@tasteforge/knowledge', 'knowledge'],
    ['@tasteforge/core', 'core'],
    ['tasteforge', 'cli'],
  ];
  for (const [name, short] of packages) {
    const archive = path.join(temporary, `${short}.tgz`);
    command('pnpm', ['--filter', name, 'pack', '--out', archive]);
    const files = command('tar', ['-tzf', archive]);
    assert(files.includes('package/dist/index.js'));
    assert(files.includes('package/LICENSE'));
    if (short === 'cli') assert(files.includes('package/skills/tasteforge/SKILL.md'));
    if (short === 'knowledge') assert(files.includes('package/dist/data/knowledge.json'));
  }
  const installation = path.join(temporary, 'installation');
  await mkdir(installation);
  await writeFile(
    path.join(installation, 'package.json'),
    JSON.stringify({
      private: true,
      dependencies: { tasteforge: `file:${path.join(temporary, 'cli.tgz')}` },
      pnpm: {
        overrides: {
          '@tasteforge/core': `file:${path.join(temporary, 'core.tgz')}`,
          '@tasteforge/knowledge': `file:${path.join(temporary, 'knowledge.tgz')}`,
        },
      },
    }),
  );
  // A frozen workspace install populates package content, but not necessarily
  // registry metadata for resolving the tarballs' public semver dependencies.
  // Prepare the isolated lock/cache explicitly before proving offline install.
  command(
    'pnpm',
    ['install', '--lockfile-only', '--ignore-scripts', '--no-frozen-lockfile'],
    installation,
  );
  command('pnpm', ['fetch', '--prod', '--ignore-scripts'], installation);
  command('pnpm', ['install', '--offline', '--ignore-scripts', '--frozen-lockfile'], installation);
  const project = path.join(temporary, 'project');
  await mkdir(project);
  const executable = path.join(installation, 'node_modules', '.bin', 'tasteforge');
  const cli = (...args) => command(executable, ['--project', project, ...args], installation);
  assert.equal(cli('--version').trim(), '0.1.0');
  cli('init');
  const { directions } = JSON.parse(cli('suggest', '--seed', '42', '--format', 'json'));
  assert.equal(directions.length, 3);
  cli('generate', '--direction', directions[0].style.id, '--seed', '42');
  const dna = JSON.parse(
    await readFile(path.join(project, '.tasteforge', 'design-dna.json'), 'utf8'),
  );
  assert.deepEqual(dna.direction, directions[0]);
  await writeFile(path.join(project, 'view.css'), '.x { color: #aaa; background: #fff; }');
  const audit = JSON.parse(cli('audit', '--path', 'view.css', '--format', 'json'));
  assert(audit.findings.some((finding) => finding.ruleId === 'contrast-pair'));
  console.log(
    'Packed knowledge/core/CLI installed offline; executable init → suggest → generate → audit passed.',
  );
} catch (error) {
  if (error.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
