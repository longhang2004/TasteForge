from pathlib import Path
import json, csv, io, hashlib, statistics

run = Path(__file__).resolve().parent.parent
manifest = json.loads((run/'manifest.json').read_text())
reviews = {name: json.loads((run/'reviews'/f'reviewer-{name}.json').read_text()) for name in ['r1','r2']}
dimensions = ['taskSuccess','hierarchy','contextIdentity','typographyContent','layoutResponsive','interactionCompleteness','accessibility','systemCoherence','evidenceIntegrity']
labels = ['Task success','Information hierarchy','Context and identity','Typography and content','Layout and responsiveness','Interaction completeness','Accessibility evidence','System coherence','Evidence integrity']
mapping = manifest['blindReviewMapping']
inverse = {case: anon for anon,case in mapping.items()}
reviewers = {'r1':{'model':'gpt-6.1-sol','agentId':'/root/review_r1'},'r2':{'model':'gpt-6.1-terra','agentId':'/root/review_r2'}}
ratings = {}
for who,review in reviews.items():
    assert {item['id'] for item in review['cases']} == set(mapping)
    ratings[who] = {item['id']:item for item in review['cases']}
    for item in review['cases']:
        assert set(item['ratings']) == set(dimensions)
        for value in item['ratings'].values():
            assert value['score'] is None or isinstance(value['score'],int) and 1<=value['score']<=5
            assert value['confidence'] in ['low','medium','high'] and value['evidence'].strip()
    reviewers[who]['ratingFileSha256']=hashlib.sha256((run/'reviews'/f'reviewer-{who}.json').read_bytes()).hexdigest()
manifest['reviewers']=reviewers
observations=[]
csv_rows=[]
disagreements=[]
for entry in manifest['cases']:
    browser=json.loads((run/'evidence'/entry['id']/'browser.json').read_text())
    by_view={}
    for viewport,result in browser['viewports'].items():
        required=[c for c in result['checks'] if c['kind']!='diagnostic']
        by_view[viewport]={
          'requiredPassed':sum(c['status']=='pass' for c in required),'requiredTotal':len(required),
          'requiredFailures':[c for c in required if c['status']!='pass'],
          'optionalUnmet':[c for c in result['checks'] if c['kind']=='diagnostic' and c['status']=='fail'],
          'initialAxeRules':[i['id'] for i in result['axeInitial']['violations']],
          'initialAxeAffectedElements':sum(len(i['nodes']) for i in result['axeInitial']['violations']),
          'pageErrors':result['pageErrors'],'horizontalOverflow':result['layout']['scrollWidth']>result['viewport']['width']+1,
        }
    item={**{k:entry[k] for k in ['id','model','condition','promptId']},'anonymousReviewId':inverse[entry['id']],'viewports':by_view,'reviewerRatings':{who:ratings[who][inverse[entry['id']]] for who in ratings}}
    observations.append(item)
    for dimension,label in zip(dimensions,labels):
        values=[]
        for who in ratings:
            score=ratings[who][inverse[entry['id']]]['ratings'][dimension]['score']
            csv_rows.append([entry['id'],entry['model'],entry['condition'],entry['promptId'],who,dimension,score])
            if score is not None: values.append(score)
        if len(values)==2 and values[0]!=values[1]:disagreements.append({'caseId':entry['id'],'dimension':dimension,'r1':values[0],'r2':values[1]})

def mean(case,dimension):
    scores=[r['ratings'][dimension]['score'] for r in case['reviewerRatings'].values()]
    valid=[s for s in scores if s is not None]
    return statistics.mean(valid) if valid else None
def number(value):return 'unassessed' if value is None else str(value).removesuffix('.0')
groups=[]
for model in ['gpt-6.1-sol','gpt-6-luna']:
    for prompt in ['commerce-craft','fintech-transfer']:
        pair={c['condition']:c for c in observations if c['model']==model and c['promptId']==prompt}
        base=pair['baseline'];treatment=pair['tasteforge']
        comparisons=[]
        for dimension,label in zip(dimensions,labels):
            a,b=mean(base,dimension),mean(treatment,dimension)
            comparisons.append({'dimension':dimension,'label':label,'baselineMean':a,'tasteforgeMean':b,'difference':b-a if a is not None and b is not None else None})
        groups.append({'model':model,'promptId':prompt,'baselineCase':base['id'],'tasteforgeCase':treatment['id'],'dimensions':comparisons})

summary={
 'studyType':'exploratory pilot; not a statistical or causal benchmark',
 'uiCount':8,'matchedPairs':4,'requestedCreatorModels':['gpt-6.1-sol','gpt-6-luna'],
 'allCasesPassedRequiredTaskChecks':all(all(v['requiredPassed']==v['requiredTotal'] for v in c['viewports'].values()) for c in observations),
 'baselineCasesWithInitialContrastFindings':sum(c['condition']=='baseline' and any('color-contrast' in v['initialAxeRules'] for v in c['viewports'].values()) for c in observations),
 'tasteforgeCasesWithInitialContrastFindings':sum(c['condition']=='tasteforge' and any('color-contrast' in v['initialAxeRules'] for v in c['viewports'].values()) for c in observations),
 'reviewers':reviewers,'ratingDisagreements':disagreements,'pairs':groups,'cases':observations,
 'limitations':['One generation per condition in each pair; only two prompts.','Model sampling seeds, token usage, backend snapshots, and inference settings are not exposed.','Tool/bootstrap interventions are disclosed; eight-minute budget was an aim, not an enforced compute limit.','Isolation was instructed through fresh no-history agents, not enforced by an OS sandbox separating case read access.','Two AI reviewers in fresh contexts, not independent human users; correlated model judgments are possible.','Creators did not receive rendered feedback. Operator inspected outputs only after submission and did not repair them.','Task-state captures follow browser action/scroll behavior; initial top/full-page screenshots share the capture policy.','Static/browser checks cover the saved states only; no full screen-reader, zoom/reflow, target-size, or accessibility certification.','The treatment bundles skill instructions, references, CLI, and generated guidance; this pilot does not isolate their individual contributions.']
}
(run/'results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
out=io.StringIO();writer=csv.writer(out);writer.writerow(['caseId','model','condition','promptId','reviewer','dimension','score']);writer.writerows(csv_rows)
(run/'reviews/ratings.csv').write_text(out.getvalue())

lines=['# TasteForge UI pilot results — 1 November 2026',
 '\nEight unmodified UIs were generated by fresh subagents: two requested model IDs × two product prompts × without/with TasteForge. Both conditions received the same product task, fixture, starter, behavior contract, and self-review allowance. The treatment additionally used the frozen skill and local CLI. See the [protocol](protocol.md) and [manifest](manifest.json).',
 '\n## What this pilot observed',
 '\n- All eight implementations completed the required primary-task checks at both tested viewport sizes. The pilot did not show a difference in basic task-flow completion.',
 '- Initial-screen axe checks reported color-contrast findings in **3 of 4 baseline cases** and **0 of 4 assisted cases**. The same contrast issue also appeared in tested later states of those baseline cases. This is evidence about these implementations and states, not proof of complete accessibility or a general skill effect.',
 '- The two anonymous AI reviews rated the assisted UI higher on information hierarchy in each of the four pairs. Several other dimensions were unchanged. The gpt-6.1-sol product-page baseline was already rated strongly.',
 '- The Luna-assisted transfer received a lower layout/responsiveness rating than its matched baseline; reviewers noted mobile headline spacing and inconsistent result styling. These issues remained despite passing functional checks and having no axe findings.',
 '- Both Luna product pages displayed USD 136 for two pieces and USD 8 shipping separately rather than an explicit USD 144 order total. That optional diagnostic differed by model in these examples, not by skill condition.',
 '\nThe practical signal is promising for palette/contrast discipline and hierarchy in this sample, with remaining workflow and responsive-design weaknesses. The results do **not** establish that TasteForge always makes a better interface. There is no aggregate taste score, effect-size estimate, significance test, or improvement percentage.',
 '\n## Inspect the actual interfaces',
 '\nUse the [comparison gallery](index.html) through the static server described in [README](README.md). It supports model/prompt/viewport/state controls, randomized A/B order, condition reveal, live UI links, and direct evidence links. GitHub does not execute an HTML gallery in its file view; the [screenshot comparison](screenshots.md) is also browsable as Markdown.',
 '\n## Required tasks and automated accessibility evidence',
 '\nCounts below are required contract/execution checks on the initial and exercised task flow. Optional order-total diagnostics are excluded. Axe columns count initial-screen contrast-affected elements, not independent users, failures, or unique contrast ratios.',
 '\n| Case | Creator model | Prompt | Condition | Required desktop / mobile | Contrast-affected elements desktop / mobile |',
 '| --- | --- | --- | --- | --- | --- |']
for case in observations:
    d,m=case['viewports']['desktop'],case['viewports']['mobile']
    lines.append(f"| [{case['id']}](cases/{case['id']}/index.html) | {case['model']} | {case['promptId']} | {case['condition']} | {d['requiredPassed']}/{d['requiredTotal']} / {m['requiredPassed']}/{m['requiredTotal']} | {d['initialAxeAffectedElements']} / {m['initialAxeAffectedElements']} |")
lines += ['\nNo document horizontal overflow, uncaught browser JavaScript errors, or external resource requests were observed in the tested case viewports. These checks do not detect every clipping, focus, or content-priority problem. Full browser evidence is under `evidence/<case>/browser.json`.',
 '\n## Independent anonymous ratings',
 '\nReviewer r1 used `gpt-6.1-sol`; r2 used `gpt-6.1-terra`, both fresh no-history agents. Each reported directly viewing all 32 supplied initial/task-state screenshots. Creator models and conditions were withheld in randomized packets. Neither reviewer reported visible generation labels compromising blinding. Their original JSON ratings are preserved without reconciliation.',
 '\nThe following values are the descriptive mean of two **ordinal 1–5 ratings per dimension**, not a calibrated quality measurement. Half points arise from the two reviewers. Positive difference means the assisted case received the higher rating. Read the original evidence notes and disagreement table; do not treat small differences as statistically reliable.']
for group in groups:
    lines += [f"\n### {group['model']} · {group['promptId']}",f"\nBaseline [{group['baselineCase']}](cases/{group['baselineCase']}/implementation-notes.md); assisted [{group['tasteforgeCase']}](cases/{group['tasteforgeCase']}/implementation-notes.md).",'\n| Dimension | Baseline | TasteForge | Difference |','| --- | --- | --- | --- |']
    for d in group['dimensions']:
        delta='unassessed' if d['difference'] is None else ('+' if d['difference']>0 else '')+number(d['difference'])
        lines.append(f"| {d['label']} | {number(d['baselineMean'])} | {number(d['tasteforgeMean'])} | {delta} |")
lines += ['\n### Reviewer disagreements','\nBoth original assessments are retained: [r1](reviews/reviewer-r1.json), [r2](reviews/reviewer-r2.json), and [ratings CSV](reviews/ratings.csv). Differences below were not silently reconciled.','\n| Case | Dimension | r1 | r2 |','| --- | --- | --- | --- |']
for d in disagreements:lines.append(f"| {d['caseId']} | {d['dimension']} | {d['r1']} | {d['r2']} |")
lines += ['\n## Skill adherence and workflow friction',
 '\n- All four assisted cases retained generated brief/config/DNA/tokens/guidance and loaded the generated token file. Three directly referenced `--tf-*` CSS variables; c04 copied palette values into its own CSS variables instead. Loading a token file alone does not establish coherent application.',
 '- c02 encountered no compatible font pair for system-only delivery with English/Vietnamese coverage. It changed the brief language list to English and disclosed that Vietnamese fallback coverage was unverified. The visible Vietnamese name was rendered in the screenshots, but glyph coverage across target platforms was not certified. Treat this as workflow friction and an unverified requirement, not an access requirement successfully solved by changing the brief.',
 '- c04 chose Learning Studio for the transfer context, while c02 chose Modern Institutional. Both commerce treatments chose Swiss Editorial. These are agent choices, not prescribed answers from the operator.',
 '- The c04 and c08 source audits produced 53 and 71 heuristic warnings respectively, with zero source-audit errors. Warnings were retained, not all turned into mandatory fixes or used as a cross-condition quality score.',
 '- c06 reported an empty source-audit output and saved that limitation. The operator later reran the same source audit successfully and saved it separately in `evidence/c06/operator-source-audit-recheck.json`; the creator\'s original record was not replaced.',
 '\n## Limits and next evaluation',
 '\n'+ '\n'.join('- '+x for x in summary['limitations']),
 '\nA larger evaluation should repeat each pair at least three times, expand task categories, randomize generation order across repetitions, allow the same rendered-feedback tools to both conditions, and involve independent human reviewers. Test font delivery/coverage friction and the specificity/noise of audit warnings separately. Preserve failure cases and report each rubric dimension rather than choosing only attractive screenshots.',
 '\n## Reproduction and integrity',
 '\nThe [manifest](manifest.json) records requested model IDs, source revision, versions, input hashes, skill hashes, case mapping, screenshot packet order, and submitted-source hashes. Full provider transcripts, backend model snapshots, model generation seeds, token counts, and compute costs are not exposed and are not fabricated. Case isolation is an instruction boundary in a shared workspace.',
 '\nThe UIs use plain HTML/CSS/JS and local original SVG illustrations. Serve the run folder with Python to inspect them. Browser tooling is isolated in `tools/`; replicating a browser capture requires its pinned Playwright/axe dependencies and matching browser. Copy to a new run directory before regenerating evidence; do not overwrite the preserved pilot and then claim it is the original run.',
 '\nThe first capture harness made two transfer-state assumptions that were corrected uniformly; its summary and the correction are retained in [harness-first-pass.json](evidence/harness-first-pass.json) and the protocol. No submitted implementation was repaired by the operator. Raw case files and the frozen skill snapshot are excluded from root auto-format/lint so later maintenance does not silently rewrite experimental evidence.'
]
(run/'report.md').write_text('\n'.join(lines)+'\n')
shots=['# Side-by-side screenshot index','\nThese are unedited initial desktop and mobile screenshots. Click an image to inspect its original resolution. For actual interactions, serve the [gallery](index.html); for evidence and limits read the [report](report.md).']
for group in groups:
    a,b=group['baselineCase'],group['tasteforgeCase']
    shots += [f"\n## {group['model']} · {group['promptId']}",'\n| Viewport | Without TasteForge | With TasteForge |','| --- | --- | --- |']
    for viewport in ['desktop','mobile']:
        shots.append(f"| {viewport} | [![Baseline {viewport}](evidence/{a}/{viewport}-initial.png)](evidence/{a}/{viewport}-full.png) | [![TasteForge {viewport}](evidence/{b}/{viewport}-initial.png)](evidence/{b}/{viewport}-full.png) |")
(run/'screenshots.md').write_text('\n'.join(shots)+'\n')
all_case_hashes={str(file.relative_to(run)):hashlib.sha256(file.read_bytes()).hexdigest() for file in sorted((run/'cases').rglob('*')) if file.is_file()}
(run/'evidence/artifact-hashes.json').write_text(json.dumps(all_case_hashes,indent=2)+'\n')
manifest['resultsFile']='results.json'
(run/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Report, per-dimension ratings, CSV, screenshot index, and artifact hashes generated.')
print('Review disagreements:',len(disagreements),'of',8*len(dimensions),'case/dimension cells.')
