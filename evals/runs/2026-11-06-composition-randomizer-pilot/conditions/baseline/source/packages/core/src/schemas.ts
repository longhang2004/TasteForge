import { z } from 'zod';
import { fontPairSchema, paletteSchema, styleSchema, idSchema } from '@tasteforge/knowledge';

export const ENGINE_VERSION = '0.1.0';
export const seedSchema = z.number().int().min(0).max(0xffffffff);
const label = z.string().trim().min(1).max(500);
export const weightsSchema = z
  .object({
    fit: z.number().min(0).max(1).default(0.3),
    brand: z.number().min(0).max(1).default(0.25),
    usability: z.number().min(0).max(1).default(0.2),
    technical: z.number().min(0).max(1).default(0.15),
    distinctiveness: z.number().min(0).max(1).default(0.1),
  })
  .strict()
  .refine(
    (w) => Math.abs(Object.values(w).reduce((a, b) => a + b, 0) - 1) < 1e-6,
    'Weights must sum to 1',
  );
export const briefSchema = z
  .object({
    schemaVersion: z.literal('1.0').default('1.0'),
    productType: label,
    industry: label,
    audience: z.array(label).min(1).max(30),
    goals: z.array(label).min(1).max(30),
    brandPersonality: z.array(label).min(1).max(20),
    existingConstraints: z
      .object({
        preserveExisting: z.boolean().default(true),
        designSystem: z.string().max(2000).optional(),
        allowedDirections: z.array(idSchema).max(100).optional(),
        excludedDirections: z.array(idSchema).max(100).default([]),
        fontPairId: idSchema.optional(),
        paletteId: idSchema.optional(),
        maxComplexity: z.enum(['low', 'medium', 'high']).default('medium'),
        density: z.enum(['spacious', 'balanced', 'dense']).optional(),
        fontDelivery: z.enum(['any', 'system']).default('any'),
      })
      .strict()
      .prefault({}),
    accessibility: z
      .object({
        languages: z
          .array(z.enum(['en', 'vi']))
          .min(1)
          .default(['en']),
        minContrast: z.union([z.literal(4.5), z.literal(7)]).default(4.5),
        reducedMotion: z.boolean().default(true),
      })
      .strict()
      .prefault({}),
    creativity: z.number().min(0).max(1).default(0.35),
    seed: seedSchema.optional(),
  })
  .strict();
export type Brief = z.infer<typeof briefSchema>;
export const configSchema = z
  .object({
    schemaVersion: z.literal('1.0').default('1.0'),
    weights: weightsSchema.prefault({}),
  })
  .strict();
export const defaultBrief = briefSchema.parse({
  productType: 'service',
  industry: 'technology',
  audience: ['general'],
  goals: ['Complete the primary task with confidence'],
  brandPersonality: ['clear', 'trustworthy'],
  existingConstraints: { preserveExisting: true },
  creativity: 0.35,
});
export const scoreSchema = z
  .object({
    fit: z.number().min(0).max(1),
    brand: z.number().min(0).max(1),
    usability: z.number().min(0).max(1),
    technical: z.number().min(0).max(1),
    distinctiveness: z.number().min(0).max(1),
    total: z.number().min(0).max(1),
  })
  .strict();
export const directionSchema = z
  .object({
    style: styleSchema,
    fontPair: fontPairSchema,
    palette: paletteSchema,
    score: scoreSchema,
    explanations: z.array(z.string()).min(1),
    weights: weightsSchema,
    seed: seedSchema,
    engineVersion: z.literal(ENGINE_VERSION),
    knowledgeVersion: z.string(),
  })
  .strict();
export type Direction = z.infer<typeof directionSchema>;
export const tokenMapSchema = z.record(
  z.string().regex(/^--tf-[a-z0-9-]+$/),
  z.string().min(1).max(1000),
);
export const dnaSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    engineVersion: z.literal(ENGINE_VERSION),
    knowledgeVersion: z.string(),
    seed: seedSchema,
    direction: directionSchema,
    context: briefSchema,
    rationale: z.array(z.string()),
    typography: z
      .object({ heading: z.string(), body: z.string(), lineHeight: z.number() })
      .strict(),
    colors: paletteSchema.shape.colors,
    spacing: z.array(z.number().nonnegative()),
    radius: z.array(z.number().nonnegative()),
    layout: z.array(z.string()),
    motion: z.array(z.string()),
    accessibility: z.array(z.string()),
    antiPatterns: z.array(z.string()),
    tokens: tokenMapSchema,
  })
  .strict();
export type DesignDNA = z.infer<typeof dnaSchema>;
