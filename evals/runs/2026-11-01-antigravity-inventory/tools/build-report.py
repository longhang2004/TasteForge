"""Publish actual two-case evidence and unmodified independent judgments."""
from pathlib import Path
import csv
import json

run=Path(__file__).resolve().parent.parent
read=lambda file:json.loads((run/file).read_text())
manifest=read('manifest.json')
dimensions=['entryPriority','decisionContext','narrowContext','recoveryFlow','compositionPurpose']
reviewers={id:read(f'reviews/reviewer-{id}.json') for id in ['r1','r2']}
cases=[]
for case in manifest['cases']:
    id=case['id'];browser=read(f'evidence/{id}/browser.json');generation=read(f'evidence/{id}/generation.json')
    view=next(v for v,c in manifest['anonymousMapping'].items() if c==id)
    observations={}
    for name,result in browser['viewports'].items():
        checks=[c for c in result['checks'] if c['kind']!='diagnostic']
        observations[name]={'passed':sum(c['status']=='pass' for c in checks),'total':len(checks),'failed':[c for c in checks if c['status']!='pass'],'diagnostics':[c for c in result['checks'] if c['kind']=='diagnostic'],'executionError':result.get('executionError'),'geometry':result['stateGeometry'],'axe':{s:{'violations':result[s]['violations'],'incomplete':result[s]['incomplete']} for s in ['axeInitial','axeFailure','axeFinal'] if s in result},'pageErrors':result['pageErrors'],'blockedRequests':result['blockedRequests']}
    events=[json.loads(line) for line in (run/f'evidence/{id}/cli-events.ndjson').read_text().splitlines() if line.startswith('{')]
    calls=[e['step_update'] for e in events if e.get('step_update',{}).get('step_type')=='tool' and e['step_update'].get('state') in ['DONE','ERROR']]
    commands=[c.get('tool_info',{}).get('parameters',{}).get('CommandLine','') for c in calls if c.get('tool_name')=='run_command']
    caseData={**case,'anonymousView':view,'browser':observations,'narrow320':browser['supportingNarrow320'],'generationResult':generation['result'],'generationDurationSeconds':generation['durationSeconds'],'toolUse':{'finishedToolSteps':len(calls),'commands':commands,'previewInvocations':sum('preview.mjs' in c for c in commands),'toolErrors':[c for c in calls if c.get('state')=='ERROR']},'reviews':{id:next(s for s in reviewer['samples'] if s['view']==view) for id,reviewer in reviewers.items()}}
    cases.append(caseData)
baseline=next(c for c in cases if c['condition']=='no-skill');assisted=next(c for c in cases if c['condition']=='current-skill')
differences={r:{d:assisted['reviews'][r]['scores'][d]-baseline['reviews'][r]['scores'][d] if assisted['reviews'][r]['scores'][d] is not None and baseline['reviews'][r]['scores'][d] is not None else None for d in dimensions} for r in reviewers}
disagreements=[{'case':c['id'],'dimension':d,'r1':c['reviews']['r1']['scores'][d],'r2':c['reviews']['r2']['scores'][d]} for c in cases for d in dimensions if c['reviews']['r1']['scores'][d]!=c['reviews']['r2']['scores'][d]]
results={'type':manifest['type'],'host':manifest['host'],'model':manifest['model'],'effort':manifest['effort'],'pairedBlocks':1,'replicatesPerCondition':1,'dimensions':dimensions,'cases':cases,'differencesCurrentMinusNoSkill':differences,'reviewDisagreements':disagreements,'reviewerComparisons':{id:r['comparison'] for id,r in reviewers.items()},'limitations':manifest['limitations'],'deviations':manifest.get('deviations',[]),'noCompositeScore':True}
(run/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
with (run/'reviews/ratings.csv').open('w',newline='') as f:
    writer=csv.writer(f);writer.writerow(['reviewer','view','case','condition',*dimensions])
    for c in cases:
        for r in reviewers:writer.writerow([r,c['anonymousView'],c['id'],c['condition'],*[c['reviews'][r]['scores'][d] for d in dimensions]])
rows=[];scores=[];usage=[];notes=[]
for c in cases:
    b=c['browser'];n=c['narrow320'];g=c['generationResult'];u=g.get('usage',{}) if g else {}
    rows.append('| '+' | '.join([c['id'],c['condition'],f'{b["desktop"]["passed"]}/{b["desktop"]["total"]}',f'{b["mobile"]["passed"]}/{b["mobile"]["total"]}',str(len(b['desktop'].get('axe',{}).get('axeInitial',{}).get('violations',[]))),str(len(b['mobile'].get('axe',{}).get('axeInitial',{}).get('violations',[]))),str(n['scrollWidth'])])+' |')
    usage.append('| '+' | '.join([c['id'],str(round(c['generationDurationSeconds'],1)),str(u.get('input_tokens','unavailable')),str(u.get('output_tokens','unavailable')),str(u.get('thinking_tokens','unavailable')),str(u.get('cache_read_tokens','unavailable')),str(len(c['toolUse']['commands']))])+' |')
    for r in reviewers:
        review=c['reviews'][r]
        scores.append('| '+' | '.join([r,c['id'],c['condition'],*[str(review['scores'][d]) for d in dimensions]])+' |')
        notes.append(f'### {c["id"]} / {r}\n\n{review["genericityNote"]}\n')
        notes.extend(f'- **{d}:** {review["evidence"][d]}' for d in dimensions)
        notes.append(f'- **Blockers:** {json.dumps(review["blockers"],ensure_ascii=False)}')
        notes.append(f'- **Unnecessary regions:** {json.dumps(review["unnecessaryRegions"],ensure_ascii=False)}')
        notes.append(f'- **Monochrome caveat:** {review["monochromeCaveat"]}\n')
deltaRows=['| '+' | '.join([r,*[str(differences[r][d]) for d in dimensions]])+' |' for r in reviewers]
body=f'''# Antigravity inventory pair: observed findings

Two fresh native Antigravity CLI 1.4.12 sessions requested Gemini 3.8 Flash (Medium), effort medium, on the same inventory task and fixture. One receives the frozen TasteForge skill; the other receives no skill. This is **one host/model pair**, separate from the twelve-UI Codex study. It cannot establish general improvement, rank hosts/models, or isolate data/tool/instruction effects beyond the actual matched access here.

**The native CLI worked, and both reviewers favor the skill-assisted mobile grouping by one score point. Neither design escapes the familiar stacked list/detail/card shell.** The no-skill desktop table is more compact for cross-item comparison; the assisted design makes shortage meaning and evidence quantities more explicit. Both retain long mobile paths and repeated information. Recovery scores tie. This supports a specific local improvement, not a universal anti-slop claim.

Open the [comparison viewer](index.html), [protocol](protocol.md), [full results](results.json), [raw ratings](reviews/ratings.csv), or [bootstrap notes](bootstrap-notes.md). The README records the operator's evidence-qualified interpretation after reviewing these actual outputs.

## Actual task behavior

Contract/execution checks exclude technical diagnostics. Wide = 1440 × 1000; mobile = 390 × 844. Initial axe counts are violating **rules**, not nodes or a conformance score. The 320px column is an initial-page width measurement, not a full task/zoom study.

| Case | Condition | Wide checks | Mobile checks | Wide initial axe rules | Mobile initial axe rules | Document width at 320px |
| --- | --- | --- | --- | --- | --- | --- |
{chr(10).join(rows)}

The scripted path filters the three shortages, recovers from no results, selects LIN-115, checks item evidence, returns with context, rejects invalid quantities, reviews/edits the decision, exercises first-save failure and retries to success. Missing hooks or an early failure remain in the trace; unvisited states are not inferred. Script success verifies those operations, not comprehension, ease, real warehouse policy or screen-reader usability. See each `evidence/<case>/browser.json` for failed checks, diagnostics, axe incomplete checks, geometry and screenshots.

## Independent task/layout judgments

Two fresh AI reviewers see anonymous sample IDs, task/fixture and actual observations, with no condition/source/plan/log/model assignment. Each inspects four monochrome and four authored screenshots per sample where available, reading monochrome before authored for that sample. This is **not** the original study's separately hash-frozen neutral/authored two-stage review; these scores are combined evidence-qualified judgments and must not be compared numerically across studies. Monochrome preserves transparency/luminance but font replacement may reflow. AI reviewers are not warehouse operators or representative users.

Scores are separate dimensions (1 blocking/seriously obscured through 5 particularly strong in inspected evidence), never an aggregate taste/slop score.

| Reviewer | Case | Condition | Entry priority | Decision context | Narrow context | Recovery | Composition purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
{chr(10).join(scores)}

Current-skill minus no-skill differences, one pair only; ordinal descriptive differences, not calibrated effect sizes:

| Reviewer | Entry priority | Decision context | Narrow context | Recovery | Composition purpose |
| --- | --- | --- | --- | --- | --- |
{chr(10).join(deltaRows)}

Reviewers disagree in {len(disagreements)} of 10 case/dimension cells. Raw judgments are retained unchanged. They are not silently reconciled into a winner.

{chr(10).join(notes)}

## Actual generation/resource context

Fresh creation sessions after the uniformly corrected bootstrap rule. CLI-reported token categories are reproduced as supplied, with no pricing or cross-host token equivalence assumed. Initial blocked bootstrap/probe usage is separate in its original envelopes, not hidden in creation totals. Duration is operator wall time, not measured user task time.

| Case | Creation seconds | Input tokens | Output tokens | Thinking tokens | Cache read tokens | Command tool steps |
| --- | --- | --- | --- | --- | --- | --- |
{chr(10).join(usage)}

All actual native command calls, tool errors, model initialization and terminal envelopes remain under `evidence/<case>/`. Task/fixture, prompt, settings, skill/catalog and runtime hashes are recorded. Identical tool access does not mean identical tool use. Both groups had the same preview helper, but actual inspection/deviations must be read from traces and creator notes.

The assisted creation took about 578 seconds versus 471 seconds for no skill (about 23% longer in this single sample), and the CLI reports roughly twice the input tokens, with cached input reported separately. These values are actual observations, not a general overhead estimate or a billing calculation. The baseline invoked the preview helper **twice** and read four PNGs, exceeding the specified one invocation; the assisted case invoked it once and read two PNGs. Both have one self-review iteration, but actual render access/use was not matched. The helper overwrote the baseline's first preview files; the submitted final self-previews and operator captures are retained.

Both creator notes claim no unverified requirements. Treat those as overbroad self-reports: their traces establish initial-image inspection and, for the assisted case, source auditing, not the complete interaction/accessibility checks. Actual task evidence comes from the separate operator harness. Its later-state contrast/target findings remain unresolved even though the assisted static audit reported zero errors/warnings.

## Operational deviations and limits

- The first sessions soft-denied the same WSL directory-listing command before creating UIs. They returned a misleading zero/SUCCESS envelope with empty response and denied actions. Both are preserved under `bootstrap-01`; neither is presented as a completed UI. A scoped read-only regex-matcher probe established the Windows literal-prefix cause, followed by fresh sessions with the same matching correction. No global permission change, shell substitution, all-permissions bypass, account switch or key extraction.
- One model, task and generation per condition; soft budget and model stochasticity; no controlled inference seed or exposed backend snapshot. Existing global Antigravity customizations may affect context; no claim of a fully isolated host system prompt.
- Offline static UI, fictional stock snapshot and simulated local decision recording; no real ordering/inventory service or actual data freshness guarantee. Upstream reference material is untrusted, and imported styles do not certify font coverage/contrast/layout fit.
- Final sources are preserved without operator repair. Chromium checks are actual, but only named states/actions are exercised. 320px is supporting initial evidence; zoom, complete screen-reader use, real-user comprehension and time are unassessed.
- Monochrome is a diagnostic, not an exact neutral wireframe. Transparent overlays remain transparent to avoid the previous study's known white-overlay defect. Do not infer improvement merely from styling, a shorter page, passing scripts, or different sampling IDs.

This pair can expose concrete useful relationships and regressions. Reliable claims require repeated creation samples and users completing the task, checking consequences, correcting mistakes and recovering at narrow widths.
'''
(run/'report.md').write_text(body)
print(json.dumps({'differences':differences,'reviewDisagreements':len(disagreements)},indent=2))
