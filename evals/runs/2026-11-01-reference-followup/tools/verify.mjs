import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';

const json = async (file) => JSON.parse(await readFile(path.join(runRoot, file), 'utf8'));
const sha = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');
const manifest = await json('manifest.json');
const results = await json('results.json');
const browser = await json('evidence/r01/browser.json');
const hashes = await json('evidence/artifact-hashes.json');
for (const [file, expected] of Object.entries(hashes.files)) {
  assert.equal(await sha(path.join(runRoot, file)), expected, `Artifact changed: ${file}`);
}
for (const [file, expected] of Object.entries(manifest.skillFiles)) {
  assert.equal(await sha(path.join(runRoot, 'treatment', file)), expected, `Skill snapshot: ${file}`);
}
for (const [file, expected] of Object.entries(browser.sourceHashes)) {
  assert.equal(await sha(path.join(runRoot, 'cases/r01', file)), expected, `Submitted source: ${file}`);
  assert.equal(manifest.cases[0].sourceHashes[file], expected);
}
for (const file of ['task.md', 'fixture.json']) {
  assert.equal(await sha(path.join(runRoot, 'cases/r01', file)), await sha(path.resolve(runRoot, '../2026-11-01-ui-pilot/cases/c02', file)), `Same input: ${file}`);
}
for (const copy of results.originalScreenshotCopies) {
  assert.equal(await sha(path.join(runRoot, copy.source)), copy.sha256);
  assert.equal(await sha(path.join(runRoot, copy.destination)), copy.sha256);
}
assert.equal(manifest.cases[0].generation, 'submitted');
assert.equal(manifest.cases[0].generatedDNA, false);
assert.equal(results.newReviewerRatings, null);
assert.equal((await readFile(path.join(runRoot, 'cases/r01/suggestions.json'))).length, 0);
assert.deepEqual((await readdir(path.join(runRoot, 'cases/r01/.tasteforge'))).sort(), ['brief.json', 'config.json']);
const cli = await json('evidence/cli-suggestion-check.json');
assert.notEqual(cli.exitCode, 0);
assert.match(cli.stdout + cli.stderr, /no compatible/i);
for (const [viewport, v] of Object.entries(browser.viewports)) {
  assert.equal(results.followup.checks[viewport].checksPassed, v.checks.filter((c) => c.status === 'pass').length);
  assert.equal(results.followup.checks[viewport].checksTotal, v.checks.length);
}
console.log(`Verified ${Object.keys(hashes.files).length} artifact hashes, submitted source, frozen skill, original copies, input equality, and manual-mode evidence.`);
