import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';

const original = path.resolve(runRoot, '../2026-11-01-ui-pilot');
const readJSON = async (file) => JSON.parse(await readFile(file, 'utf8'));
const sha = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');
const manifest = await readJSON(path.join(runRoot, 'manifest.json'));
const oldEvidence = await readJSON(path.join(original, 'evidence/c02/browser.json'));
const newEvidence = await readJSON(path.join(runRoot, 'evidence/r01/browser.json'));
const fold = await readJSON(path.join(runRoot, 'evidence/fold-observations.json'));
const states = ['initial', 'full', 'review', 'failure', 'success'];
const copies = [];
await mkdir(path.join(runRoot, 'comparison'), { recursive: true });
for (const viewport of ['desktop', 'mobile']) {
  for (const state of states) {
    const filename = `${viewport}-${state}.png`;
    const source = `../2026-11-01-ui-pilot/evidence/c02/${filename}`;
    const destination = `comparison/original-c02-${filename}`;
    await copyFile(path.join(runRoot, source), path.join(runRoot, destination));
    const hash = await sha(path.join(runRoot, source));
    assert.equal(await sha(path.join(runRoot, destination)), hash);
    copies.push({ source, destination, sha256: hash });
  }
}
for (const file of ['task.md', 'fixture.json']) {
  assert.equal(await sha(path.join(runRoot, 'cases/r01', file)), await sha(path.join(original, 'cases/c02', file)));
}
for (const [file, expected] of Object.entries(newEvidence.sourceHashes)) {
  assert.equal(await sha(path.join(runRoot, 'cases/r01', file)), expected, file);
}
for (const [file, expected] of Object.entries(manifest.skillFiles)) {
  assert.equal(await sha(path.join(runRoot, 'treatment', file)), expected, file);
}
const summarize = (evidence) => Object.fromEntries(Object.entries(evidence.viewports).map(([viewport, v]) => [viewport, {
  checksPassed: v.checks.filter((c) => c.status === 'pass').length,
  checksTotal: v.checks.length,
  failedChecks: v.checks.filter((c) => c.status !== 'pass'),
  axe: Object.fromEntries(['axeInitial', 'axeFailure', 'axeFinal'].map((key) => [key, {
    violations: v[key].violations.length,
    incompleteRules: v[key].incomplete.map((r) => r.id),
  }])),
  pageErrors: v.pageErrors,
  blockedRequests: v.blockedRequests,
}]));
manifest.cases[0].generation = 'submitted';
manifest.cases[0].sourceHashes = newEvidence.sourceHashes;
manifest.cases[0].capturedAtUtc = newEvidence.capturedAtUtc;
manifest.cases[0].visualTreatment = 'documented-manual-fallback';
manifest.cases[0].generatedDNA = false;
manifest.cases[0].retainedCLIArtifacts = ['.tasteforge/brief.json', '.tasteforge/config.json'];
manifest.cases[0].suggestionOutput = 'suggestions.json is empty; failed command, not valid JSON';
manifest.cases[0].researchScope = {
  inspected: ['VoltAgent collection index', 'GOV.UK check-answers documentation and inline HTML', 'GOV.UK confirmation-pages documentation and inline HTML'],
  notInspected: ['Exact pinned Wise DESIGN.md (cache miss)', 'Rendered external products', 'User testing'],
};
await writeFile(path.join(runRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const results = {
  type: manifest.type,
  original: { case: 'c02', model: 'gpt-6.1-sol', checks: summarize(oldEvidence) },
  followup: { case: 'r01', model: 'gpt-6.1-sol', checks: summarize(newEvidence) },
  sameTaskAndFixture: true,
  originalScreenshotCopies: copies,
  foldObservations: fold,
  conclusion: 'A different documented task structure was produced. Neither automated metrics nor this one unmatched generation establish better UX.',
  newReviewerRatings: null,
};
await writeFile(path.join(runRoot, 'results.json'), JSON.stringify(results, null, 2) + '\n');

const foldRows = fold.observations.map((o) => {
  const c = o.controls;
  return `| ${o.case} | ${o.viewport.width} × ${o.viewport.height} | ${Math.round(c.recipient.y)} | ${Math.round(c.amount.y)} | ${Math.round(c['review-transfer'].y)} | ${c['review-transfer'].fullyInInitialViewport ? 'Yes' : 'No'} |`;
}).join('\n');
await writeFile(path.join(runRoot, 'report.md'), `# Reference-led follow-up: observations, not an improvement claim

One fresh gpt-6.1-sol creator used the revised skill on the same fictional transfer task and fixture as original assisted case c02. The resulting UI has an explicit task plan and a different information arrangement. **This does not establish better UX or removal of generic AI composition.** The creator's raw submission is preserved, including its defects and incomplete artifacts.

Open the [comparison viewer](index.html), [new task plan](cases/r01/UX_PLAN.md), [browser evidence](evidence/r01/browser.json), or [machine-readable comparison](results.json). Original c02 remains in the [pilot](../2026-11-01-ui-pilot/README.md); its sources, frozen instructions, evidence and ratings were not rewritten.

## What changed structurally

| Relationship | Original assisted c02 | Revised-skill r01 |
| --- | --- | --- |
| First working region | Large introductory headline and progress above a form | Simulation notice and progress above a task-specific form heading |
| Quote while editing | A separate summary beside the form on desktop, following it on mobile | A cost ledger directly after the amount field and before the review action |
| Review | Summary beside a review panel; a general Edit details action | A dedicated receipt view with contextual recipient/amount edits |
| Narrow screen | Desktop regions stack; the quote follows the entry panel | One reading order for input, fee, total, amount received, then action |
| Planning evidence | Original visual guidance and submission notes | Three structural alternatives, selected task rationale, state/recovery map, reference observations |

These are source/render observations, not reviewer scores. A single-column form is conventional too. Both versions already require a review before confirmation and preserve details through a simulated failure; the new run did not invent those behaviors.

## Actual task and accessibility checks

| Observed checks | Original c02 | Follow-up r01 |
| --- | --- | --- |
| Wide viewport, 1440 × 1000 | 16 / 16 passed | 16 / 16 passed |
| Narrow viewport, 390 × 844 | 16 / 16 passed | 16 / 16 passed |
| axe rule violations: initial / failure / success | 0 / 0 / 0 at both widths | 0 / 0 / 0 at both widths |
| Uncaught JS errors / external requests | None observed | None observed |

The harness checks amount bounds, recalculated amounts/fee/total, the full Vietnamese recipient, edit/data retention, recoverable first failure, retry success, simulation disclosure and document overflow. It does not measure user comprehension, confidence, task time, screen-reader usability or layout quality. Passing the same checks provides regression evidence, not a measured UX gain.

**Manual review remains necessary.** Both versions have axe contrast checks marked incomplete for non-text symbols. The new initial state additionally has an incomplete \`aria-prohibited-attr\` check: a generic quote \`div\` has an \`aria-label\` without an appropriate role. In the captured Linux environment, the new disclosure's decorative ⓘ appears as a missing-glyph box. The Vietnamese recipient is visibly rendered, but this is not a font-coverage certification. No accessibility conformance claim is made.

## First viewport: a remaining layout cost

Initial unscrolled control top positions, in CSS pixels, are measured in [fold-observations.json](evidence/fold-observations.json). “Fully visible” includes the complete button box. Lower values alone do not establish an easier task.

| Case | Viewport | Recipient y | Amount y | Review action y | Review action fully visible |
| --- | --- | --- | --- | --- | --- |
${foldRows}

The recipient input starts earlier in the new mobile page, while the review action remains below the initial 844px viewport in both versions. The revised card still uses considerable vertical space. There is no evidence here that the new layout eliminates the user's “AI slop” concern. No corrective edits were made after capture.

## What reference research actually happened

The creator inspected the VoltAgent collection index and the official GOV.UK check-answers/confirmation documentation with inline HTML. The attempted pinned Wise DESIGN.md and its raw URL both failed with cache misses; **the exact Wise document was not read**. No external product was rendered, and no upstream code, assets or brand tokens were copied. The selected review/receipt relationship is a design inference from the inspected task patterns. URLs, dates, licensing scope, adaptations and rejected alternatives are in the submitted [UX_PLAN.md](cases/r01/UX_PLAN.md).

This demonstrates the provenance/failure-reporting workflow as much as the UI output. The hand-authored [worked plans](../../../examples/ux-plans/transfer.md) were not supplied as the creator's answer.

## CLI limitation preserved

CLI 0.1.0 found no compatible direction for the required Vietnamese language plus system-font delivery. The creator kept both constraints and used a documented manual visual treatment. Only \`brief.json\` and \`config.json\` were retained under \`.tasteforge\`; **no generated DNA or CSS tokens exist in r01**. The submitted \`suggestions.json\` is zero bytes, not valid JSON. The operator separately reproduced the failed suggestion in [cli-suggestion-check.json](evidence/cli-suggestion-check.json), without altering the submission. This coverage gap remains unresolved in the current visual catalog.

## Method and limits

- One new generation using the same requested model name, task, fixture, bare starter and hooks as c02; no old outputs or design feedback supplied to the creator.
- The revised skill snapshot is frozen separately with hashes. Research was newly permitted, and tool/time context differs. The original sample was reused, not generated concurrently with a matched budget.
- CLI seed 42 is not a model generation seed. Exact backend snapshot, inference seed, token usage and equal compute were not controlled.
- Actual Chromium captures use the original pinned harness/settings: light theme, reduced motion, en-US locale, Asia/Ho_Chi_Minh timezone, device scale 1. Browser evidence includes initial/full, keyboard-focus, review, failure and success captures at both widths.
- No new independent ratings, human testing, neutral-wireframe study, replicated comparison or causal improvement estimate. Earlier pilot ratings remain exactly as recorded.

For a stronger evaluation, repeat baseline, frozen-original-skill and revised-skill conditions with equivalent reference/rendering access and budgets, then assess neutral structure and actual tasks independently before revealing visual treatment. The [methodology](../../README.md#evaluating-structure-and-reference-use) describes this next study; it is not claimed as completed.
`);

await writeFile(path.join(runRoot, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TasteForge — reference-led follow-up</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f5f3ee;color:#202722;font:16px/1.55 system-ui,sans-serif}a{color:#204b3c;text-underline-offset:3px}main{max-width:1440px;margin:auto;padding:32px}header{max-width:860px}.eyebrow{font:700 12px/1.4 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#4d5f52}h1{font-size:clamp(28px,4vw,43px);letter-spacing:-.035em;line-height:1.15;margin:12px 0 16px}h2{font-size:20px;margin:0 0 8px}p{margin:0 0 16px}.note{padding:16px 20px;background:#ebe7dc;border-left:3px solid #776645;margin:20px 0}.links{display:flex;gap:18px;flex-wrap:wrap;margin:20px 0}.controls{display:flex;gap:24px;flex-wrap:wrap;align-items:end;margin:28px 0 20px;padding:20px 0;border-block:1px solid #cbd0c7}label{font-size:14px;font-weight:650;display:grid;gap:6px}select{min-height:44px;min-width:180px;font:inherit;background:#fff;color:#202722;border:1px solid #697b6c;border-radius:4px;padding:7px 36px 7px 10px}select:focus-visible,a:focus-visible{outline:3px solid #986b16;outline-offset:4px}.compare{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:start}.column{min-width:0}.caption{min-height:144px;padding:0 0 16px}.caption p{font-size:14px;color:#4b584f;max-width:580px;margin-bottom:8px}.tag{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#4b584f;display:block;margin-bottom:8px}.frame{background:#e5e8df;padding:12px;border:1px solid #bdc7b8}.frame img{display:block;width:100%;height:auto;background:#fff;max-width:100%;margin:auto}.compare.mobile .frame img{max-width:390px}.compare.mobile .frame{background:#e5e8df}.checks{font-size:13px;color:#46534a}footer{border-top:1px solid #cbd0c7;margin-top:32px;padding-top:20px;font-size:14px;max-width:900px}@media(max-width:720px){main{padding:20px 16px}.compare{grid-template-columns:1fr;gap:32px}.caption{min-height:0}.controls{gap:16px}select{min-width:150px}h1{font-size:32px}}
</style></head><body><main>
<header><div class="eyebrow">TasteForge / qualitative follow-up / 01 Nov 2026</div><h1>Change the task structure.<br>Then judge the result.</h1><p>Same transfer prompt and fixture. Same requested creator model: gpt-6.1-sol. Compare the original assisted UI with one fresh output using the revised reference-led skill.</p></header>
<div class="note"><strong>One unmatched follow-up, no winner claimed.</strong> Both UIs pass the same automated task checks. The new mobile review action is still below the first viewport, and manual accessibility issues remain. Research/tool context differs; the original sample was reused.</div>
<nav class="links" aria-label="Evidence"><a href="report.md">Observations & limits</a><a href="cases/r01/UX_PLAN.md">Submitted UX plan</a><a href="results.json">Measured results</a><a href="../2026-11-01-ui-pilot/">Original eight-case pilot</a></nav>
<div class="controls"><label for="viewport">Viewport<select id="viewport"><option value="desktop">Desktop · 1440 × 1000</option><option value="mobile">Mobile · 390 × 844</option></select></label><label for="state">Captured state<select id="state"><option value="initial">Initial viewport</option><option value="full">Full initial page</option><option value="review">Review</option><option value="failure">Recoverable failure</option><option value="success">Simulation complete</option></select></label><span class="checks">Actual Chromium screenshots · unmodified submissions</span></div>
<section id="comparison" class="compare" aria-label="UI comparison">
<article class="column"><div class="caption"><span class="tag">Original pilot · c02 · assisted</span><h2>Intro + form and quote</h2><p>A large introduction leads to a form beside a persistent quote on desktop. The regions stack on mobile.</p><a href="../2026-11-01-ui-pilot/cases/c02/">Open original UI</a></div><div class="frame"><img id="original-image" src="comparison/original-c02-desktop-initial.png" alt="Original assisted transfer UI, desktop initial viewport"></div></article>
<article class="column"><div class="caption"><span class="tag">Revised skill · r01 · manual visual fallback</span><h2>Input → cost ledger → receipt</h2><p>A documented structure choice places cost after the input, then opens a dedicated receipt for confirmation.</p><a href="cases/r01/">Open follow-up UI</a></div><div class="frame"><img id="followup-image" src="evidence/r01/desktop-initial.png" alt="Reference-led transfer UI, desktop initial viewport"></div></article>
</section>
<footer><p>The new creator inspected GOV.UK task-pattern documentation and the VoltAgent collection index. The exact Wise DESIGN.md failed to load; no Wise tokens were imported. CLI 0.1.0 could not satisfy Vietnamese plus system-font delivery, so r01 preserves a documented manual treatment without generated DNA.</p><p>Source plans, failed attempts, screenshots and hashes are retained. Different composition and passing automated checks do not establish better UX. <a href="README.md">Read the method and reproduce checks.</a></p></footer>
</main><script>
const viewport=document.getElementById('viewport'),state=document.getElementById('state');
function update(){const v=viewport.value,s=state.value;document.getElementById('comparison').classList.toggle('mobile',v==='mobile');const a=document.getElementById('original-image'),b=document.getElementById('followup-image');a.src='comparison/original-c02-'+v+'-'+s+'.png';b.src='evidence/r01/'+v+'-'+s+'.png';a.alt='Original assisted transfer UI, '+v+' '+state.selectedOptions[0].text;b.alt='Reference-led transfer UI, '+v+' '+state.selectedOptions[0].text;}
viewport.addEventListener('change',update);state.addEventListener('change',update);
</script></body></html>`);

// Bind the report/viewer and all raw evidence. Generated checker screenshots are
// intentionally outside this fixed set and never modify submitted case files.
async function filesIn(dir) {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await filesIn(file));
    else if (entry.isFile()) output.push(file);
  }
  return output;
}
const bound = [
  ...await filesIn(path.join(runRoot, 'cases')),
  ...await filesIn(path.join(runRoot, 'treatment')),
  ...await filesIn(path.join(runRoot, 'evidence/r01')),
  ...await filesIn(path.join(runRoot, 'comparison')),
  ...['manifest.json','README.md','report.md','results.json','index.html','evidence/fold-observations.json','evidence/cli-suggestion-check.json'].map((f) => path.join(runRoot, f)),
];
const hashes = {};
for (const file of bound.sort()) hashes[path.relative(runRoot, file).replaceAll(path.sep, '/')] = await sha(file);
await writeFile(path.join(runRoot, 'evidence/artifact-hashes.json'), JSON.stringify({ algorithm: 'sha256', files: hashes }, null, 2) + '\n');
console.log(`Published comparison; ${copies.length} original screenshot copies and ${Object.keys(hashes).length} bound artifacts.`);
