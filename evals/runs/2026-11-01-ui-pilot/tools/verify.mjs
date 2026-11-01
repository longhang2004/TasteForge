import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import { runRoot } from './serve.mjs';

const readJSON = async (name) => JSON.parse(await readFile(path.join(runRoot, name), 'utf8'));
const digest = async (name) => createHash('sha256').update(await readFile(path.join(runRoot, name))).digest('hex');
const manifest = await readJSON('manifest.json');
assert.equal(manifest.cases.length, 8);
assert.equal(new Set(manifest.cases.map((c) => c.id)).size, 8);
assert.equal(new Set(manifest.cases.map((c) => c.model)).size, 2);
const dimensions = ['taskSuccess','hierarchy','contextIdentity','typographyContent','layoutResponsive','interactionCompleteness','accessibility','systemCoherence','evidenceIntegrity'];
for (const entry of manifest.cases) {
  assert.equal(await digest(`cases/${entry.id}/task.md`), entry.taskSha256);
  assert.equal(await digest(`cases/${entry.id}/fixture.json`), entry.fixtureSha256);
  const browser = await readJSON(`evidence/${entry.id}/browser.json`);
  for (const [name, hash] of Object.entries(browser.sourceHashes)) assert.equal(await digest(`cases/${entry.id}/${name}`), hash, `Submitted source changed: ${entry.id}/${name}`);
  for (const viewport of ['desktop','mobile']) {
    const evidence = browser.viewports[viewport];
    assert(evidence.checks.length > 0);
    assert(evidence.axeInitial);
    for (const screenshot of evidence.screenshots) {
      const bytes = await readFile(path.join(runRoot, 'evidence', entry.id, screenshot));
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert(bytes.length > 1000);
    }
  }
  const partner = manifest.cases.find((c) => c.model === entry.model && c.promptId === entry.promptId && c.condition !== entry.condition);
  assert(partner);
  assert.equal(entry.taskSha256, partner.taskSha256);
  assert.equal(entry.fixtureSha256, partner.fixtureSha256);
  if (entry.condition === 'baseline') {
    assert.equal(await stat(path.join(runRoot,'cases',entry.id,'.tasteforge')).then(() => true).catch(() => false), false);
  } else {
    for (const name of ['brief.json','config.json','design-dna.json','tokens.css','DESIGN.md']) assert((await stat(path.join(runRoot,'cases',entry.id,'.tasteforge',name))).size > 0);
  }
}
for (const [filename,hash] of Object.entries(await readJSON('evidence/artifact-hashes.json'))) assert.equal(await digest(filename),hash,`Case artifact changed: ${filename}`);
for (const [filename,hash] of Object.entries(manifest.skillFiles)) assert.equal(await digest('treatment/'+filename),hash,`Frozen skill changed: ${filename}`);
const packet = await readJSON('reviews/packet/packet.json');
assert.equal(packet.cases.length,8);
for (const entry of packet.cases) {
  assert(!('model' in entry) && !('condition' in entry));
  for (const screenshot of entry.screenshots) assert.equal(await digest('reviews/packet/'+screenshot.path),screenshot.sha256);
}
for (const reviewer of ['r1','r2']) {
  assert.equal(await digest(`reviews/reviewer-${reviewer}.json`),manifest.reviewers[reviewer].ratingFileSha256);
  const review=await readJSON(`reviews/reviewer-${reviewer}.json`);
  assert.deepEqual(review.cases.map((c)=>c.id).sort(),Object.keys(manifest.blindReviewMapping).sort());
  for (const entry of review.cases) {
    assert.deepEqual(Object.keys(entry.ratings).sort(),[...dimensions].sort());
    for (const rating of Object.values(entry.ratings)) {
      assert(rating.score === null || Number.isInteger(rating.score) && rating.score >= 1 && rating.score <= 5);
      assert(rating.evidence.length > 0);
    }
  }
}
const results=await readJSON('results.json');
assert.equal(results.uiCount,8);
assert.equal(results.matchedPairs,4);
assert.equal(results.allCasesPassedRequiredTaskChecks,true);
assert.equal((await readJSON('evidence/gallery-checks.json')).imageCombinations.length,40);
console.log('Integrity PASS: 8 matched UIs, unchanged case/skill artifacts, screenshot packets, 2 complete independent reviews, and 40 gallery states.');
