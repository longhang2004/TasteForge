"""Launch the two explicitly authorized, bounded native Antigravity sessions."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import random
import subprocess

run=Path(__file__).resolve().parent.parent
binary='/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe'
windows='C:/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-01-antigravity-inventory'
manifest_file=run/'manifest.json'
manifest=json.loads(manifest_file.read_text())
assert all(c['generation']=='pending' for c in manifest['cases']), 'Do not overwrite prior generation'
order=[c['id'] for c in manifest['cases']]
random.Random(20261101).shuffle(order)
manifest['runOrder']=order
manifest['protocolSha256']=hashlib.sha256((run/'protocol.md').read_bytes()).hexdigest()
manifest_file.write_text(json.dumps(manifest,indent=2)+'\n')
for id in order:
    item=next(c for c in manifest['cases'] if c['id']==id)
    out=run/'evidence'/id
    out.mkdir(parents=True,exist_ok=True)
    prompt=(run/'tools'/f'{id}-prompt.txt').read_text()
    command=[binary,'--new-project','--model','gemini-3.8-flash-medium','--effort','medium','--mode','accept-edits','--disable-slash-commands','--settings',f'{windows}/tools/{id}-settings.json','--output-format','stream-json','--print-timeout','12m','-p',prompt]
    item['generation']='running'
    item['startedAtUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    manifest_file.write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'{id}: starting {item["condition"]} on pinned Gemini 3.8 Flash (Medium).',flush=True)
    start=datetime.datetime.now(datetime.timezone.utc)
    with (out/'cli-events.ndjson').open('w') as stdout, (out/'cli-stderr.txt').open('w') as stderr:
        process=subprocess.Popen(command,cwd=run/'cases'/id,stdout=stdout,stderr=stderr,stdin=subprocess.DEVNULL)
        try:
            code=process.wait(timeout=780)
        except subprocess.TimeoutExpired:
            process.terminate()
            code='operator-timeout-780s'
            try:process.wait(timeout=15)
            except subprocess.TimeoutExpired:process.kill();process.wait()
    events=[]
    for line in (out/'cli-events.ndjson').read_text().splitlines():
        try:events.append(json.loads(line))
        except json.JSONDecodeError:pass
    final=next((e.get('result') for e in reversed(events) if e.get('event')=='result'),None)
    record={'id':id,'command':command,'cwd':str(run/'cases'/id),'exitCode':code,'durationSeconds':(datetime.datetime.now(datetime.timezone.utc)-start).total_seconds(),'result':final,'eventCount':len(events),'init':next((e.get('init') for e in events if e.get('event')=='init'),None)}
    (out/'generation.json').write_text(json.dumps(record,indent=2)+'\n')
    implemented=all((run/'cases'/id/file).exists() and (run/'cases'/id/file).stat().st_size>0 for file in ['app.js','styles.css','implementation-notes.md'])
    denied=final.get('denied_actions',[]) if final else []
    item['generation']='submitted' if code==0 and final and final.get('status')=='SUCCESS' and implemented and not denied else 'failed-or-incomplete'
    item['implementedFilesObserved']=implemented
    item['deniedActions']=denied
    item['finishedAtUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    item['exitCode']=code
    item['conversationId']=final.get('conversation_id') if final else None
    manifest_file.write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'case':id,'exitCode':code,'status':final.get('status') if final else None,'response':final.get('response','')[-1800:] if final else None,'usage':final.get('usage') if final else None}),flush=True)
