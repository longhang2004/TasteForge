"""Summarize recorded telemetry without interpreting provider cost as billing."""
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

root=Path(__file__).resolve().parents[1]
cells=[]
for model in ['deepseek','glm']:
    directory=root/'evidence'/model
    meta=json.loads((directory/'generation-meta.json').read_text())
    summary=json.loads((directory/'trace-summary.json').read_text())
    steps=summary['steps']
    totals={'input':0,'output':0,'reasoning':0,'cacheRead':0,'cacheWrite':0}
    missing=[]
    for index,step in enumerate(steps):
        tokens=step.get('tokens')
        if not isinstance(tokens,dict):missing.append(index);continue
        for key in ['input','output','reasoning']:totals[key]+=tokens.get(key,0)
        totals['cacheRead']+=tokens.get('cache',{}).get('read',0)
        totals['cacheWrite']+=tokens.get('cache',{}).get('write',0)
    costs=[s.get('cost') for s in steps]
    initial=json.loads((root/'evidence'/f'{model}-initial/report.json').read_text())
    corrected=root/'evidence'/f'{model}-corrected/report.json'
    final=json.loads(corrected.read_text()) if corrected.exists() else initial
    follow=json.loads((root/'evidence'/f'{model}-initial-follow-up/report.json').read_text())
    final_follow_path=root/'evidence'/f'{model}-corrected-follow-up/report.json'
    final_follow=json.loads(final_follow_path.read_text()) if final_follow_path.exists() else follow
    extra_path=root/'evidence'/f'{model}-corrected-invalid-switch-submitted/report.json'
    if not extra_path.exists():extra_path=root/'evidence'/f'{model}-initial-invalid-switch-submitted/report.json'
    extra=json.loads(extra_path.read_text()) if extra_path.exists() else None
    correction=None
    correction_path=directory/'correction-meta.json'
    if correction_path.exists():
        correction=json.loads(correction_path.read_text())
        correction_steps=[]
        for line in (directory/'correction.jsonl').read_text().splitlines():
            event=json.loads(line)
            if event.get('type')=='step_finish':correction_steps.append(event['part'])
        correction['reportedPerStepTokenSums']={key:sum(s.get('tokens',{}).get(key,0) for s in correction_steps) for key in ['input','output','reasoning']}
        correction['reportedPerStepTokenSums']['cacheRead']=sum(s.get('tokens',{}).get('cache',{}).get('read',0) for s in correction_steps)
        correction['reportedPerStepTokenSums']['cacheWrite']=sum(s.get('tokens',{}).get('cache',{}).get('write',0) for s in correction_steps)
        correction['reportedCostSum']=sum(s.get('cost',0) for s in correction_steps)
        correction['verifiedBillingCost']='unknown'
        correction.pop('command',None)
    cell={'model':meta['model'],'host':meta['host'],'generation':{
        'startedAt':datetime.fromtimestamp(meta['startedAtUnix'],timezone.utc).isoformat(),
        'durationSeconds':meta['durationSeconds'],'exitCode':meta['exitCode'],
        'steps':len(steps),'toolCalls':dict(Counter(t['tool'] for t in summary['tools'])),
        'reportedPerStepTokenSums':totals,'stepsMissingUsage':missing,
        'reportedCostSum':sum(costs) if all(isinstance(c,(float,int)) for c in costs) else 'unknown',
        'verifiedBillingCost':'unknown','providerUsageNormalization':'unknown',
    },'initialBrowserAcceptance':{'durationSeconds':initial['durationMs']/1000,'passed':initial['passed'],'failed':initial['failed'],'finishedAt':initial['finishedAt']},
        'finalBrowserAcceptance':{'durationSeconds':final['durationMs']/1000,'passed':final['passed'],'failed':final['failed'],'finishedAt':final['finishedAt']},
        'initialFollowUp':{'passed':follow['passed'],'failed':follow['failed'],'durationSeconds':follow['durationMs']/1000,'finishedAt':follow['finishedAt']},
        'finalFollowUp':{'passed':final_follow['passed'],'failed':final_follow['failed'],'durationSeconds':final_follow['durationMs']/1000,'finishedAt':final_follow['finishedAt']},
        'finalInvalidSwitch':{'passed':extra['passed'],'failed':extra['failed'],'durationSeconds':extra['durationMs']/1000,'finishedAt':extra['finishedAt']} if extra else 'unassessed',
        'correction':correction or 'No parent-requested correction',
        'independentAiReviewTokensAndCost':'unknown','humanAcceptance':'deferred',
    }
    cells.append(cell)
start=min(datetime.fromisoformat(c['generation']['startedAt']) for c in cells)
ends=[c[key]['finishedAt'] for c in cells for key in ['finalBrowserAcceptance','finalFollowUp','finalInvalidSwitch'] if isinstance(c[key],dict)]
end=max(datetime.fromisoformat(value.replace('Z','+00:00')) for value in ends)
report={'schemaVersion':'1.0','models':cells,
    'observedUiGenerationToLastAutomatedCheckSpanSeconds':(end-start).total_seconds(),
    'spanScope':'Calendar span includes sequential creation, overlapping parent checks, inspection/setup/wait time; excludes initial availability probes, later bookkeeping/CI and human acceptance.',
    'parentModelUsage':'unknown','fullEndToEndResourceCost':'unknown','verifiedBillingCost':'unknown',
    'interpretation':'Per-step usage is summed in its original separate categories. Cache replay is not unique prompt size; do not add categories into an assumed billed-token total. Reported zero cost is not independently verified billing. One reused case, provider defaults and sequential gateway calls do not establish normalized model/skill efficiency or savings.'}
(root/'resources.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
