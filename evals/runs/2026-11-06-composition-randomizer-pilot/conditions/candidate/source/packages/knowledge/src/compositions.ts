import { z } from 'zod';
import data from './data/compositions.json' with { type: 'json' };
import { taskTypeSchema } from './reference-schemas.js';

const label = z.string().min(1).max(2000);
const id = z.string().regex(/^[a-z][a-z0-9-]{1,179}$/);
const notes = z.array(label).min(1).max(20);
export const compositionSourceSchema = z
  .object({
    id,
    title: label,
    url: z.url(),
    pinnedUrl: z.url(),
    revision: z.string().regex(/^[a-f0-9]{40}$/),
    path: label,
    inputSha256: z.string().regex(/^[a-f0-9]{64}$/),
    license: label,
    licenseUrl: z.url(),
    observed: notes,
    notObserved: notes,
    rights: label,
  })
  .strict();
export const compositionSchema = z
  .object({
    id,
    title: label,
    group: z.enum(['work', 'commerce', 'reading', 'exploration']),
    family: id,
    tasks: z.array(taskTypeSchema).min(1).max(9),
    tags: z.array(label).min(1).max(30),
    density: z.enum(['spacious', 'balanced', 'dense']),
    complexity: z.enum(['low', 'medium', 'high']),
    suitableFor: notes,
    avoid: notes,
    anatomy: notes,
    narrow: label,
    states: notes,
    artDirection: z.array(label).min(1).max(2),
    tradeoff: label,
    sourceIds: z.array(id).min(1),
  })
  .strict();
export const compositionLibrarySchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    version: label,
    reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sources: z.array(compositionSourceSchema),
    entries: z.array(compositionSchema),
  })
  .strict()
  .superRefine((library, ctx) => {
    for (const key of ['sources', 'entries'] as const) {
      if (new Set(library[key].map((e) => e.id)).size !== library[key].length)
        ctx.addIssue({ code: 'custom', path: [key], message: 'Duplicate ID' });
    }
    const sources = new Set(library.sources.map((s) => s.id));
    library.entries.forEach((entry, index) => {
      if (entry.sourceIds.some((sourceId) => !sources.has(sourceId)))
        ctx.addIssue({
          code: 'custom',
          path: ['entries', index, 'sourceIds'],
          message: 'Unknown composition source',
        });
    });
  });
export type Composition = z.infer<typeof compositionSchema>;
export type CompositionLibrary = z.infer<typeof compositionLibrarySchema>;
export const compositionLibrary = compositionLibrarySchema.parse(data);
