import { z } from 'zod';
import { knowledge, knowledgeSchema, type Knowledge, type Style } from '@tasteforge/knowledge';
import {
  briefSchema,
  directionSchema,
  seedSchema,
  weightsSchema,
  ENGINE_VERSION,
  type Brief,
  type Direction,
} from './schemas.js';
import { contrast } from './color.js';
import { createRandom, deriveSeed, weightedIndex } from './random.js';

const order = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const aliases: Record<string, string> = {
  'e-commerce': 'commerce',
  ecommerce: 'commerce',
  saas: 'service',
  finance: 'fintech',
  clear: 'direct',
  developer: 'experts',
  developers: 'experts',
  accessible: 'inclusive',
};
function normalize(value: string): string {
  const key = value.trim().toLowerCase();
  return aliases[key] ?? key;
}
function affinity(tags: string[], input: string[]): number {
  const wanted = new Set(
    input.flatMap((s) => [
      normalize(s),
      ...s
        .toLowerCase()
        .split(/[^a-z-]+/)
        .map(normalize),
    ]),
  );
  const matches = tags.filter((tag) => wanted.has(normalize(tag))).length;
  return Math.min(1, matches / Math.min(2, input.length));
}
function combinations(brief: Brief, style: Style, kb: Knowledge) {
  const c = brief.existingConstraints;
  const fonts = kb.fontPairs
    .filter(
      (font) =>
        style.fontPairIds.includes(font.id) &&
        (!c.fontPairId || c.fontPairId === font.id) &&
        (c.fontDelivery === 'any' || font.delivery === 'system') &&
        brief.accessibility.languages.every(
          (language) =>
            font.heading.languages.includes(language) && font.body.languages.includes(language),
        ),
    )
    .sort(order);
  const palettes = kb.palettes
    .filter((palette) => {
      if (!style.paletteIds.includes(palette.id) || (c.paletteId && c.paletteId !== palette.id))
        return false;
      const p = palette.colors;
      return [
        [p.foreground, p.background],
        [p.foreground, p.surface],
        [p.muted, p.background],
        [p.muted, p.surface],
        [p.onAccent, p.accent],
      ].every(([fg, bg]) => contrast(fg!, bg!) >= brief.accessibility.minContrast);
    })
    .sort(order);
  return { fonts, palettes };
}
function exclusion(brief: Brief, style: Style, kb: Knowledge): string | undefined {
  const c = brief.existingConstraints;
  if (c.preserveExisting && c.designSystem?.trim())
    return 'Existing design system is protected; use refinement or explicitly authorize redesign before setting preserveExisting=false.';
  if (c.allowedDirections && !c.allowedDirections.includes(style.id))
    return 'Not in allowedDirections';
  if (c.excludedDirections.includes(style.id)) return 'In excludedDirections';
  if (c.density && c.density !== style.density) return `Requires ${c.density} density`;
  if (
    ['low', 'medium', 'high'].indexOf(style.complexity) >
    ['low', 'medium', 'high'].indexOf(c.maxComplexity)
  )
    return 'Exceeds maxComplexity';
  const { fonts, palettes } = combinations(brief, style, kb);
  if (!fonts.length)
    return 'No compatible font pair for language, delivery, or fixed font constraints';
  if (!palettes.length) return 'No compatible palette meets contrast or fixed palette constraints';
  return undefined;
}
export function filterDirections(input: unknown, source: Knowledge = knowledge) {
  const brief = briefSchema.parse(input);
  const kb = knowledgeSchema.parse(source);
  const accepted: Style[] = [];
  const rejected: { id: string; reason: string }[] = [];
  for (const style of [...kb.styles].sort(order)) {
    const reason = exclusion(brief, style, kb);
    if (reason) rejected.push({ id: style.id, reason });
    else accepted.push(style);
  }
  return { accepted, rejected };
}
export function rankDirections(
  input: unknown,
  options: { knowledge?: Knowledge; weights?: unknown } = {},
) {
  const brief = briefSchema.parse(input);
  const kb = knowledgeSchema.parse(options.knowledge ?? knowledge);
  const weights = weightsSchema.parse(options.weights ?? {});
  const { accepted, rejected } = filterDirections(brief, kb);
  const ranked = accepted
    .map((style) => {
      const fit =
        (affinity(style.productTypes, [brief.productType]) +
          affinity(style.industries, [brief.industry])) /
        2;
      const brand = affinity(style.personalities, brief.brandPersonality);
      const goalText = brief.goals.join(' ').toLowerCase();
      const densityFit = /compare|monitor|analy[sz]|data|scan/.test(goalText)
        ? style.density === 'dense'
          ? 1
          : 0.5
        : style.density === 'dense'
          ? 0.5
          : 1;
      const usability = 0.7 * affinity(style.audienceTags, brief.audience) + 0.3 * densityFit;
      const technical = style.complexity === 'low' ? 1 : style.complexity === 'medium' ? 0.75 : 0.5;
      const distinctiveness = 1 - Math.abs(brief.creativity - style.distinctiveness);
      const parts = { fit, brand, usability, technical, distinctiveness };
      const total = Math.min(
        1,
        Object.entries(parts).reduce(
          (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
          0,
        ),
      );
      return {
        style,
        score: { ...parts, total },
        weights,
        explanations: [
          `${style.name}: ${style.summary}`,
          `Product/industry matches: ${fit.toFixed(2)}; brand-tag overlap: ${brand.toFixed(2)}. These are editorial heuristics, not validated measurements.`,
          `${style.density} layout supports the audience and goals; implementation complexity is ${style.complexity}.`,
          ...style.guidance,
        ],
      };
    })
    .sort((a, b) => b.score.total - a.score.total || order(a.style, b.style));
  return { ranked, rejected, weights };
}
function materialize(
  brief: Brief,
  ranked: ReturnType<typeof rankDirections>['ranked'][number],
  seed: number,
  kb: Knowledge,
): Direction {
  // Style-keyed stream means suggest and generate choose the same combination.
  const random = createRandom(deriveSeed(seed, ranked.style.id));
  const { fonts, palettes } = combinations(brief, ranked.style, kb);
  return directionSchema.parse({
    ...ranked,
    fontPair: fonts[Math.floor(random() * fonts.length)],
    palette: palettes[Math.floor(random() * palettes.length)],
    seed,
    engineVersion: ENGINE_VERSION,
    knowledgeVersion: kb.version,
  });
}
export function suggest(
  input: unknown,
  options: { count?: number; seed?: number; weights?: unknown; knowledge?: Knowledge } = {},
): Direction[] {
  const brief = briefSchema.parse(input);
  const count = z
    .number()
    .int()
    .min(1)
    .max(20)
    .parse(options.count ?? 3);
  const seed = seedSchema.parse(options.seed ?? brief.seed ?? 42);
  const kb = knowledgeSchema.parse(options.knowledge ?? knowledge);
  const { ranked, rejected } = rankDirections(brief, { ...options, knowledge: kb });
  if (ranked.length < count)
    throw new Error(
      `Requested ${count} distinct directions, but only ${ranked.length} satisfy constraints. ${rejected.map((r) => `${r.id}: ${r.reason}`).join('; ')}`,
    );
  const random = createRandom(seed);
  const remaining = [...ranked];
  const selected: typeof ranked = [];
  const temperature = 0.025 + brief.creativity * 0.5;
  while (selected.length < count) {
    const max = Math.max(...remaining.map((r) => r.score.total));
    const weights = remaining.map(
      (r) =>
        Math.exp((r.score.total - max) / temperature) *
        (selected.some(
          (s) => s.style.density === r.style.density && s.style.complexity === r.style.complexity,
        )
          ? 0.65
          : 1),
    );
    selected.push(remaining.splice(weightedIndex(weights, random), 1)[0]!);
  }
  return selected.map((r) => materialize(brief, r, seed, kb));
}
export function selectDirection(
  input: unknown,
  id: string,
  options: { seed?: number; weights?: unknown; knowledge?: Knowledge } = {},
): Direction {
  const brief = briefSchema.parse(input);
  const kb = knowledgeSchema.parse(options.knowledge ?? knowledge);
  const { ranked, rejected } = rankDirections(brief, { ...options, knowledge: kb });
  const direction = ranked.find((r) => r.style.id === id);
  if (!direction)
    throw new Error(
      `Cannot use direction '${id}': ${rejected.find((r) => r.id === id)?.reason ?? 'Unknown direction ID'}`,
    );
  return materialize(brief, direction, seedSchema.parse(options.seed ?? brief.seed ?? 42), kb);
}
