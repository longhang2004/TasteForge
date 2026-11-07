// Thin per-cell wrapper. All freight assertions live once in check-freight.mjs so
// the lean and candidate cells are judged by the identical code path.
import { fileURLToPath } from 'node:url';
import { runCell } from './browser.mjs';
import { freightTask } from './check-freight.mjs';

const result = await runCell(
  'freight-R2',
  process.argv[2] || 'initial',
  process.argv[3] || 'initial-01',
  freightTask(),
  fileURLToPath(import.meta.url),
);
if (result.failures.length) process.exitCode = 1;
