import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  compositionLibrary,
  compositionLibrarySchema,
} from '../packages/knowledge/src/compositions.js';
import { referenceCatalog } from '../packages/knowledge/src/references.js';
import { inspire } from '../packages/core/src/references.js';
import { defaultBrief } from '../packages/core/src/schemas.js';

describe('original composition evidence and selection', () => {
  it('binds inspected source pointers to revision/path/hash evidence without claiming rendered upstream behavior', async () => {
    const manifest = JSON.parse(
      await readFile(
        new URL('../examples/composition-library/source-manifest.json', import.meta.url),
        'utf8',
      ),
    ) as {
      inputs: { revision: string; path: string; sha256: string; licenseUrl: string }[];
    };
    for (const source of compositionLibrary.sources) {
      const input = manifest.inputs.find(
        (f) => f.revision === source.revision && f.path === source.path,
      );
      expect(input?.sha256).toBe(source.inputSha256);
      expect(source.pinnedUrl).toContain(source.revision);
      expect(source.licenseUrl).toContain(source.revision);
      expect(source.observed.length).toBeGreaterThan(0);
      expect(source.notObserved.length).toBeGreaterThan(0);
    }
    for (const group of ['work', 'commerce', 'reading', 'exploration'])
      expect(compositionLibrary.entries.some((e) => e.group === group)).toBe(true);
    for (const mutate of [
      (c: typeof compositionLibrary) => c.entries.push(c.entries[0]!),
      (c: typeof compositionLibrary) => {
        c.entries[0]!.sourceIds = ['missing-source'];
      },
    ]) {
      const invalid = structuredClone(compositionLibrary);
      mutate(invalid);
      expect(compositionLibrarySchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('reproduces complete packs after composition/source reordering and filters fixed density/complexity', () => {
    const reordered = structuredClone(compositionLibrary);
    reordered.entries.reverse();
    reordered.sources.reverse();
    expect(inspire(defaultBrief, { task: 'commerce', compositionLibrary: reordered })).toEqual(
      inspire(defaultBrief, { task: 'commerce' }),
    );
    const restricted = structuredClone(compositionLibrary);
    restricted.entries = [
      { ...restricted.entries[0]!, tasks: ['commerce'], density: 'dense', complexity: 'high' },
    ];
    const low = inspire(
      {
        ...defaultBrief,
        existingConstraints: {
          ...defaultBrief.existingConstraints,
          maxComplexity: 'low',
          density: 'dense',
        },
      },
      { task: 'commerce', count: 1, compositionLibrary: restricted },
    );
    expect(low.inspirations[0]!.composition).toBeNull();
    expect(low.compositionExclusions[0]?.reason).toContain('Complexity');
    const wrongDensity = inspire(
      {
        ...defaultBrief,
        existingConstraints: {
          ...defaultBrief.existingConstraints,
          maxComplexity: 'high',
          density: 'spacious',
        },
      },
      { task: 'commerce', count: 1, compositionLibrary: restricted },
    );
    expect(wrongDensity.inspirations[0]!.composition).toBeNull();
    expect(wrongDensity.compositionExclusions[0]?.reason).toContain('Density');
    const fitting = inspire(
      {
        ...defaultBrief,
        existingConstraints: {
          ...defaultBrief.existingConstraints,
          maxComplexity: 'high',
          density: 'dense',
        },
      },
      { task: 'commerce', count: 1, compositionLibrary: restricted },
    );
    expect(fitting.inspirations[0]!.composition?.id).toBe(restricted.entries[0]!.id);
    const unsupported = inspire(defaultBrief, { task: 'marketing', count: 1 });
    expect(unsupported.inspirations[0]!.composition).toBeNull();
  });

  it('softly reduces repeated known visual families while allowing repeat treatments', () => {
    const catalog = structuredClone(referenceCatalog);
    const base = catalog.entries.find((e) => e.kind === 'style')!;
    catalog.sources = [catalog.sources.find((s) => s.id === base.sourceId)!];
    catalog.entries = [
      'Minimal A',
      'Minimal B',
      'Minimal C',
      'Organic A',
      'Organic B',
      'Organic C',
    ].map((title, i) => ({
      ...base,
      id: `sample-style-${i}`,
      title,
      summary: 'Visual reference',
      tags: [],
      tasks: ['commerce'],
      duplicateOf: undefined,
      status: 'active',
      risk: 'unassessed',
      complexity: 'low',
    }));
    let oneFamilyPacks = 0;
    for (let seed = 0; seed < 128; seed++) {
      const result = inspire(
        { ...defaultBrief, creativity: 1 },
        { task: 'commerce', count: 3, seed, catalog },
      );
      const families = result.inspirations.map((p) => p.fit.visualFamily);
      if (new Set(families).size === 1) oneFamilyPacks++;
      expect(result.inspirations.some((p) => p.fit.familyRepeatPenalty < 1)).toBe(true);
    }
    // Without repeat weighting, uniform draws from this balanced six-style pool
    // put all three choices in one family about one time in ten. The fixed seed
    // sweep checks the intended reduction, rather than an exact chosen sequence.
    expect(oneFamilyPacks).toBeLessThan(8);
    expect(oneFamilyPacks).toBeGreaterThan(0);
  });
});
