import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, link } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { auditSource } from '../packages/core/src/audit.js';

const bin = fileURLToPath(new URL('../packages/cli/dist/index.js', import.meta.url));
let root: string;
const cli = (...args: string[]) =>
  spawnSync(process.execPath, [bin, '--project', root, ...args], {
    encoding: 'utf8',
    timeout: 20000,
  });
async function put(file: string, source: string) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, source);
}
const pair = '.notice { color: var(--fg, #aaa); background: white; }';
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'tasteforge-imports-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('opt-in import audit CLI', () => {
  it('loads project-local imports beyond the selected entry and preserves default JSON/exit behavior', async () => {
    const source = `@import "../tokens.css"; ${pair}`;
    await put('src/entry.css', source);
    await put('tokens.css', ':root { --fg: #aaa; }');
    const legacy = cli('audit', '--path', 'src/entry.css', '--format', 'json');
    expect(legacy.status).toBe(0);
    const old = JSON.parse(legacy.stdout);
    expect(old.mode).toBe('static-source');
    expect(old.files).toEqual(['src/entry.css']);
    expect(old).not.toHaveProperty('resolution');
    expect(old.findings).toEqual(auditSource('src/entry.css', source));
    const resolved = cli(
      'audit',
      '--path',
      'src/entry.css',
      '--resolve-imports',
      '--format',
      'json',
    );
    expect(resolved.status).toBe(0);
    expect(resolved.stderr).toBe('');
    const report = JSON.parse(resolved.stdout);
    expect(report.mode).toBe('static-imports');
    expect(report.resolution.status).toBe('complete');
    expect(report.files).toEqual(['src/entry.css', 'tokens.css']);
    expect(
      report.findings.find((f: { ruleId: string }) => f.ruleId === 'contrast-pair').provenance[0]
        .file,
    ).toBe('tokens.css');
    expect(
      cli('audit', '--path', 'src/entry.css', '--resolve-imports', '--fail-on', 'warning').status,
    ).toBe(1);
    expect(
      cli('audit', '--path', 'src/entry.css', '--resolve-imports', '--fail-on', 'never').status,
    ).toBe(0);
    expect(cli('audit', '--path', 'src/entry.css', '--resolve-imports').stdout).toContain(
      'definition: --fg at tokens.css:1:9',
    );
  });

  it('keeps missing, remote, conditional, excluded and escaping imports visible as review', async () => {
    for (const specifier of [
      '"missing.css"',
      '"https://example.com/tokens.css"',
      '"tokens.css" screen',
      '"../tokens.css"',
      '"node_modules/pkg/tokens.css"',
      '"NODE_MODULES/pkg/tokens.css"',
    ]) {
      await put('entry.css', `@import ${specifier}; ${pair}`);
      await put('tokens.css', ':root { --fg: #aaa; }');
      await put('node_modules/pkg/tokens.css', ':root { --fg: #aaa; }');
      const result = cli('audit', '--path', 'entry.css', '--resolve-imports', '--format', 'json');
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout);
      expect(report.resolution.status).toBe('partial');
      expect(
        report.findings.some((f: { ruleId: string }) => f.ruleId === 'import-resolution-review'),
      ).toBe(true);
      expect(report.findings.some((f: { ruleId: string }) => f.ruleId === 'contrast-pair')).toBe(
        false,
      );
      expect(report.files).toEqual(['entry.css']);
    }
  });

  it('rejects original symlink directory/file components and hardlinked imports', async () => {
    await put('real/tokens.css', ':root { --fg: #aaa; }');
    await symlink(path.join(root, 'real'), path.join(root, 'linked-dir'), 'dir');
    await symlink(path.join(root, 'real/tokens.css'), path.join(root, 'linked.css'), 'file');
    await link(path.join(root, 'real/tokens.css'), path.join(root, 'hard.css'));
    for (const selected of ['linked-dir', 'linked.css', 'hard.css']) {
      expect(cli('audit', '--path', selected, '--resolve-imports', '--format', 'json').status).toBe(
        2,
      );
    }
    for (const target of ['linked-dir/tokens.css', 'linked.css', 'hard.css']) {
      await put('entry.css', `@import "${target}"; ${pair}`);
      const result = cli('audit', '--path', 'entry.css', '--resolve-imports', '--format', 'json');
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout);
      expect(report.resolution.status).toBe('partial');
      expect(report.resolution.imports[0].reason).toMatch(/link/i);
      expect(report.files).toEqual(['entry.css']);
    }
  });

  it.skipIf(process.platform === 'win32')(
    'refuses a FIFO before opening an imported stylesheet',
    async () => {
      expect(spawnSync('mkfifo', [path.join(root, 'pipe.css')]).status).toBe(0);
      await put('entry.css', `@import "pipe.css"; ${pair}`);
      const result = cli('audit', '--path', 'entry.css', '--resolve-imports', '--format', 'json');
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout);
      expect(report.resolution.imports[0].reason).toContain('regular stylesheet');
      expect(report.files).toEqual(['entry.css']);
    },
  );

  it('allows explicit generated-token imports without requiring generated DNA', async () => {
    await put('.tasteforge/tokens.css', ':root { --tf-color-foreground: #aaa; }');
    await put(
      'entry.css',
      '@import ".tasteforge/tokens.css"; .notice { color: var(--tf-color-foreground); background: white; }',
    );
    const result = cli('audit', '--path', 'entry.css', '--resolve-imports', '--format', 'json');
    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.resolution.status).toBe('complete');
    expect(report.files).toContain('.tasteforge/tokens.css');
    expect(report.findings.some((f: { ruleId: string }) => f.ruleId === 'unknown-token')).toBe(
      false,
    );
  });

  it('leaves JSX/TSX source audit intact and never executes module imports', async () => {
    const source =
      'import "./tokens.css"; import "./side-effect.js"; export const View = () => <p style={{color: "#aaa", backgroundColor: "white"}}>Hello</p>;';
    await put('src/View.tsx', source);
    await put('src/side-effect.js', 'throw new Error("must not execute");');
    const result = cli('audit', '--path', 'src/View.tsx', '--resolve-imports', '--format', 'json');
    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.findings).toEqual(auditSource('src/View.tsx', source));
    expect(report.files).toEqual(['src/View.tsx']);
    expect(report.resolution.status).toBe('not-applicable');
    expect(report.resolution.jsxImportsFollowed).toBe(false);
    expect(await readFile(path.join(root, 'src/side-effect.js'), 'utf8')).toContain(
      'must not execute',
    );
  });

  it('returns a narrow-path error on over-budget selected CSS roots', async () => {
    await Promise.all(Array.from({ length: 257 }, (_, i) => put(`src/file-${i}.css`, '')));
    const result = cli('audit', '--path', 'src', '--resolve-imports', '--format', 'json');
    expect(result.status).toBe(2);
    expect(result.stdout + result.stderr).toContain('narrower --path');
  });
});
