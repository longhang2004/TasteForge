import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  referenceCatalog,
  referenceCatalogSchema,
  requiredGates,
} from '../packages/knowledge/src/references.js';
import {
  catalogStats,
  getReference,
  inspire,
  listReferences,
} from '../packages/core/src/references.js';
import { defaultBrief } from '../packages/core/src/schemas.js';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

describe('attributed offline reference catalog', () => {
  it('binds every entry to a pinned licensed input and verifies content and notices', async () => {
    const lock = JSON.parse(
      await readFile(new URL('../packages/knowledge/reference-lock.json', import.meta.url), 'utf8'),
    ) as { files: { sourceId: string; path: string; sha256: string }[] };
    for (const entry of referenceCatalog.entries) {
      expect(hash(entry.content)).toBe(entry.contentSha256);
      expect(
        lock.files.find((f) => f.sourceId === entry.sourceId && f.path === entry.sourcePath)
          ?.sha256,
      ).toBe(entry.inputSha256);
      const source = referenceCatalog.sources.find((s) => s.id === entry.sourceId)!;
      expect(entry.url).toContain(`/blob/${source.revision}/`);
    }
    for (const source of referenceCatalog.sources) {
      const notice = await readFile(
        new URL(`../packages/knowledge/third-party/${source.id}.LICENSE.txt`, import.meta.url),
        'utf8',
      );
      expect(source.licenseText).toBe(notice);
      expect(hash(notice)).toBe(source.licenseSha256);
    }
    const voltPaths = lock.files
      .filter((f) => f.sourceId === 'volt' && f.path.endsWith('/DESIGN.md'))
      .map((f) => f.path)
      .sort();
    expect(
      referenceCatalog.entries
        .filter((e) => e.sourceId === 'volt')
        .map((e) => e.sourcePath)
        .sort(),
    ).toEqual(voltPaths);
    expect(voltPaths.length).toBeGreaterThan(50);
  });
  it('rejects duplicate IDs, dangling sources and duplicate references', () => {
    for (const mutation of [
      (c: typeof referenceCatalog) => c.entries.push(c.entries[0]!),
      (c: typeof referenceCatalog) => {
        c.entries[0]!.sourceId = 'missing-source';
      },
      (c: typeof referenceCatalog) => {
        c.entries[0]!.duplicateOf = 'missing-entry';
      },
    ]) {
      const catalog = structuredClone(referenceCatalog);
      mutation(catalog);
      expect(referenceCatalogSchema.safeParse(catalog).success).toBe(false);
    }
  });
  it('searches, paginates and discloses full text and license on explicit lookup', () => {
    const first = listReferences({ kind: 'style', source: 'volt', limit: 2 });
    const second = listReferences({ kind: 'style', source: 'volt', limit: 2, offset: 2 });
    expect(first.entries).toHaveLength(2);
    expect(first.entries[0]!.id).not.toBe(second.entries[0]!.id);
    expect(first.entries[0]).not.toHaveProperty('content');
    expect(listReferences({ query: 'wise' }).entries.some((e) => e.id === 'volt-wise')).toBe(true);
    const doc = getReference('volt-wise');
    expect(doc.entry.content.length).toBeGreaterThan(1000);
    expect(doc.source.license).toBe('MIT');
    expect(doc.trust).toContain('Untrusted');
    expect(() => getReference('missing-reference')).toThrow(/Unknown reference ID/);
    expect(() => listReferences({ source: 'missing' })).toThrow(/Unknown reference source/);
    expect(catalogStats().counts.style).toBeGreaterThan(100);
  });
});

describe('task-aware seeded reference exploration', () => {
  it('routes task pages before theme names and honors operational avoid guidance', () => {
    const dashboard = listReferences({ kind: 'template', task: 'dashboard', limit: 100 });
    expect(dashboard.entries.length).toBeGreaterThan(0);
    for (const entry of dashboard.entries) {
      expect(entry.sourcePath).not.toMatch(/404|500|login|register|password/);
      expect(entry.sourcePath).not.toBe('src/ui-ux-pro-max/data/landing.csv');
    }
    const error = getReference('template-adminlte-pages-examples-404');
    expect(error.entry.tasks).toEqual([]);
    const login = getReference('template-adminlte-pages-examples-login');
    expect(login.entry.tasks).toEqual(['form']);
    expect(
      referenceCatalog.entries
        .filter((e) => e.sourcePath.endsWith('/landing.csv'))
        .every((e) => e.tasks.length === 1 && e.tasks[0] === 'marketing'),
    ).toBe(true);
    const brief = {
      ...defaultBrief,
      audience: ['warehouse operators'],
      goals: ['Triage stock shortages'],
    };
    const result = inspire(brief, { task: 'dashboard', count: 20, seed: 42 });
    expect(
      result.excluded.some(
        (e) => e.id === 'promax-styles-predictive-analytics' && e.reason.includes('operational'),
      ),
    ).toBe(true);
    expect(
      result.inspirations.some((p) => p.style.id === 'promax-styles-predictive-analytics'),
    ).toBe(false);
  });
  it('reproduces complete packs independent of input order and changes across seeds', () => {
    const a = inspire(defaultBrief, { task: 'commerce', seed: 42 });
    expect(a).toEqual(inspire(defaultBrief, { task: 'commerce', seed: 42 }));
    const reordered = structuredClone(referenceCatalog);
    reordered.entries.reverse();
    reordered.sources.reverse();
    expect(a).toEqual(inspire(defaultBrief, { task: 'commerce', seed: 42, catalog: reordered }));
    expect(a.inspirations.map((p) => p.style.id)).not.toEqual(
      inspire(defaultBrief, { task: 'commerce', seed: 43 }).inspirations.map((p) => p.style.id),
    );
    expect(new Set(a.inspirations.map((p) => p.style.id)).size).toBe(3);
    for (const pack of a.inspirations) {
      expect(pack.template?.kind).toBe('template');
      expect(pack.template?.tasks).toContain('commerce');
    }
  });
  it('keeps every baseline gate across seeds and sample counts, while filtering retired/high-risk/known complex styles', () => {
    const brief = {
      ...defaultBrief,
      existingConstraints: { ...defaultBrief.existingConstraints, maxComplexity: 'low' },
    };
    for (const seed of [0, 1, 42, 4294967295]) {
      const result = inspire(brief, { task: 'dashboard', seed, count: 1 });
      expect(result.requiredGates).toEqual(requiredGates);
      for (const pack of result.inspirations) {
        expect(pack.style.status).toBe('active');
        expect(pack.style.risk).not.toBe('high');
        expect(['unknown', 'low']).toContain(pack.style.complexity);
        expect(pack.style.duplicateOf).toBeUndefined();
      }
    }
    expect(
      inspire(defaultBrief, { task: 'dashboard', source: 'promax' }).inspirations.every(
        (p) => p.style.sourceId === 'promax',
      ),
    ).toBe(true);
  });
  it('never substitutes a different task when the catalog has no matching template', () => {
    const catalog = structuredClone(referenceCatalog);
    catalog.entries = catalog.entries.filter((e) => e.kind !== 'template');
    const result = inspire(defaultBrief, { task: 'learning', catalog });
    expect(result.inspirations.every((p) => p.template === null)).toBe(true);
    expect(result.limitations.some((s) => s.includes('No indexed template'))).toBe(true);
  });
  it('preserves impossible generator constraints as explicitly unverified inspiration rather than fabricating tokens', () => {
    const brief = {
      ...defaultBrief,
      accessibility: { ...defaultBrief.accessibility, languages: ['en', 'vi'] },
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        fontDelivery: 'system',
        fontPairId: 'inter-inter',
        paletteId: 'mono-dark',
        density: 'dense',
      },
    };
    const result = inspire(brief, { task: 'form' });
    expect(result.accessibility.languages).toEqual(['en', 'vi']);
    expect(result.constraints).toEqual(brief.existingConstraints);
    expect(result.assessment).toBe('heuristic-reference-fit-not-validated-design');
    expect(result).not.toHaveProperty('tokens');
    expect(result).not.toHaveProperty('designDNA');
    expect(result.limitations.some((s) => s.includes('not generate direction IDs'))).toBe(true);
  });
  it('protects existing systems and restricted direction pools, and rejects invalid options', () => {
    const protectedBrief = {
      ...defaultBrief,
      existingConstraints: { ...defaultBrief.existingConstraints, designSystem: 'Existing tokens' },
    };
    expect(() => inspire(protectedBrief, { task: 'form' })).toThrow(/protected/);
    expect(() =>
      inspire(
        {
          ...defaultBrief,
          existingConstraints: { ...defaultBrief.existingConstraints, allowedDirections: [] },
        },
        { task: 'form' },
      ),
    ).toThrow(/allowedDirections/);
    for (const options of [
      { task: 'anything' },
      { task: 'form', count: 0 },
      { task: 'form', seed: -1 },
      { task: 'form', source: 'missing' },
    ])
      expect(() => inspire(defaultBrief, options)).toThrow();
  });
});
