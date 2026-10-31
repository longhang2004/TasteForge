import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  knowledge,
  knowledgeSchema,
  styleSchema,
  fontPairSchema,
  paletteSchema,
  principleSchema,
  antiPatternSchema,
} from '../packages/knowledge/src/index.js';
import {
  briefSchema,
  defaultBrief,
  filterDirections,
  rankDirections,
  suggest,
  selectDirection,
  createRandom,
  contrast,
  createDesignDNA,
  validateDNA,
  renderTokens,
  renderDesign,
  configSchema,
} from '../packages/core/src/index.js';

describe('validated context and knowledge', () => {
  it('requires meaningful context and rejects unknown or unsupported inputs', () => {
    for (const bad of [
      {},
      { ...defaultBrief, creativity: 2 },
      { ...defaultBrief, productType: ' ' },
      { ...defaultBrief, accessibility: { languages: ['ja'] } },
      { ...defaultBrief, extra: true },
      { ...defaultBrief, seed: -1 },
    ])
      expect(briefSchema.safeParse(bad).success).toBe(false);
    expect(briefSchema.parse(defaultBrief)).toEqual(defaultBrief);
  });
  it('validates every curated entry and all references', () => {
    expect(knowledge.styles.length).toBeGreaterThanOrEqual(20);
    expect(knowledge.fontPairs.length).toBeGreaterThanOrEqual(30);
    expect(knowledge.palettes.length).toBeGreaterThanOrEqual(20);
    for (const entry of knowledge.styles) expect(styleSchema.safeParse(entry).success).toBe(true);
    for (const entry of knowledge.fontPairs)
      expect(fontPairSchema.safeParse(entry).success).toBe(true);
    for (const entry of knowledge.palettes)
      expect(paletteSchema.safeParse(entry).success).toBe(true);
    for (const entry of knowledge.principles)
      expect(principleSchema.safeParse(entry).success).toBe(true);
    for (const entry of knowledge.antiPatterns)
      expect(antiPatternSchema.safeParse(entry).success).toBe(true);
    expect(knowledgeSchema.safeParse(knowledge).success).toBe(true);
  });
  it('rejects duplicate IDs, dangling references, malformed colors and entries', () => {
    const duplicate = structuredClone(knowledge);
    duplicate.styles.push(duplicate.styles[0]!);
    expect(knowledgeSchema.safeParse(duplicate).success).toBe(false);
    duplicate.styles.pop();
    duplicate.styles[0]!.fontPairIds = ['missing-font'];
    expect(knowledgeSchema.safeParse(duplicate).success).toBe(false);
    expect(paletteSchema.safeParse({ ...knowledge.palettes[0], colors: {} }).success).toBe(false);
  });
  it('normalizes config defaults and requires scoring weights to sum to one', () => {
    expect(configSchema.parse({}).weights.fit).toBe(0.3);
    expect(configSchema.safeParse({ weights: { fit: 1 } }).success).toBe(false);
  });
});
describe('hard constraints and transparent ranking', () => {
  const fintech = {
    ...defaultBrief,
    productType: 'dashboard',
    industry: 'fintech',
    audience: ['experts', 'operators'],
    brandPersonality: ['precise', 'trustworthy'],
    goals: ['Compare and monitor data'],
    creativity: 0.1,
  };
  it('ranks task and audience fit rather than a universal aesthetic', () => {
    const ranked = rankDirections(fintech).ranked;
    expect(ranked[0]!.style.id).toBe('data-dense-enterprise');
    expect(ranked.find((r) => r.style.id === 'data-dense-enterprise')!.score.total).toBeGreaterThan(
      ranked.find((r) => r.style.id === 'gallery-led')!.score.total,
    );
    for (const entry of ranked) {
      const { total, ...parts } = entry.score;
      expect(total).toBeCloseTo(
        Object.entries(parts).reduce(
          (sum, [key, value]) => sum + value * entry.weights[key as keyof typeof entry.weights],
          0,
        ),
      );
      expect(entry.explanations.length).toBeGreaterThan(1);
    }
  });
  it('filters before ranking for density, complexity, allowed and excluded styles', () => {
    const input = {
      ...fintech,
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        density: 'dense',
        maxComplexity: 'low',
        excludedDirections: ['retro-computing'],
      },
    };
    expect(filterDirections(input).accepted.map((s) => s.id)).toEqual(['technical-minimalism']);
    expect(() => suggest(input, { count: 2 })).toThrow(/only 1 satisfy/);
    const allowed = {
      ...defaultBrief,
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        allowedDirections: ['swiss-editorial'],
      },
    };
    expect(suggest(allowed, { count: 1 })[0]!.style.id).toBe('swiss-editorial');
  });
  it('preserves established systems and explains incompatible constraints', () => {
    const input = {
      ...defaultBrief,
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        designSystem: 'Existing corporate tokens',
      },
    };
    expect(() => suggest(input)).toThrow(/Existing design system is protected/);
    expect(() => selectDirection(defaultBrief, 'does-not-exist')).toThrow(/Unknown direction ID/);
    expect(() =>
      selectDirection(
        {
          ...defaultBrief,
          existingConstraints: { ...defaultBrief.existingConstraints, paletteId: 'mono-dark' },
        },
        'swiss-editorial',
      ),
    ).toThrow(/No compatible palette/);
  });
  it('honors Vietnamese coverage, fixed pair, delivery and contrast constraints', () => {
    const input = {
      ...defaultBrief,
      accessibility: { ...defaultBrief.accessibility, languages: ['en', 'vi'], minContrast: 7 },
    };
    for (const d of suggest(input, { count: 3 })) {
      expect(d.fontPair.heading.languages).toContain('vi');
      expect(d.fontPair.body.languages).toContain('vi');
      const c = d.palette.colors;
      for (const [fg, bg] of [
        [c.foreground, c.background],
        [c.foreground, c.surface],
        [c.muted, c.background],
        [c.onAccent, c.accent],
      ])
        expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(7);
    }
    const system = {
      ...defaultBrief,
      existingConstraints: { ...defaultBrief.existingConstraints, fontDelivery: 'system' },
    };
    expect(suggest(system)[0]!.fontPair.delivery).toBe('system');
    expect(() => suggest({ ...system, accessibility: input.accessibility })).toThrow(
      /No compatible font pair/,
    );
    const fixed = {
      ...defaultBrief,
      existingConstraints: { ...defaultBrief.existingConstraints, fontPairId: 'inter-inter' },
    };
    expect(suggest(fixed)[0]!.fontPair.id).toBe('inter-inter');
  });
});
describe('deterministic controlled exploration', () => {
  it('has a stable PRNG stream including zero and rejects invalid seeds', () => {
    const a = createRandom(0),
      b = createRandom(0);
    expect(Array.from({ length: 10 }, a)).toEqual(Array.from({ length: 10 }, b));
    const random = createRandom(42);
    expect(random()).toBeCloseTo(0.6011037519201636, 14);
    expect(() => createRandom(-1)).toThrow();
  });
  it('reproduces complete suggestions and ignores knowledge entry ordering', () => {
    const a = suggest(defaultBrief, { seed: 42 });
    expect(a).toEqual(suggest(defaultBrief, { seed: 42 }));
    const reordered = structuredClone(knowledge);
    reordered.styles.reverse();
    reordered.fontPairs.reverse();
    reordered.palettes.reverse();
    expect(a).toEqual(suggest(defaultBrief, { seed: 42, knowledge: reordered }));
    expect(new Set(a.map((d) => d.style.id)).size).toBe(3);
    expect(a).not.toEqual(suggest(defaultBrief, { seed: 43 }));
    for (const d of a) expect(d).toEqual(selectDirection(defaultBrief, d.style.id, { seed: 42 }));
  });
  it('uses the brief seed unless explicitly overridden and rejects invalid counts', () => {
    expect(suggest({ ...defaultBrief, seed: 9 })).toEqual(suggest(defaultBrief, { seed: 9 }));
    expect(suggest({ ...defaultBrief, seed: 9 }, { seed: 42 })).toEqual(
      suggest(defaultBrief, { seed: 42 }),
    );
    for (const count of [0, -1, 21, 1.5]) expect(() => suggest(defaultBrief, { count })).toThrow();
  });
  it('low creativity concentrates on more relevant candidates across seeds', () => {
    const low = {
      ...defaultBrief,
      productType: 'dashboard',
      industry: 'fintech',
      brandPersonality: ['precise'],
      creativity: 0,
    };
    const high = { ...low, creativity: 1 };
    const sampledFit = (brief: typeof low) =>
      Array.from(
        { length: 60 },
        (_, seed) => suggest(brief, { count: 1, seed })[0]!.score.fit,
      ).reduce((a, b) => a + b, 0);
    expect(sampledFit(low)).toBeGreaterThan(sampledFit(high));
  });
});
describe('Design DNA and tokens', () => {
  it('keeps the committed example artifacts consistent with engine output', async () => {
    const read = (name: string) =>
      readFile(new URL(`../examples/generated/${name}`, import.meta.url), 'utf8');
    const dna = validateDNA(JSON.parse(await read('design-dna.json')));
    expect(renderTokens(dna.tokens)).toBe(await read('tokens.css'));
    expect(renderDesign(dna)).toBe(await read('DESIGN.md'));
  });
  it('generates mutually consistent, reproducible artifacts with recorded context', () => {
    const d = selectDirection(defaultBrief, 'swiss-editorial', { seed: 42 });
    const dna = createDesignDNA(defaultBrief, d);
    expect(validateDNA(dna)).toEqual(dna);
    expect(dna.tokens['--tf-font-body']).toBe(dna.typography.body);
    expect(dna.tokens['--tf-color-background']).toBe(dna.colors.background);
    expect(dna.spacing.map((v) => v / 16 + 'rem')).toEqual(
      dna.spacing.map((_, i) => dna.tokens[`--tf-space-${i}`]),
    );
    expect(renderTokens(dna.tokens)).toContain('prefers-reduced-motion');
    expect(renderDesign(dna)).toContain('seed 42');
    expect(createDesignDNA(defaultBrief, d)).toEqual(dna);
  });
  it('rejects inconsistent DNA, mismatched context, and unsafe CSS values', () => {
    const d = selectDirection(defaultBrief, 'swiss-editorial');
    const dna = createDesignDNA(defaultBrief, d);
    dna.tokens['--tf-color-background'] = '#ffffff';
    expect(() => validateDNA(dna)).toThrow(/inconsistent/);
    expect(() =>
      createDesignDNA(
        {
          ...defaultBrief,
          existingConstraints: {
            ...defaultBrief.existingConstraints,
            excludedDirections: ['swiss-editorial'],
          },
        },
        d,
      ),
    ).toThrow();
    expect(() => renderTokens({ '--tf-color-accent': 'red; } body { color: blue' })).toThrow(
      /Unsafe/,
    );
    expect(() => renderTokens({ '--tf-image': 'url(https://example.com)' })).toThrow(/Unsafe/);
  });
  it('preserves nondefault scoring configuration in DNA', () => {
    const weights = { fit: 1, brand: 0, usability: 0, technical: 0, distinctiveness: 0 };
    const d = selectDirection(defaultBrief, 'swiss-editorial', { weights });
    expect(validateDNA(createDesignDNA(defaultBrief, d)).direction.weights).toEqual(weights);
  });
});
