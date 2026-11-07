// Thin per-cell wrapper. All archive assertions live once in check-archive.mjs so
// the lean and candidate cells are judged by the identical code path.
import { fileURLToPath } from 'node:url';
import { runCell } from './browser.mjs';
import { archiveTask } from './check-archive.mjs';

const result = await runCell(
  'archive-R2',
  process.argv[2] || 'initial',
  process.argv[3] || 'initial-01',
  archiveTask(),
  fileURLToPath(import.meta.url),
);
if (result.failures.length) process.exitCode = 1;
