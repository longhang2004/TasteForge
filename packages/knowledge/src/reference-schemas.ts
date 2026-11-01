import { z } from 'zod';

export const referenceKindSchema = z.enum(['style', 'rule', 'template']);
export const taskTypeSchema = z.enum([
  'marketing',
  'dashboard',
  'commerce',
  'form',
  'portfolio',
  'editorial',
  'documentation',
  'learning',
  'booking',
]);
const id = z.string().regex(/^[a-z][a-z0-9-]{1,179}$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const label = z.string().min(1).max(1200);
export const referenceSourceSchema = z
  .object({
    id,
    repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
    revision: z.string().regex(/^[a-f0-9]{40}$/),
    license: z.literal('MIT'),
    licenseUrl: z.url(),
    licenseText: z.string().min(500).max(20000),
    accessedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    authorship: z.literal('not-independently-verified'),
    licenseSha256: hash,
  })
  .strict();
export const referenceEntrySchema = z
  .object({
    id,
    kind: referenceKindSchema,
    sourceId: id,
    sourcePath: label,
    url: z.url(),
    inputSha256: hash,
    contentSha256: hash,
    title: label,
    summary: label,
    content: z.string().min(1).max(200000),
    tags: z.array(z.string().max(200)).max(30),
    tasks: z.array(taskTypeSchema).max(9),
    status: z.enum(['active', 'retired']),
    complexity: z.enum(['low', 'medium', 'high', 'unknown']),
    risk: z.enum(['high', 'unassessed']),
    evidence: z.enum([
      'source-text',
      'community-design-document',
      'upstream-catalog-row',
      'upstream-skill-document',
      'html-structure-extraction',
    ]),
    selectionScope: z.enum([
      'reference-only',
      'visual-only',
      'contextual-guidance',
      'structure-only',
    ]),
    rowNumber: z.number().int().min(2).optional(),
    upstreamStatus: z.string().max(100).optional(),
    avoid: z.string().max(2000).optional(),
    avoidContexts: z
      .array(z.enum(['operational']))
      .max(1)
      .optional(),
    notes: z.array(label).max(10).optional(),
    duplicateOf: id.optional(),
  })
  .strict();
export const referenceCatalogSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    version: label,
    reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sources: z.array(referenceSourceSchema).min(1),
    entries: z.array(referenceEntrySchema).min(1),
  })
  .strict()
  .superRefine((catalog, ctx) => {
    const sources = new Set<string>();
    const ids = new Set<string>();
    for (const source of catalog.sources) {
      if (sources.has(source.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate source ID' });
      sources.add(source.id);
    }
    for (const entry of catalog.entries) {
      if (ids.has(entry.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate reference ID' });
      ids.add(entry.id);
      if (!sources.has(entry.sourceId))
        ctx.addIssue({ code: 'custom', message: `Unknown source: ${entry.sourceId}` });
    }
    for (const entry of catalog.entries)
      if (entry.duplicateOf && (!ids.has(entry.duplicateOf) || entry.duplicateOf === entry.id))
        ctx.addIssue({ code: 'custom', message: `Invalid duplicate reference: ${entry.id}` });
  });
export type TaskType = z.infer<typeof taskTypeSchema>;
export type ReferenceKind = z.infer<typeof referenceKindSchema>;
export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;
export type ReferenceCatalog = z.infer<typeof referenceCatalogSchema>;
