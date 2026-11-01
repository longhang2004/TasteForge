import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, link, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validateDNA, type Direction } from '../packages/core/src/index.js';

const bin = fileURLToPath(new URL('../packages/cli/dist/index.js', import.meta.url));
let root: string;
const cli = (...args: string[]) =>
  spawnSync(process.execPath, [bin, '--project', root, ...args], {
    encoding: 'utf8',
    timeout: 20000,
  });
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'tasteforge-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('CLI integration and exit contract', () => {
  it('reads the external catalog and samples attributed inspiration without writing project artifacts', async () => {
    expect(cli('init').status).toBe(0);
    const files = await readdir(path.join(root, '.tasteforge'));
    const search = cli(
      'catalog',
      '--kind',
      'style',
      '--source',
      'volt',
      '--limit',
      '2',
      '--format',
      'json',
    );
    expect(search.status).toBe(0);
    expect(JSON.parse(search.stdout).entries).toHaveLength(2);
    const doc = cli('catalog', 'volt-wise', '--format', 'json');
    expect(doc.status).toBe(0);
    expect(JSON.parse(doc.stdout).source.license).toBe('MIT');
    const sampled = cli('inspire', '--task', 'commerce', '--seed', '42', '--format', 'json');
    expect(sampled.stderr).toBe('');
    expect(sampled.status).toBe(0);
    const result = JSON.parse(sampled.stdout);
    expect(result.inspirations).toHaveLength(3);
    expect(result.requiredGates.length).toBeGreaterThanOrEqual(8);
    expect(
      result.inspirations.every((p: { template: { tasks: string[] } }) =>
        p.template.tasks.includes('commerce'),
      ),
    ).toBe(true);
    expect(cli('inspire', '--task', 'commerce', '--seed', '42', '--format', 'json').stdout).toBe(
      sampled.stdout,
    );
    for (const args of [
      ['catalog', 'missing-id'],
      ['catalog', '--limit', '0'],
      ['catalog', '--source', 'missing'],
      ['inspire', '--task', 'nonsense'],
      ['inspire', '--task', 'form', '--seed', '-1'],
    ])
      expect(cli(...args, '--format', 'json').status).toBe(2);
    expect(await readdir(path.join(root, '.tasteforge'))).toEqual(files);
  });
  it('initializes, loads context, suggests, generates, and audits example source', async () => {
    expect(cli('init', '--format', 'json').status).toBe(0);
    const suggestions = cli('suggest', '--seed', '42', '--format', 'json');
    expect(suggestions.stderr).toBe('');
    expect(suggestions.status).toBe(0);
    const { directions } = JSON.parse(suggestions.stdout) as { directions: Direction[] };
    const id = directions[0]!.style.id;
    const generated = cli('generate', '--direction', id, '--seed', '42', '--format', 'json');
    expect(generated.stderr).toBe('');
    expect(generated.status).toBe(0);
    const dna = validateDNA(
      JSON.parse(await readFile(path.join(root, '.tasteforge/design-dna.json'), 'utf8')),
    );
    expect(dna.direction).toEqual(directions[0]);
    expect(await readFile(path.join(root, '.tasteforge/tokens.css'), 'utf8')).toContain(
      dna.colors.background,
    );
    expect(await readFile(path.join(root, '.tasteforge/DESIGN.md'), 'utf8')).toContain(
      dna.direction.style.name,
    );
    await mkdir(path.join(root, 'src'));
    await writeFile(
      path.join(root, 'src/View.tsx'),
      'export const View = () => <p style={{color: "#aaa", backgroundColor: "#fff"}}>Hello</p>',
    );
    const audit = cli('audit', '--path', 'src', '--format', 'json');
    expect(audit.status).toBe(0);
    const report = JSON.parse(audit.stdout);
    expect(report.mode).toBe('static-source');
    expect(report.findings.some((f: { ruleId: string }) => f.ruleId === 'contrast-pair')).toBe(
      true,
    );
    expect(cli('audit', '--path', 'src', '--fail-on', 'warning').status).toBe(1);
    expect(cli('suggest', '--seed', '42', '--format', 'json').stdout).toBe(suggestions.stdout);
  });
  it('previews without any filesystem writes', async () => {
    expect(cli('init', '--dry-run').status).toBe(0);
    expect(await readdir(root)).toEqual([]);
    expect(cli('init').status).toBe(0);
    const files = await readdir(path.join(root, '.tasteforge'));
    expect(cli('generate', '--direction', 'swiss-editorial', '--dry-run').status).toBe(0);
    expect(await readdir(path.join(root, '.tasteforge'))).toEqual(files);
  });
  it('never silently overwrites initialized or generated artifacts', async () => {
    expect(cli('init').status).toBe(0);
    const briefPath = path.join(root, '.tasteforge/brief.json');
    const brief = await readFile(briefPath, 'utf8');
    await writeFile(briefPath, brief.replace('technology', 'education'));
    expect(cli('init').status).toBe(2);
    expect(await readFile(briefPath, 'utf8')).toContain('education');
    expect(cli('init', '--force').status).toBe(0);
    expect(cli('generate', '--direction', 'swiss-editorial').status).toBe(0);
    const dnaPath = path.join(root, '.tasteforge/design-dna.json');
    const first = await readFile(dnaPath, 'utf8');
    expect(cli('generate', '--direction', 'swiss-editorial', '--seed', '2').status).toBe(2);
    expect(await readFile(dnaPath, 'utf8')).toBe(first);
    expect(cli('generate', '--direction', 'swiss-editorial', '--seed', '2', '--force').status).toBe(
      0,
    );
    expect(await readFile(dnaPath, 'utf8')).not.toBe(first);
    expect(
      (await readdir(path.join(root, '.tasteforge'))).some(
        (f) => f.startsWith('.tmp-') || f === '.write-lock',
      ),
    ).toBe(false);
  });
  it('rejects linked output directories and files, including with force', async () => {
    await mkdir(path.join(root, 'elsewhere'));
    await symlink(path.join(root, 'elsewhere'), path.join(root, '.tasteforge'));
    expect(cli('init', '--force').status).toBe(2);
    expect(await readdir(path.join(root, 'elsewhere'))).toEqual([]);
    await rm(path.join(root, '.tasteforge'));
    expect(cli('init').status).toBe(0);
    await writeFile(path.join(root, 'original'), 'preserve');
    await rm(path.join(root, '.tasteforge/brief.json'));
    await link(path.join(root, 'original'), path.join(root, '.tasteforge/brief.json'));
    expect(cli('init', '--force').status).toBe(2);
    expect(await readFile(path.join(root, 'original'), 'utf8')).toBe('preserve');
  });
  it('refuses path traversal and symlink reads outside the project', async () => {
    expect(cli('suggest', '--brief', '../brief.json').status).toBe(2);
    await symlink(tmpdir(), path.join(root, 'outside'));
    expect(cli('audit', '--path', 'outside').status).toBe(2);
    expect(cli('audit', '--path', '../').status).toBe(2);
  });
  it('returns readable errors for malformed briefs, unknown directions, and invalid options', async () => {
    expect(cli('init').status).toBe(0);
    expect(cli('generate', '--direction', 'unknown').stderr).toContain('Unknown direction');
    for (const args of [
      ['suggest', '--count', '0'],
      ['suggest', '--seed', '-1'],
      ['suggest', '--seed', '4294967296'],
      ['suggest', '--format', 'xml'],
      ['unknown'],
    ])
      expect(cli(...args).status).toBe(2);
    await writeFile(path.join(root, '.tasteforge/brief.json'), '{');
    const bad = cli('suggest', '--format', 'json');
    expect(bad.status).toBe(2);
    expect(JSON.parse(bad.stderr).error).toContain('Invalid JSON');
    expect(cli('--help').status).toBe(0);
    const packageJson = JSON.parse(
      await readFile(new URL('../packages/cli/package.json', import.meta.url), 'utf8'),
    );
    expect(cli('--version').stdout.trim()).toBe(packageJson.version);
  });
  it('fails on malformed sources and can explicitly report without failing', async () => {
    await writeFile(path.join(root, 'broken.css'), '.x {');
    expect(cli('audit', '--path', 'broken.css').status).toBe(1);
    expect(cli('audit', '--path', 'broken.css', '--fail-on', 'never').status).toBe(0);
    expect(cli('audit', '--path', '.').status).toBe(1);
    await rm(path.join(root, 'broken.css'));
    expect(cli('audit', '--path', '.').status).toBe(2);
  });
  it('refuses concurrent writes and malformed persisted DNA', async () => {
    expect(cli('init').status).toBe(0);
    await writeFile(path.join(root, '.tasteforge/.write-lock'), '');
    expect(cli('generate', '--direction', 'swiss-editorial').stderr).toContain('Another write');
    await rm(path.join(root, '.tasteforge/.write-lock'));
    await writeFile(path.join(root, 'test.css'), 'a { color: black; }');
    await writeFile(path.join(root, '.tasteforge/design-dna.json'), '{}');
    expect(cli('audit', '--path', 'test.css').status).toBe(2);
  });
});
