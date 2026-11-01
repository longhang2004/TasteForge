import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspire, listReferences } from '../../../../packages/core/dist/references.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const manifest = await json('manifest.json');
for (const [file, expected] of Object.entries(manifest.files))
  assert.equal(hash(await readFile(path.join(root, file))), expected, `Frozen creator artifact: ${file}`);
const originalBytes = gunzipSync(await readFile(path.join(root, 'catalog-v1.json.gz')));
assert.equal(hash(originalBytes), manifest.catalogSha256);
assert.equal(JSON.parse(originalBytes).version, '2026.11.01.1');
const original = await json('artifacts/evidence/inspire-dashboard-seed42.json');
assert(original.inspirations.some((p) => p.template?.sourcePath.includes('404')));
assert(original.inspirations.some((p) => p.style.id === 'promax-styles-predictive-analytics'));

const brief = await json('artifacts/brief.json');
const result = inspire(brief, { task: 'dashboard', count: 2, seed: 42 });
assert.equal(result.catalogVersion, '2026.11.01.2', 'Use the matching catalog; later versions need a new run');
assert(result.excluded.some((e) => e.id === 'promax-styles-predictive-analytics' && e.reason.includes('operational')));
assert(result.inspirations.every((p) => p.style.id !== 'promax-styles-predictive-analytics'));
const templates = listReferences({ kind: 'template', task: 'dashboard', limit: 100 });
assert(templates.total <= 100);
assert(templates.entries.every((e) => !/404|500|login|register|password/.test(e.sourcePath) && !e.sourcePath.endsWith('/landing.csv')));
const record = {
  type: 'operator-regression-check-not-independent-review',
  originalCatalog: manifest.catalogVersion,
  correctedCatalog: result.catalogVersion,
  sameBriefSha256: hash(await readFile(path.join(root, 'artifacts/brief.json'))),
  options: { task: 'dashboard', count: 2, seed: 42 },
  checks: {
    frozenCreatorArtifacts: Object.keys(manifest.files).length,
    originalCatalogHash: 'pass',
    originalFailuresPreserved: 'pass',
    dashboardCandidatesContainNoErrorAuthOrLandingPages: 'pass',
    operationalAvoidStatementApplied: 'pass',
    dashboardTemplateCandidates: templates.total,
  },
  result,
  limitations: ['No new independent review, UI implementation, rendered inspection or measured UX gain.', 'The version changes the random stream; differing IDs are not an improvement metric.'],
};
await mkdir(path.join(root, 'evidence'), { recursive: true });
await writeFile(path.join(root, 'evidence/operator-after-fix.json'), JSON.stringify(record, null, 2) + '\n');
console.log(`Verified ${Object.keys(manifest.files).length} frozen artifacts, exact catalog bytes, preserved failures, and corrected task/context filters.`);
