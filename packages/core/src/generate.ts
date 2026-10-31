import { z } from 'zod';
import {
  briefSchema,
  directionSchema,
  dnaSchema,
  tokenMapSchema,
  type DesignDNA,
  type Direction,
} from './schemas.js';
import { selectDirection } from './recommend.js';

export function createDesignDNA(input: unknown, direction: Direction): DesignDNA {
  const brief = briefSchema.parse(input);
  const chosen = directionSchema.parse(direction);
  // Re-derive from the context: prevents mismatched or hand-edited combinations.
  const expected = selectDirection(brief, chosen.style.id, {
    seed: chosen.seed,
    weights: chosen.weights,
  });
  if (JSON.stringify(chosen) !== JSON.stringify(expected)) {
    throw new Error('Direction does not match this context and bundled knowledge version');
  }
  const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64];
  const radius =
    chosen.style.id === 'neo-brutalism'
      ? [0, 0, 2]
      : chosen.style.id === 'soft-utility'
        ? [0, 6, 12]
        : [0, 2, 6];
  const tokens: Record<string, string> = {
    '--tf-font-heading': chosen.fontPair.heading.stack,
    '--tf-font-body': chosen.fontPair.body.stack,
    '--tf-font-size-body': '1rem',
    '--tf-font-size-small': '0.875rem',
    '--tf-font-size-title': 'clamp(2rem, 4vw, 3.5rem)',
    '--tf-line-height-body': '1.6',
    '--tf-content-width': chosen.style.density === 'dense' ? '90rem' : '75rem',
    '--tf-reading-width': '65ch',
    '--tf-motion-duration': brief.accessibility.reducedMotion ? '0ms' : '150ms',
  };
  for (const [name, value] of Object.entries(chosen.palette.colors))
    tokens[`--tf-color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  spacing.forEach((value, i) => {
    tokens[`--tf-space-${i}`] = `${value / 16}rem`;
  });
  radius.forEach((value, i) => {
    tokens[`--tf-radius-${i}`] = `${value / 16}rem`;
  });
  return dnaSchema.parse({
    schemaVersion: '1.0',
    engineVersion: chosen.engineVersion,
    knowledgeVersion: chosen.knowledgeVersion,
    seed: chosen.seed,
    direction: chosen,
    context: brief,
    rationale: chosen.explanations,
    typography: {
      heading: chosen.fontPair.heading.stack,
      body: chosen.fontPair.body.stack,
      lineHeight: 1.6,
    },
    colors: chosen.palette.colors,
    spacing,
    radius,
    layout: chosen.style.layout,
    motion: chosen.style.motion,
    accessibility: [
      `Normal text contrast at least ${brief.accessibility.minContrast}:1 on prescribed surfaces. Recheck custom combinations.`,
      'Use semantic controls, visible keyboard focus, accessible names, and logical reading order.',
      'Test zoom, narrow viewports, long content, and Vietnamese diacritics when relevant.',
      'Honor prefers-reduced-motion; never encode status through color alone.',
    ],
    antiPatterns: chosen.style.avoid,
    tokens,
  });
}
export function validateDNA(input: unknown): DesignDNA {
  const dna = dnaSchema.parse(input);
  const expected = createDesignDNA(dna.context, dna.direction);
  if (JSON.stringify(dna) !== JSON.stringify(expected))
    throw new Error(
      'Design DNA artifacts are inconsistent; regenerate using the recorded brief, direction, and seed',
    );
  return dna;
}
export function renderTokens(input: unknown): string {
  const tokens = tokenMapSchema.parse(input);
  for (const value of Object.values(tokens)) {
    if (/[;{}\n\r]|\/\*|<\/|url\s*\(/i.test(value)) throw new Error('Unsafe token value');
  }
  return `/* TasteForge tokens; font files are not fetched or bundled. */\n:root {\n${Object.entries(
    tokens,
  )
    .map(([key, value]) => `  ${key}: ${value};`)
    .join(
      '\n',
    )}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root { --tf-motion-duration: 0ms; }\n}\n`;
}
export function renderDesign(input: unknown): string {
  const dna = validateDNA(input);
  const list = (items: string[]) => items.map((s) => `- ${s}`).join('\n');
  return `# ${dna.direction.style.name}\n\n${dna.direction.style.summary}\n\nEngine ${dna.engineVersion}; knowledge ${dna.knowledgeVersion}; seed ${dna.seed}.\n\n## Context\n\nProduct: ${dna.context.productType}; industry: ${dna.context.industry}.\nAudience: ${dna.context.audience.join(', ')}.\nGoals: ${dna.context.goals.join('; ')}.\n\n## Rationale\n\n${list(dna.rationale)}\n\n## Typography and color\n\nHeading: ${dna.typography.heading}\n\nBody: ${dna.typography.body}\n\n${dna.direction.fontPair.rationale}\n\nFont delivery: ${dna.direction.fontPair.delivery}. Load fonts locally or use the provided fallbacks; verify subset coverage on the target OS. No fonts are bundled.\n\nPalette: ${dna.direction.palette.name}. ${dna.direction.palette.rationale}\n\nUse semantic variables in tokens.css. Spacing (px at a 16px root): ${dna.spacing.join(', ')}. Radius (px): ${dna.radius.join(', ')}.\n\n## Layout\n\n${list(dna.layout)}\n\n## Motion\n\n${list(dna.motion)}\n\n## Accessibility\n\n${list(dna.accessibility)}\n\n## Avoid in this context\n\n${list(dna.antiPatterns)}\n\n## Review\n\nInspect empty, loading, error, focus, and success states. Perform a rendered review at small and large viewports. Static audits do not establish visual quality or accessibility conformance.\n`;
}
export const artifactNames = z.enum(['design-dna.json', 'tokens.css', 'DESIGN.md']);
