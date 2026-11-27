import { describe, expect, it } from 'vitest';
import {
  AUDIT_IMPORT_LIMITS,
  auditProject,
  auditSource,
  inspectCssImports,
  type ProjectFinding,
  type SourceInput,
} from '../packages/core/src/index.js';

const findingsFor = (findings: ProjectFinding[], rule: string, file = 'entry.css') =>
  findings.filter((finding) => finding.ruleId === rule && finding.file === file);
const pair = '.notice { color: var(--fg); background: white; }';

describe('bounded static stylesheet audit', () => {
  it('finds imported contrast, font and token evidence at original source locations', () => {
    const report = auditProject(
      [
        {
          file: 'entry.css',
          source:
            '@import "tokens.css";\n.notice { color: var(--tf-color-foreground); background: var(--tf-color-background); font-family: var(--tf-font-family-body); }\n.literal { color: #aaa; }',
        },
        {
          file: 'tokens.css',
          source:
            '\n:root {\n  --tf-color-foreground: #aaa;\n  --tf-color-background: #fff;\n  --tf-font-family-body: "Inter";\n}',
        },
      ],
      { roots: ['entry.css'] },
    );
    expect(report.version).toBe('1.0');
    expect(report.roots).toEqual(['entry.css']);
    expect(report.files).toEqual(['entry.css', 'tokens.css']);
    const contrast = findingsFor(report.findings, 'contrast-pair')[0]!;
    expect(contrast.line).toBe(2);
    expect(contrast.explanation).toContain('2.32:1');
    expect(contrast.provenance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'definition',
          token: '--tf-color-foreground',
          file: 'tokens.css',
          line: 3,
          column: 3,
        }),
        expect.objectContaining({ token: '--tf-color-background', file: 'tokens.css', line: 4 }),
      ]),
    );
    expect(findingsFor(report.findings, 'font-fallback')[0]?.provenance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: '--tf-font-family-body', file: 'tokens.css', line: 5 }),
      ]),
    );
    expect(findingsFor(report.findings, 'hardcoded-token')[0]?.provenance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: '--tf-color-foreground', file: 'tokens.css' }),
      ]),
    );
  });

  it('resolves nested aliases and missing fallbacks without evaluating unused fallbacks', () => {
    const report = auditProject([
      {
        file: 'entry.css',
        source:
          ':root { --base: #aaa; --fg: var(--base); --bg: #fff; }\n.notice { color: var(--fg, var(--unused)); background: var(--missing, var(--also-missing, var(--bg))); }',
      },
    ]);
    const contrast = findingsFor(report.findings, 'contrast-pair')[0]!;
    expect(contrast).toBeDefined();
    expect(contrast.provenance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'definition', token: '--fg', file: 'entry.css' }),
        expect.objectContaining({ kind: 'definition', token: '--base' }),
        expect.objectContaining({
          kind: 'fallback',
          token: '--missing',
          file: 'entry.css',
          line: 2,
        }),
        expect.objectContaining({ kind: 'fallback', token: '--also-missing' }),
      ]),
    );
    expect(contrast.provenance?.some((origin) => origin.token === '--unused')).toBe(false);
    expect(findingsFor(report.findings, 'token-resolution-review')).toEqual([]);
  });

  it('blocks conflicting, scoped, conditional and registered names instead of taking fallbacks', () => {
    for (const definitions of [
      ':root { --fg: #aaa; } :root { --fg: #000; }',
      ':root { --fg: #aaa; } .theme { --fg: #000; }',
      ':root { --fg: #aaa; } @media (prefers-color-scheme: dark) { :root { --fg: #000; } }',
      '@property --fg { syntax: "<color>"; inherits: false; initial-value: #000; }',
      ':root { --fg: #aaa; } @property --fg { syntax: "<color>"; inherits: true; initial-value: #000; }',
      ':root { --f\\67: #000; }',
    ]) {
      const report = auditProject([
        {
          file: 'entry.css',
          source: `${definitions}\n.notice { color: var(--fg, #aaa); background: white; }`,
        },
      ]);
      expect(report.status).toBe('partial');
      expect(findingsFor(report.findings, 'contrast-pair')).toEqual([]);
      expect(findingsFor(report.findings, 'contrast-review')).toHaveLength(1);
      expect(findingsFor(report.findings, 'token-resolution-review').length).toBeGreaterThan(0);
    }
  });

  it('keeps supplied context explicit and prevents it from hiding blocked source definitions', () => {
    const tokens = { '--tf-color-foreground': '#aaa' };
    const provided = auditProject(
      [
        {
          file: 'entry.css',
          source: '.notice { color: var(--tf-color-foreground); background: white; }',
        },
      ],
      { tokens },
    );
    expect(findingsFor(provided.findings, 'contrast-pair')[0]?.provenance).toContainEqual(
      expect.objectContaining({ kind: 'provided', token: '--tf-color-foreground' }),
    );
    const source = auditProject(
      [
        {
          file: 'entry.css',
          source:
            ':root { --tf-color-foreground: #aaa; } .notice { color: var(--tf-color-foreground); background: white; }',
        },
      ],
      { tokens: { '--tf-color-foreground': '#000' } },
    );
    const issue = findingsFor(source.findings, 'contrast-pair')[0]!;
    expect(issue.provenance).toContainEqual(
      expect.objectContaining({
        kind: 'definition',
        token: '--tf-color-foreground',
        file: 'entry.css',
      }),
    );
    expect(issue.provenance?.some((origin) => origin.kind === 'provided')).toBe(false);
    const blocked = auditProject(
      [
        {
          file: 'entry.css',
          source:
            '.theme { --tf-color-foreground: #000; } .notice { color: var(--tf-color-foreground, #aaa); background: white; }',
        },
      ],
      { tokens },
    );
    expect(findingsFor(blocked.findings, 'contrast-pair')).toEqual([]);
    expect(findingsFor(blocked.findings, 'contrast-review')).toHaveLength(1);
  });

  it('isolates sibling roots and deduplicates a shared diamond dependency', () => {
    const isolated = auditProject([
      { file: 'entry.css', source: '.notice { color: var(--fg, #aaa); background: white; }' },
      { file: 'sibling.css', source: ':root { --fg: #000; }' },
    ]);
    const fallback = findingsFor(isolated.findings, 'contrast-pair')[0]!;
    expect(fallback.provenance).toContainEqual(
      expect.objectContaining({ kind: 'fallback', token: '--fg', file: 'entry.css' }),
    );
    expect(fallback.provenance?.some((origin) => origin.file === 'sibling.css')).toBe(false);
    const diamond = auditProject(
      [
        { file: 'entry.css', source: `@import "a.css"; @import "b.css"; ${pair}` },
        { file: 'a.css', source: '@import "shared.css";' },
        { file: 'b.css', source: '@import "shared.css";' },
        { file: 'shared.css', source: ':root { --fg: #aaa; }' },
      ],
      { roots: ['entry.css'] },
    );
    expect(diamond.status).toBe('complete');
    expect(diamond.files).toEqual(['a.css', 'b.css', 'entry.css', 'shared.css']);
    expect(diamond.imports).toHaveLength(4);
    expect(diamond.imports.every((edge) => edge.status === 'resolved')).toBe(true);
    expect(findingsFor(diamond.findings, 'contrast-pair')[0]?.provenance).toEqual([
      expect.objectContaining({ kind: 'definition', token: '--fg', file: 'shared.css' }),
    ]);
  });

  it('recognizes supported leading literal paths and reviews unsupported import syntax', () => {
    const requests = inspectCssImports(
      'styles/entry.css',
      '/* imports */ @charset "utf-8"; @import "./màu nền.css"; @import url("../fonts.css");',
    );
    expect(requests.map((request) => request.target)).toEqual(['styles/màu nền.css', 'fonts.css']);
    for (const source of [
      '@import "tokens.css" screen;',
      '@import "tokens.css" layer(theme);',
      '@import "tokens.css" supports(display: grid);',
      '.notice {} @import "tokens.css";',
      '@media screen { @import "tokens.css"; }',
      '@import "https://example.com/tokens.css";',
      '@import "//example.com/tokens.css";',
      '@import "/tokens.css";',
      '@import "../tokens.css";',
      '@import "tokens.css?v=1";',
      '@import "tokens.css#theme";',
      '@import "%74okens.css";',
      '@import "tokens.module.css";',
      '@import url("tokens.css" "other.css");',
    ]) {
      const request = inspectCssImports('entry.css', source)[0]!;
      expect(request.target).toBeUndefined();
      expect(request.reason).toEqual(expect.any(String));
    }
  });

  it('keeps missing or malformed imports incomplete while retaining literal and parse evidence', () => {
    const entry =
      '@import "tokens.css";\n:root { --fg: #aaa; } .notice { color: var(--fg, #aaa); background: white; }\n.literal { color: #aaa; background: white; }';
    for (const sources of [
      [{ file: 'entry.css', source: entry }],
      [
        { file: 'entry.css', source: entry },
        { file: 'tokens.css', source: '\n:root {' },
      ],
    ]) {
      const report = auditProject(sources, {
        roots: ['entry.css'],
        unavailable: { 'tokens.css': 'Reader refused the stylesheet' },
      });
      expect(report.status).toBe('partial');
      expect(findingsFor(report.findings, 'contrast-pair').map((finding) => finding.line)).toEqual([
        3,
      ]);
      expect(findingsFor(report.findings, 'contrast-review')).toHaveLength(1);
      if (sources.length === 1) {
        expect(report.imports[0]?.status).toBe('unresolved');
        expect(report.imports[0]?.reason).toContain('Reader refused');
      } else {
        expect(findingsFor(report.findings, 'parse-error', 'tokens.css')[0]?.line).toBe(2);
      }
    }
  });

  it('reviews import and alias cycles without using fallbacks to conceal them', () => {
    const imports = auditProject(
      [
        { file: 'entry.css', source: `@import "other.css"; :root { --fg: #aaa; } ${pair}` },
        { file: 'other.css', source: '@import "entry.css";' },
      ],
      { roots: ['entry.css'] },
    );
    expect(imports.status).toBe('partial');
    expect(imports.imports.some((edge) => edge.status === 'unresolved')).toBe(true);
    expect(findingsFor(imports.findings, 'contrast-pair')).toEqual([]);
    const aliases = auditProject([
      {
        file: 'entry.css',
        source:
          ':root { --a: var(--b); --b: var(--a); } .notice { color: var(--a, #aaa); background: white; }',
      },
    ]);
    expect(aliases.status).toBe('partial');
    expect(findingsFor(aliases.findings, 'contrast-pair')).toEqual([]);
    expect(findingsFor(aliases.findings, 'contrast-review')).toHaveLength(1);
  });

  it('enforces import and alias depth and caps expanded values', () => {
    const chain: SourceInput[] = Array.from(
      { length: AUDIT_IMPORT_LIMITS.importDepth + 2 },
      (_, index) => ({
        file: `chain-${index}.css`,
        source:
          index === AUDIT_IMPORT_LIMITS.importDepth + 1
            ? ':root { --fg: #aaa; }'
            : `@import "chain-${index + 1}.css";${index === 0 ? pair : ''}`,
      }),
    );
    const deep = auditProject(chain, { roots: ['chain-0.css'] });
    expect(deep.status).toBe('partial');
    expect(findingsFor(deep.findings, 'contrast-pair', 'chain-0.css')).toEqual([]);
    expect(
      findingsFor(
        deep.findings,
        'import-resolution-review',
        `chain-${AUDIT_IMPORT_LIMITS.importDepth}.css`,
      ).length,
    ).toBeGreaterThan(0);
    const aliases = Array.from(
      { length: AUDIT_IMPORT_LIMITS.aliasDepth + 2 },
      (_, index) => `--v${index}: ${index === 0 ? '#aaa' : `var(--v${index - 1})`};`,
    ).join('');
    const aliasReport = auditProject([
      {
        file: 'entry.css',
        source: `:root { ${aliases} } .notice { color: var(--v${AUDIT_IMPORT_LIMITS.aliasDepth + 1}); background: white; }`,
      },
    ]);
    expect(findingsFor(aliasReport.findings, 'contrast-pair')).toEqual([]);
    expect(findingsFor(aliasReport.findings, 'contrast-review')).toHaveLength(1);
    const expansion = [
      `--v0: "${'A'.repeat(64)}";`,
      ...Array.from(
        { length: 10 },
        (_, index) => `--v${index + 1}: var(--v${index}) var(--v${index});`,
      ),
    ].join('');
    const expanded = auditProject([
      { file: 'entry.css', source: `:root { ${expansion} } .notice { font-family: var(--v10); }` },
    ]);
    expect(expanded.status).toBe('partial');
    expect(findingsFor(expanded.findings, 'token-resolution-review').length).toBeGreaterThan(0);
    expect(findingsFor(expanded.findings, 'font-fallback')).toEqual([]);
  });

  it('enforces supplied file, edge, definition and UTF-8 byte budgets', () => {
    const files = Array.from({ length: AUDIT_IMPORT_LIMITS.files }, (_, index) => ({
      file: `file-${index}.css`,
      source: '',
    }));
    expect(auditProject(files).files).toHaveLength(AUDIT_IMPORT_LIMITS.files);
    expect(() => auditProject([...files, { file: 'overflow.css', source: '' }])).toThrow();
    const imports = '@import "tokens.css";'.repeat(AUDIT_IMPORT_LIMITS.imports);
    const imported = [
      { file: 'entry.css', source: imports },
      { file: 'tokens.css', source: '' },
    ];
    expect(auditProject(imported, { roots: ['entry.css'] }).imports).toHaveLength(
      AUDIT_IMPORT_LIMITS.imports,
    );
    expect(() =>
      auditProject(
        [{ file: 'entry.css', source: `${imports}@import "tokens.css";` }, imported[1]!],
        { roots: ['entry.css'] },
      ),
    ).toThrow();
    const definitions = Array.from(
      { length: AUDIT_IMPORT_LIMITS.definitions },
      (_, index) => `--v${index}: 0;`,
    ).join('');
    expect(auditProject([{ file: 'entry.css', source: `:root { ${definitions} }` }]).status).toBe(
      'complete',
    );
    expect(() =>
      auditProject([{ file: 'entry.css', source: `:root { ${definitions} --overflow: 0; }` }]),
    ).toThrow();
    const unicode = `/*${'é'.repeat(AUDIT_IMPORT_LIMITS.fileBytes / 2)}*/`;
    expect(unicode.length).toBeLessThan(AUDIT_IMPORT_LIMITS.fileBytes);
    expect(() => auditProject([{ file: 'entry.css', source: unicode }])).toThrow();
    const fullFile = `/*${'a'.repeat(AUDIT_IMPORT_LIMITS.fileBytes - 4)}*/`;
    const aggregate = Array.from(
      { length: AUDIT_IMPORT_LIMITS.totalBytes / AUDIT_IMPORT_LIMITS.fileBytes + 1 },
      (_, index) => ({ file: `large-${index}.css`, source: fullFile }),
    );
    expect(() => auditProject(aggregate)).toThrow();
  });

  it('keeps reports deterministic across supplied source and root order', () => {
    const sources = [
      { file: 'entry.css', source: `@import "tokens.css"; ${pair}` },
      { file: 'other.css', source: '.other { font-family: "Inter"; }' },
      { file: 'tokens.css', source: ':root { --fg: #aaa; }' },
    ];
    expect(auditProject(sources, { roots: ['entry.css', 'other.css'] })).toEqual(
      auditProject([...sources].reverse(), { roots: ['other.css', 'entry.css'] }),
    );
  });

  it('uses entry definitions in imported components with entry and definition provenance', () => {
    const report = auditProject(
      [
        {
          file: 'entry.css',
          source: '@import "components/card.css";\n:root { --fg: #aaa; --font: "Inter"; }',
        },
        {
          file: 'components/card.css',
          source: '.card { color: var(--fg); background: white; font-family: var(--font); }',
        },
      ],
      { roots: ['entry.css'] },
    );
    expect(report.status).toBe('complete');
    expect(report.contexts).toEqual([
      { entry: 'entry.css', files: ['components/card.css', 'entry.css'], complete: true },
    ]);
    const contrast = findingsFor(report.findings, 'contrast-pair', 'components/card.css')[0]!;
    expect(contrast.entries).toEqual(['entry.css']);
    expect(contrast.provenance).toContainEqual(
      expect.objectContaining({ kind: 'definition', token: '--fg', file: 'entry.css', line: 2 }),
    );
    expect(
      findingsFor(report.findings, 'font-fallback', 'components/card.css')[0]?.provenance,
    ).toContainEqual(
      expect.objectContaining({ kind: 'definition', token: '--font', file: 'entry.css', line: 2 }),
    );
    expect(findingsFor(report.findings, 'token-resolution-review', 'components/card.css')).toEqual(
      [],
    );
  });

  it('separates shared consumers by entry while merging identical literal evidence', () => {
    const report = auditProject(
      [
        { file: 'a.css', source: '@import "component.css"; :root { --fg: #aaa; }' },
        { file: 'b.css', source: '@import "component.css"; :root { --fg: #bbb; }' },
        {
          file: 'component.css',
          source: `${pair}\n.literal { color: #ccc; background: white; }`,
        },
      ],
      { roots: ['b.css', 'a.css'] },
    );
    expect(report.contexts.every((context) => context.complete)).toBe(true);
    const findings = findingsFor(report.findings, 'contrast-pair', 'component.css');
    const variablePairs = findings.filter((finding) => finding.line === 1);
    expect(variablePairs).toHaveLength(2);
    for (const [entry, color] of [
      ['a.css', '#aaa'],
      ['b.css', '#bbb'],
    ]) {
      const issue = variablePairs.find((finding) => finding.entries?.includes(entry!))!;
      expect(issue.entries).toEqual([entry]);
      expect(issue.explanation).toContain(color);
      expect(issue.provenance).toContainEqual(
        expect.objectContaining({ kind: 'definition', token: '--fg', file: entry }),
      );
      expect(issue.provenance?.every((origin) => origin.file === entry)).toBe(true);
    }
    expect(findings.find((finding) => finding.line === 2)?.entries).toEqual(['a.css', 'b.css']);
  });

  it('reviews escaped at-rule names and selected CSS Modules without proving variable pairs', () => {
    for (const input of [
      { file: 'entry.css', source: `@im\\70ort "tokens.css"; :root { --fg: #aaa; } ${pair}` },
      {
        file: 'entry.css',
        source:
          '@prop\\65rty --fg { syntax: "<color>"; inherits: false; initial-value: #000; } .notice { color: var(--fg, #aaa); background: white; }',
      },
      { file: 'entry.module.css', source: `:root { --fg: #aaa; } ${pair}` },
    ]) {
      const report = auditProject([input]);
      expect(report.status).toBe('partial');
      expect(report.contexts[0]?.complete).toBe(false);
      expect(findingsFor(report.findings, 'stylesheet-context-review', input.file)).toHaveLength(1);
      expect(findingsFor(report.findings, 'contrast-pair', input.file)).toEqual([]);
      expect(findingsFor(report.findings, 'contrast-review', input.file)).toHaveLength(1);
    }
  });

  it('does not join substituted tokens into a new valid color', () => {
    const report = auditProject([
      {
        file: 'entry.css',
        source: ':root { --fg: #aaa; } .notice { color: var(--fg)fff; background: white; }',
      },
    ]);
    expect(findingsFor(report.findings, 'contrast-pair')).toEqual([]);
    expect(findingsFor(report.findings, 'contrast-review')).toHaveLength(1);
  });

  it('does not report a missing generic fallback for case-insensitive variable functions', () => {
    const report = auditProject([
      {
        file: 'entry.css',
        source: ':root { --font: serif; } .notice { font-family: VAR(--font); }',
      },
    ]);
    expect(findingsFor(report.findings, 'font-fallback')).toEqual([]);
  });

  it('validates cycles and variable grammar in unused custom-property fallbacks', () => {
    for (const definition of [
      '--fg: var(--base, var(--fg));',
      '--fg: var(--base, var(--other)); --other: var(--fg);',
      '--fg: var(--base, var(invalid));',
    ]) {
      const report = auditProject([
        { file: 'entry.css', source: `:root { --base: #aaa; ${definition} } ${pair}` },
      ]);
      expect(findingsFor(report.findings, 'contrast-pair')).toEqual([]);
      expect(findingsFor(report.findings, 'contrast-review')).toHaveLength(1);
    }
  });

  it('reuses equivalent shared contexts and rejects excessive distinct contexts', () => {
    const sharedCount = 20;
    const shared = Array.from({ length: sharedCount }, (_, index) => ({
      file: `shared-${index}.css`,
      source: index === 0 ? '.literal { color: #aaa; background: white; }' : '',
    }));
    const imports = shared.map(({ file }) => `@import "${file}";`).join('');
    const entries = Array.from({ length: 40 }, (_, index) => ({
      file: `entry-${index}.css`,
      source: imports,
    }));
    expect(entries.length * (sharedCount + 1)).toBeGreaterThan(AUDIT_IMPORT_LIMITS.contexts);
    const reused = auditProject([...entries, ...shared], {
      roots: entries.map(({ file }) => file),
    });
    expect(reused.status).toBe('complete');
    expect(reused.contexts).toHaveLength(entries.length);
    expect(findingsFor(reused.findings, 'contrast-pair', 'shared-0.css')[0]?.entries).toEqual(
      entries.map(({ file }) => file).sort(),
    );

    const distinctCount = Math.floor(Math.sqrt(AUDIT_IMPORT_LIMITS.contexts)) + 1;
    const components = Array.from({ length: distinctCount }, (_, index) => ({
      file: `component-${index}.css`,
      source: '',
    }));
    const distinctImports = components.map(({ file }) => `@import "${file}";`).join('');
    const distinctEntries = Array.from({ length: distinctCount }, (_, index) => ({
      file: `context-${index}.css`,
      source: `${distinctImports}:root { --fg: #aaa; }`,
    }));
    expect(distinctEntries.length * (distinctCount + 1)).toBeGreaterThan(
      AUDIT_IMPORT_LIMITS.contexts,
    );
    expect(() =>
      auditProject([...distinctEntries, ...components], {
        roots: distinctEntries.map(({ file }) => file),
      }),
    ).toThrow();
  });

  it('preserves the source-only audit and rejects unsupported project inputs', () => {
    const source = '@import "tokens.css"; .notice { color: var(--fg); background: white; }';
    expect(
      auditSource('entry.css', source).some((finding) => finding.ruleId === 'contrast-review'),
    ).toBe(true);
    expect(auditSource('entry.css', source).every((finding) => !('provenance' in finding))).toBe(
      true,
    );
    for (const file of [
      '../entry.css',
      '/entry.css',
      'styles/../entry.css',
      'entry.tsx',
      'C:\\entry.css',
    ]) {
      expect(() => auditProject([{ file, source: '' }])).toThrow();
    }
    expect(() =>
      auditProject([
        { file: 'entry.css', source: '' },
        { file: 'entry.css', source: '' },
      ]),
    ).toThrow();
    expect(() =>
      auditProject([{ file: 'entry.css', source: '' }], { roots: ['missing.css'] }),
    ).toThrow();
  });
});
