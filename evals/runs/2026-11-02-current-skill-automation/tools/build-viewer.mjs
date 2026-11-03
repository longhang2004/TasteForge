import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';
import { selectedEvidence } from './evidence.mjs';

const manifest = JSON.parse(await readFile(path.join(runRoot, 'manifest.json'), 'utf8'));
const cases = [];
for (const entry of manifest.cases) {
  const evidence = await selectedEvidence(entry.id);
  const browser = evidence.browser;
  let images = [];
  try {
    images = browser ? (await readdir(path.join(runRoot, evidence.imageDirectory))).filter(name => name.endsWith('.png')) : [];
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  cases.push({ id: entry.id, host: entry.host, model: entry.model, promptId: entry.promptId, condition: entry.condition, generation: entry.generation, optional: entry.optional, availability: entry.availability ?? null, availabilityEvidence: entry.availabilityEvidence ?? null, capturedAtUtc: browser?.capturedAtUtc ?? null, imageDirectory: evidence.imageDirectory, evidencePath: evidence.filename, initialEvidencePath: evidence.initial, finalEvidenceSelected: evidence.selected, images, checks: browser ? Object.fromEntries(Object.entries(browser.viewports).map(([name, viewport]) => [name, { passed: viewport.checks.filter(c => c.kind !== 'diagnostic' && c.status === 'pass').length, total: viewport.checks.filter(c => c.kind !== 'diagnostic').length, executionError: viewport.executionError ?? null }])) : null });
}
const groups = [...new Set(cases.filter(c => !c.optional).map(c => [c.host, c.model, c.promptId].join('|')))];
const pairs = groups.map((key, index) => {
  const rows = cases.filter(c => !c.optional && [c.host, c.model, c.promptId].join('|') === key);
  return { id: `p${index + 1}`, host: rows[0].host, model: rows[0].model, task: rows[0].promptId, noSkill: rows.find(c => c.condition === 'no-skill').id, currentSkill: rows.find(c => c.condition === 'current-skill').id };
});
const data = { generatedAtUtc: new Date().toISOString(), runId: manifest.runId, pairs, cases, viewports: [...manifest.viewports, manifest.supportingViewport] };
await writeFile(path.join(runRoot, 'viewer-data.json'), JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ pairs: pairs.length, renderedCases: cases.filter(c => c.capturedAtUtc).length, availabilityBlockedCells: cases.filter(c => c.generation === 'availability-blocked').length }));
