"""Publish dimension-level paired results without a composite taste score."""
import csv
import hashlib
import json
from pathlib import Path

run = Path(__file__).resolve().parent.parent
read = lambda file: json.loads((run/file).read_text())
manifest = read('manifest.json')
mapping = manifest['blindReviewMapping']
dimensions = ['entryPriority','decisionContext','narrowContext','recoveryFlow','compositionPurpose']
reviewers = {}
for reviewer in ['r1','r2']:
    neutral = read(f'reviews/reviewer-{reviewer}.neutral.json')
    authored = read(f'reviews/reviewer-{reviewer}.authored.json')
    assert len(neutral['views']) == len(authored['views']) == 12
    for stage in ['neutral','authored']:
        record = manifest['reviewStages'][reviewer][stage]
        assert hashlib.sha256((run/record['file']).read_bytes()).hexdigest() == record['sha256']
    reviewers[reviewer] = {'neutral':neutral,'authored':authored}

cases=[]
for entry in manifest['cases']:
    browser = read(f'evidence/{entry["id"]}/browser.json')
    view = next(v for v,id in mapping.items() if id==entry['id'])
    views = {}
    for name,record in browser['viewports'].items():
        primary=[c for c in record['checks'] if c['kind']!='diagnostic']
        diagnostics=[c for c in record['checks'] if c['kind']=='diagnostic']
        views[name]={'passed':sum(c['status']=='pass' for c in primary),'total':len(primary),'failed':[c for c in primary if c['status']!='pass'],'diagnostics':diagnostics,'axe':{stage:{'violations':record[stage]['violations'],'incomplete':record[stage]['incomplete']} for stage in ['axeInitial','axeFailure','axeFinal'] if stage in record},'geometry':record['stateGeometry'],'executionError':record.get('executionError'),'pageErrors':record['pageErrors']}
    cases.append({**entry,'anonymousView':view,'browser':views,'narrow320':browser['supportingNarrow320'],'reviews':{id:{stage:next(v for v in data[stage]['views'] if v['view']==view) for stage in ['neutral','authored']} for id,data in reviewers.items()}})

pairs=[]
for model in manifest['models']:
    for task in ['commerce-craft','fintech-transfer','inventory-triage']:
        block=[c for c in cases if c['model']==model and c['promptId']==task]
        baseline=next(c for c in block if c['condition']=='no-skill')
        current=next(c for c in block if c['condition']=='current-skill')
        differences={}
        for reviewer in reviewers:
            a=baseline['reviews'][reviewer]['neutral']['scores'];b=current['reviews'][reviewer]['neutral']['scores']
            differences[reviewer]={d:(b[d]-a[d] if b[d] is not None and a[d] is not None else None) for d in dimensions}
        pairs.append({'model':model,'task':task,'baseline':baseline['id'],'currentSkill':current['id'],'differences':differences})
directions={reviewer:{dimension:{'positive':sum(p['differences'][reviewer][dimension] is not None and p['differences'][reviewer][dimension]>0 for p in pairs),'tie':sum(p['differences'][reviewer][dimension]==0 for p in pairs),'negative':sum(p['differences'][reviewer][dimension] is not None and p['differences'][reviewer][dimension]<0 for p in pairs),'unassessed':sum(p['differences'][reviewer][dimension] is None for p in pairs)} for dimension in dimensions} for reviewer in reviewers}
sensitivityPairs=[p for p in pairs if not (p['model']=='gpt-6-luna' and p['task']=='inventory-triage')]
sensitivity={reviewer:{dimension:{'positive':sum(p['differences'][reviewer][dimension] is not None and p['differences'][reviewer][dimension]>0 for p in sensitivityPairs),'tie':sum(p['differences'][reviewer][dimension]==0 for p in sensitivityPairs),'negative':sum(p['differences'][reviewer][dimension] is not None and p['differences'][reviewer][dimension]<0 for p in sensitivityPairs)} for dimension in dimensions} for reviewer in reviewers}
disagreements=[{'case':c['id'],'view':c['anonymousView'],'dimension':d,'r1':c['reviews']['r1']['neutral']['scores'][d],'r2':c['reviews']['r2']['neutral']['scores'][d]} for c in cases for d in dimensions if c['reviews']['r1']['neutral']['scores'][d]!=c['reviews']['r2']['neutral']['scores'][d]]
results={'type':manifest['type'],'sample':{'cases':12,'pairedBlocks':6,'replicatesPerCell':1},'dimensions':dimensions,'cases':cases,'pairs':pairs,'directionCounts':directions,'postHocSensitivity':{'excludedBlock':{'model':'gpt-6-luna','task':'inventory-triage','reason':'Neutral CSS hid the target row in u10; authored images show it. Do not count that artifact as an authored UX gain.'},'remainingBlocks':5,'directionCounts':sensitivity,'notPreregistered':True},'scoreDisagreements':disagreements,'limitations':manifest['limitations'],'noCompositeScore':True}
(run/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
with (run/'reviews/ratings.csv').open('w',newline='') as stream:
    writer=csv.writer(stream);writer.writerow(['reviewer','view','case','model','task','condition',*dimensions])
    for c in cases:
        for reviewer in reviewers:writer.writerow([reviewer,c['anonymousView'],c['id'],c['model'],c['promptId'],c['condition'],*[c['reviews'][reviewer]['neutral']['scores'][d] for d in dimensions]])
pairRows=[]
for p in pairs:
    for reviewer in reviewers:pairRows.append('| '+ ' | '.join([p['model'],p['task'],reviewer,*[f'{p["differences"][reviewer][d]:+d}' if p['differences'][reviewer][d] is not None else 'n/a' for d in dimensions]])+' |')
countRows=['| '+ ' | '.join([reviewer,d,str(v['positive']),str(v['tie']),str(v['negative']),str(v['unassessed'])])+' |' for reviewer,data in directions.items() for d,v in data.items()]
sensitivityRows=['| '+' | '.join([reviewer,d,str(v['positive']),str(v['tie']),str(v['negative'])])+' |' for reviewer,data in sensitivity.items() for d,v in data.items()]
caseRows=[]
for c in cases:
    counts=[f'{r["passed"]}/{r["total"]}' for r in c['browser'].values()]
    axe=[str(len(r['axe']['axeInitial']['violations'])) for r in c['browser'].values()]
    technical=', '.join(x['name'] for r in c['browser'].values() for x in r['diagnostics'] if x['status']!='pass') or '—'
    width=c['narrow320']['scrollWidth']
    caseRows.append('| '+' | '.join([c['id'],c['model'],c['promptId'],c['condition'],' / '.join(counts),' / '.join(axe),str(width),technical])+' |')
notes=[]
for task in ['commerce-craft','fintech-transfer','inventory-triage']:
    notes.append(f'### {task}\n')
    for c in [c for c in cases if c['promptId']==task]:
        notes.append(f'**{c["id"]} — {c["model"]}, {c["condition"]}.**')
        for reviewer in reviewers:
            review=c['reviews'][reviewer]['neutral'];authored=c['reviews'][reviewer]['authored']
            notes.append(f'- {reviewer}: {review["genericityNote"]} Authored effect: {authored["effect"]}. {authored["evidence"]}')
        notes.append('')
body=f'''# UX/layout comparison: findings and limits

Twelve fresh UIs were built for three fictional tasks by two requested creator models, with/without the frozen current TasteForge skill. Two independent AI reviewers inspected neutralized layouts before seeing authored visual treatments. This is a small exploratory comparison: one generation per model/task/condition, six heterogeneous paired blocks, no representative users or population-level improvement estimate.

**There is evidence of localized improvement in decision grouping and task flow, but no reliable demonstration that layout has escaped generic composition.** Both reviewers favored decision context in multiple pairs even before authored visuals. Mobile evidence is mixed, including one regression and a real 320px overflow. Familiar product/form/list-detail shells remain common. Conventional patterns can serve the task well; novelty or resemblance alone does not establish UX quality or AI authorship. No overall taste score is calculated.

The strongest concrete difference is Sol inventory u07: mobile replaces the list with focused detail/review and shows retained filter/search context; baseline u01 keeps the list above the decision, requiring a longer route down the page. Both remain conventional list/detail structures and pass the same scripted task. Sol transfer u11 keeps cost/consequence information near review, but still overflows at 320px. Luna inventory requires special caution: the neutralizer hid a visible baseline row, inflating an apparent benefit; that block is excluded from the sensitivity interpretation below.

Open the [paired gallery](index.html), [frozen protocol](protocol.md), [raw ratings](reviews/ratings.csv), [machine-readable results](results.json), and [harness corrections](harness-notes.md). Gallery defaults to neutralized layouts with condition labels hidden; reveal authored renders and conditions deliberately.

## Paired neutral-layout judgments

Entries are **current skill minus no skill**, kept separately for each reviewer. Positive means a higher score on that dimension in that one block. These ordinal differences are descriptive, not calibrated effect sizes or statistical significance.

| Model | Task | Reviewer | Entry priority | Decision context | Narrow context | Recovery flow | Composition purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
{chr(10).join(pairRows)}

Direction counts across six blocks, with each dimension/reviewer retained:

| Reviewer | Dimension | Higher | Tied | Lower | Unassessed |
| --- | --- | --- | --- | --- | --- |
{chr(10).join(countRows)}

Reviewers differed on **{len(disagreements)} of 60 case/dimension cells**. Original scores and explanations remain unchanged. Authored-stage notes are appended separately; no retroactive neutral-score adjustment or silent reconciliation was performed. Concrete judgments and caveats are below; full evidence is in each reviewer JSON.

### Neutralization artifact and sensitivity check

Both reviewers found the LIN-115 row blank in neutral view-01 (u10). **It is visible in the authored UI.** The generic neutral CSS made a previously transparent positioning span white, obscuring the row. Both authored-stage notes identify this distortion. The original neutral scores are retained, but that apparent blocker is not an authored app failure and cannot support a treatment benefit.

As a clearly labeled **post-hoc sensitivity check**, omit the entire Luna/inventory block rather than selectively changing scores. The remaining five blocks still show decision-context improvements for r1 in 3/5 and r2 in 4/5, with the rest tied. Narrow-layout judgments differ: r1 higher in 4/5, tied in 1; r2 higher in 1/5, tied in 3, lower in 1. That disagreement rules out a blanket mobile-layout claim. Composition-purpose improvements are 2/5 for r1 and 3/5 for r2, with remaining blocks tied: limited evidence of purposeful grouping, not a wholesale structural transformation.

| Reviewer | Dimension | Higher | Tied | Lower |
| --- | --- | --- | --- | --- |
{chr(10).join(sensitivityRows)}

This omission was not preregistered and is not a new controlled estimate. It prevents a known rendering artifact from being advertised as a UX gain. The bad neutral packet, raw scores and authored corrections remain available for audit.

## Actual scripted task and accessibility evidence

Contract/execution counts exclude diagnostics; the commerce shipping-inclusive total is a contract check in this study. Columns show desktop / mobile. An axe count is the number of initial violating rules, not affected nodes, task failures or a complete accessibility judgment. Incomplete axe checks require review too.

| Case | Model | Task | Condition | Task checks, wide / narrow | Initial axe rules, wide / narrow | Initial document width at 320px | Failed technical diagnostic |
| --- | --- | --- | --- | --- | --- | --- | --- |
{chr(10).join(caseRows)}

The shared scripts exercise explicit costs and quantities, prohibited selections/bounds, review, edit/data retention, simulated first failure, retry and clear outcome. Inventory includes no-results recovery and preserving search/filter context. This verifies those interactions under scripted actions; it does not measure comprehension, confidence, task time, repeated expert work or screen-reader use. The 320px check is initial-page supporting evidence only, not a full 320px task flow or zoom study.

All initial 390px pages fit the document width. u11 still overflows at the supporting 320px width (342px document); passing at 390px is insufficient. u12 omitted the dedicated item-selection hook; its row-based user task was exercised with a documented fallback, while the diagnostic remains failed. Several cases retain contrast and, in u09, label findings. No accessibility conformance claim is made. Reviewers' aesthetic preference cannot override these implementation issues.

## What reviewers actually observed

{chr(10).join(notes)}

## Fairness, resource use and remaining uncertainty

- Same task/fixture/starter/asset bytes within task; same static HTML/CSS/JS environment, system-font/no-network constraints, offline CLI/catalog access and two-viewport self-preview helper. No previous outputs or design feedback were given to creators. Current-skill instruction is the assigned treatment; CLI/reference use was optional under equal access. Actual tool use is retained in case notes/files and must not be assumed equal merely because tools were available.
- Models were requested as gpt-6.1-sol and gpt-6-luna. Sampling seed 42 belongs to TasteForge, not model generation. Exact backend snapshots, inference seeds, token counts, costs and matched compute were not exposed. Twelve-minute creation target was soft. Scheduling was shuffled before creation. These limits prevent strong causal attribution.
- Review r1 used gpt-6.1-sol in packet order; r2 used gpt-6.1-terra in reverse order, both fresh contexts. Each inspected 48 neutral and 36 authored images. Stage files were hashed before authored release and remain frozen. Condition blindness is best effort; layout choices can hint at treatment. Reviewers are AI agents, not end users; cross-model consistency does not replace user testing.
- Neutral CSS is diagnostic: removing color/shadow/radius and replacing font family can alter wrapping or obscure color-only cues. Original geometry measurements and task checks were collected before injection. Authored-stage caveats qualify neutral observations. No source implementation or plans were shown to reviewers.
- Original pilot/reference-follow-up/catalog-probe records were not modified or reused as controls. This task contract is stronger than the old pilot, so pass rates and scores are not comparable across runs. The current 642-record library is a reference source, not a guarantee of structural improvement.
- Operator corrected harness assumptions uniformly before review and retained stopped traces. No submitted UI was repaired, filtered out or renamed to hide defects. See [harness notes](harness-notes.md).
- OpenCode 1.19.3 listed both requested free models. Tiny no-tools calls to DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free both reached the provider and received “Free usage limit reached”; no supplemental UI was produced or scored. The CLI then stayed open until the 90-second timeout. Isolated logs and call records are retained in [OpenCode availability evidence](evidence/opencode-availability/). No paid fallback or existing credential access was used.

Further evidence requires repeated generations per block and representative users completing the task, including narrow/zoom states, correction/recovery and comprehension of consequences. This run can show specific strengths/regressions; it cannot establish that the skill reliably eliminates generic AI composition.
'''
(run/'report.md').write_text(body)
print(json.dumps({'cases':len(cases),'pairs':len(pairs),'scoreDisagreements':len(disagreements),'directions':directions},indent=2))
