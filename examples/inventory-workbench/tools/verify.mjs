import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { root } from './serve.mjs';

const record = JSON.parse(await readFile(path.join(root, 'composition.json'), 'utf8'));
const report = JSON.parse(await readFile(path.join(root, record.browserEvidence), 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (const [file, expected] of Object.entries(report.sources)) {
  assert.equal(
    sha(await readFile(path.join(root, file))),
    expected,
    `Tested source changed: ${file}`,
  );
}
assert.equal(report.error, undefined, 'Final capture did not finish');
assert.equal(report.axeFindings.length, 0, 'Final capture reports axe findings');
assert.equal(report.traces.length, 3);
assert.equal(report.candidates.length, 4);
for (const trace of [...report.traces, ...report.candidates]) {
  if (trace.recoveryPath) assert.equal(trace.recoveryPath, 'passed');
  for (const state of Object.keys(trace.states)) {
    const bytes = await readFile(
      path.join(root, path.dirname(record.browserEvidence), `${trace.id}-${state}.png`),
    );
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', 'Missing or invalid capture');
  }
}
const original = path.resolve(
  root,
  '../../evals/runs/2026-11-01-antigravity-inventory/shared/inventory-triage.json',
);
assert.equal(
  sha(await readFile(original)),
  sha(await readFile(path.join(root, 'fixture.json'))),
  'Fixture differs from preserved study',
);
console.log(
  'Evidence matches current tested sources; 3 viewport traces, 4 candidate traces and unchanged fixture verified.',
);
