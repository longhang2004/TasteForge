import { z } from 'zod';

export const idSchema = z.string().regex(/^[a-z][a-z0-9-]{1,63}$/);
export const hexSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const text = z.string().min(1).max(2000);
const tags = z.array(text).min(1).max(30);
export const styleSchema = z
  .object({
    id: idSchema,
    name: text,
    summary: text,
    productTypes: tags,
    industries: tags,
    audienceTags: tags,
    personalities: tags,
    density: z.enum(['spacious', 'balanced', 'dense']),
    complexity: z.enum(['low', 'medium', 'high']),
    distinctiveness: z.number().min(0).max(1),
    fontPairIds: z.array(idSchema).min(1),
    paletteIds: z.array(idSchema).min(1),
    layout: tags,
    motion: tags,
    guidance: tags,
    avoid: tags,
  })
  .strict();

const fontSchema = z
  .object({
    family: text,
    stack: text,
    languages: z.array(z.enum(['en', 'vi'])).min(1),
    source: z.string().url(),
    coverageNote: text,
  })
  .strict();
export const fontPairSchema = z
  .object({
    id: idSchema,
    heading: fontSchema,
    body: fontSchema,
    delivery: z.enum(['system', 'optional-web']),
    rationale: text,
  })
  .strict();

export const paletteSchema = z
  .object({
    id: idSchema,
    name: text,
    mode: z.enum(['light', 'dark']),
    colors: z
      .object({
        background: hexSchema,
        foreground: hexSchema,
        surface: hexSchema,
        muted: hexSchema,
        accent: hexSchema,
        onAccent: hexSchema,
        border: hexSchema,
      })
      .strict(),
    rationale: text,
  })
  .strict();
export const principleSchema = z
  .object({
    id: idSchema,
    title: text,
    why: text,
    when: text,
    poor: text,
    improved: text,
  })
  .strict();
export const antiPatternSchema = z
  .object({
    id: idSchema,
    title: text,
    description: text,
    why: text,
    acceptableWhen: text,
    detection: text,
    alternative: text,
    limitation: text,
  })
  .strict();

export const knowledgeSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    styles: z.array(styleSchema).min(1),
    fontPairs: z.array(fontPairSchema).min(1),
    palettes: z.array(paletteSchema).min(1),
    principles: z.array(principleSchema).min(1),
    antiPatterns: z.array(antiPatternSchema).min(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    for (const key of ['styles', 'fontPairs', 'palettes', 'principles', 'antiPatterns'] as const) {
      const seen = new Set<string>();
      data[key].forEach((entry, index) => {
        if (seen.has(entry.id))
          ctx.addIssue({ code: 'custom', path: [key, index, 'id'], message: 'Duplicate ID' });
        seen.add(entry.id);
      });
    }
    const fonts = new Set(data.fontPairs.map((f) => f.id));
    const palettes = new Set(data.palettes.map((p) => p.id));
    data.styles.forEach((style, i) => {
      for (const [field, ids, known] of [
        ['fontPairIds', style.fontPairIds, fonts],
        ['paletteIds', style.paletteIds, palettes],
      ] as const) {
        for (const id of ids)
          if (!known.has(id))
            ctx.addIssue({
              code: 'custom',
              path: ['styles', i, field],
              message: `Unknown reference: ${id}`,
            });
      }
    });
  });
export type Style = z.infer<typeof styleSchema>;
export type FontPair = z.infer<typeof fontPairSchema>;
export type Palette = z.infer<typeof paletteSchema>;
export type Knowledge = z.infer<typeof knowledgeSchema>;
