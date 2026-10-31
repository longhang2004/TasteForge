import data from './data/knowledge.json' with { type: 'json' };
import { knowledgeSchema } from './schemas.js';
export * from './schemas.js';
export const knowledge = knowledgeSchema.parse(data);
