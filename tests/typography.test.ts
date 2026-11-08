import { describe, expect, it } from 'vitest';
import { knowledge, knowledgeSchema } from '../packages/knowledge/src/index.js';
import {
  createDesignDNA,
  defaultBrief,
  selectDirection,
  suggest,
} from '../packages/core/src/index.js';

const additions = [
  ['newsreader-source', 'contemporary-editorial'],
  ['fraunces-source', 'warm-commerce'],
  ['archivo-archivo', 'international-typographic'],
  ['barlow-barlow', 'technical-minimalism'],
  ['figtree-figtree', 'soft-utility'],
  ['bitter-source', 'learning-studio'],
] as const;

describe('reviewed typography additions', () => {
  it.each(additions)('makes %s reachable with a fixed pair and reproducible seed', (id, style) => {
    const brief = {
      ...defaultBrief,
      seed: 17,
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        allowedDirections: [style],
        fontPairId: id,
      },
    };
    const [direction] = suggest(brief, { count: 1 });
    expect(direction!.fontPair.id).toBe(id);
    expect(direction).toEqual(selectDirection(brief, style));
    expect(createDesignDNA(brief, direction!).direction.fontPair.id).toBe(id);
    expect(knowledgeSchema.safeParse(knowledge).success).toBe(true);
  });

  it('excludes optional web additions under system-only delivery, including a fixed pair', () => {
    const brief = {
      ...defaultBrief,
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        fontDelivery: 'system',
        maxComplexity: 'high',
      },
    };
    for (const direction of suggest(brief, { count: 20 })) {
      expect(direction.fontPair.delivery).toBe('system');
    }
    for (const [id] of additions) {
      expect(() =>
        suggest({
          ...brief,
          existingConstraints: { ...brief.existingConstraints, fontPairId: id },
        }),
      ).toThrow(/No compatible font pair/);
    }
  });

  it('keeps verified language restrictions strict for an English-only family', () => {
    const brief = {
      ...defaultBrief,
      accessibility: { ...defaultBrief.accessibility, languages: ['en', 'vi'] },
      existingConstraints: {
        ...defaultBrief.existingConstraints,
        allowedDirections: ['soft-utility'],
        fontPairId: 'figtree-figtree',
      },
    };
    expect(() => suggest(brief, { count: 1 })).toThrow(/No compatible font pair/);
    for (const [id, style] of additions.filter(([id]) => id !== 'figtree-figtree')) {
      expect(
        selectDirection(
          {
            ...brief,
            existingConstraints: {
              ...brief.existingConstraints,
              allowedDirections: [style],
              fontPairId: id,
            },
          },
          style,
        ).fontPair.id,
      ).toBe(id);
    }
  });
});
