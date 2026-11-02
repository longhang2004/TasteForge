import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';
import { selectedEvidence } from './evidence.mjs';

const manifest = JSON.parse(await readFile(path.join(runRoot, 'manifest.json'), 'utf8'));
const cases = [];
const count = checks => ({ passed: checks.filter(c => c.status === 'pass').length, failed: checks.filter(c => c.status === 'fail').length, total: checks.length });
for (const entry of manifest.cases) {
  const evidence = await selectedEvidence(entry.id);
  const raw = evidence.browser;
  const row = { id: entry.id, host: entry.host, model: entry.model, promptId: entry.promptId, condition: entry.condition, generation: entry.generation, browserEvidence: Boolean(raw), finalEvidenceSelected: evidence.selected, selectedEvidence: evidence.filename, initialEvidence: evidence.initial };
  if (raw) {
    row.browserVersion = raw.browser;
    row.browser = Object.fromEntries(Object.entries(raw.viewports).map(([name, viewport]) => [name, {
      viewport: viewport.viewport,
      checks: count(viewport.checks.filter(c => c.kind !== 'diagnostic')),
      contract: count(viewport.checks.filter(c => c.kind === 'contract')),
      geometry: count(viewport.checks.filter(c => c.kind === 'geometry')),
      execution: count(viewport.checks.filter(c => c.kind === 'execution')),
      harness: count(viewport.checks.filter(c => c.kind === 'harness')),
      failedChecks: viewport.checks.filter(c => c.status !== 'pass'),
      executionError: viewport.executionError ?? null,
      initialLayout: viewport.layout,
      axe: Object.fromEntries(['Initial', 'Failure', 'Final'].filter(stage => viewport['axe' + stage]).map(stage => [stage.toLowerCase(), {
        violations: viewport['axe' + stage].violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        incomplete: viewport['axe' + stage].incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })),
      }])),
      source: evidence.filename,
    }]));
  }
  cases.push(row);
}
const blocks = [...new Set(cases.map(c => [c.host, c.model, c.promptId].join('|')))];
const pairs = blocks.map(block => {
  const rows = cases.filter(c => [c.host, c.model, c.promptId].join('|') === block);
  const noSkill = rows.find(c => c.condition === 'no-skill');
  const skill = rows.find(c => c.condition === 'current-skill');
  return { host: rows[0].host, model: rows[0].model, promptId: rows[0].promptId, noSkill: noSkill.id, currentSkill: skill.id, bothRendered: noSkill.browserEvidence && skill.browserEvidence };
});
console.log(JSON.stringify({ runId: manifest.runId, summarizedAtUtc: new Date().toISOString(), sourceCommit: manifest.sourceCommit, cases, pairs, scope: 'Scripted task/geometry/a11y evidence only; ungenerated cells are not UI failures. Human/manual tests deferred, not passed. No reviewer scores or general efficacy claim inferred.' }, null, 2));
