import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';
import { selectedEvidence } from './evidence.mjs';

const json = async file => JSON.parse(await readFile(path.join(runRoot, file), 'utf8'));
const sha = async file => createHash('sha256').update(await readFile(path.join(runRoot, file))).digest('hex');
const exists = async file => { try { await access(path.join(runRoot, file)); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
async function files(directory) {
  const found = [];
  for (const entry of await readdir(path.join(runRoot, directory), { withFileTypes: true })) {
    if (['node_modules', '.git', '__pycache__'].includes(entry.name)) continue;
    const file = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await files(file));
    else if (entry.isFile()) found.push(file);
  }
  return found;
}
const manifest = await json('manifest.json');
assert.equal(await sha('protocol.md'), manifest.protocolSha256, 'Frozen protocol changed');
assert.equal(await sha('treatment/reference-catalog.json'), manifest.catalogSha256, 'Frozen catalog changed');
assert.equal(Object.keys(manifest.skillFiles).length, 20, 'Current skill must include all 20 Markdown resources');
for (const [file, hash] of Object.entries(manifest.skillFiles)) assert.equal(await sha('treatment/' + file), hash, `Frozen skill ${file} changed`);
const cells = new Set();
let rendered = 0, traces = 0, checks = 0;
for (const entry of manifest.cases) {
  const key = [entry.host, entry.model, entry.promptId, entry.condition].join('|');
  assert(!cells.has(key), `Duplicate planned cell: ${key}`); cells.add(key);
  assert.equal(await sha(`cases/${entry.id}/task.md`), entry.taskSha256, `${entry.id} task changed`);
  assert.equal(await sha(`cases/${entry.id}/fixture.json`), entry.fixtureSha256, `${entry.id} fixture changed`);
  assert.equal(await sha(`prompts/${entry.promptId}.md`), entry.taskSha256, `${entry.id} task differs from common prompt`);
  assert.equal(await sha(`shared/${entry.promptId}.json`), entry.fixtureSha256, `${entry.id} fixture differs from common data`);
  assert.equal(await sha(`tools/${entry.id}-prompt.txt`), entry.creatorPromptSha256, `${entry.id} creator prompt changed`);
  const evidence = await selectedEvidence(entry.id, process.argv.includes('--freeze') && !entry.optional);
  if (!evidence.browser) continue;
  rendered++;
  const browser = evidence.browser;
  assert.equal(browser.caseId, entry.id);
  if (evidence.selected) {
    assert.equal(browser.captureVersion, '2.0', 'Final evidence must use the uniform corrected capture');
    assert(await exists(evidence.initial), 'Initial diagnostics must be retained');
  }
  for (const [file, hash] of Object.entries(browser.sourceHashes)) assert.equal(await sha(`cases/${entry.id}/${file}`), hash, `${entry.id}/${file} changed after operator capture`);
  const widths = [...manifest.viewports, manifest.supportingViewport];
  assert.deepEqual(Object.keys(browser.viewports), widths.map(v => v.name));
  for (const viewport of widths) {
    traces++;
    const result = browser.viewports[viewport.name];
    assert.deepEqual(result.viewport, viewport);
    assert(result.checks.length > 0, 'Empty trace');
    checks += result.checks.length;
    assert(result.checks.every(c => ['pass', 'fail'].includes(c.status)), 'Invalid check status');
    assert(result.screenshots.length > 0, 'No captured evidence');
    for (const image of result.screenshots) assert(await exists(`${evidence.imageDirectory}/${image}`), `Missing screenshot ${image}`);
    assert(result.checks.some(c => c.name === 'Complete shared primary-task flow' && c.status === 'fail') || result.axeFinal, 'Missing final scan without disclosed flow interruption');
  }
}
const boundFile = 'evidence/artifact-hashes.json';
if (process.argv.includes('--freeze')) {
  assert(!await exists(boundFile), 'Never replace frozen artifact hashes');
  const hashes = {};
  for (const file of (await files('')).sort()) if (file !== boundFile) hashes[file] = await sha(file);
  await writeFile(path.join(runRoot, boundFile), JSON.stringify({ algorithm: 'sha256', frozenAtUtc: new Date().toISOString(), files: hashes }, null, 2) + '\n');
}
let hashes = 0;
if (await exists(boundFile)) {
  const bound = await json(boundFile);
  for (const [file, hash] of Object.entries(bound.files)) assert.equal(await sha(file), hash, `Frozen artifact changed: ${file}`);
  hashes = Object.keys(bound.files).length;
}
console.log(JSON.stringify({ integrity: 'pass', plannedCells: cells.size, renderedCases: rendered, viewportTraces: traces, recordedChecks: checks, artifactHashes: hashes, scope: 'Integrity validates preserved evidence, not that every UI check passed or that users found the UI usable.' }, null, 2));
