"""Record a bounded native-CLI check; never reads/copies authentication files."""
from pathlib import Path
import datetime
import json
import subprocess

root = Path(__file__).resolve().parent.parent
run = root / 'evals/runs/2026-11-01-antigravity-inventory'
output = run / 'evidence/availability'
output.mkdir(parents=True, exist_ok=True)
work = root / '.tmp/agy-probe'
work.mkdir(parents=True, exist_ok=True)
binary = '/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe'
settings = {'permissions':{'deny':['command(*)','write_file(*)','read_file(*)']}}
commands = {
    'version':[binary,'--version'],
    'models':[binary,'models'],
    'probe':[binary,'--model','gemini-3.8-flash-medium','--output-format','json','--print-timeout','45s','--disable-slash-commands','--settings',json.dumps(settings),'-p','Reply exactly READY. Do not read files, use tools, or change anything.'],
}
for name,command in commands.items():
    file = output/(name+'.json')
    if file.exists():
        raise SystemExit(f'Preserve existing evidence: {file}')
    start = datetime.datetime.now(datetime.timezone.utc)
    try:
        p=subprocess.run(command,cwd=work,capture_output=True,text=True,timeout=65)
        stdout,stderr,code=p.stdout,p.stderr,p.returncode
    except subprocess.TimeoutExpired as error:
        stdout=error.stdout.decode() if isinstance(error.stdout,bytes) else error.stdout or ''
        stderr=error.stderr.decode() if isinstance(error.stderr,bytes) else error.stderr or ''
        code='operator-timeout-65s'
    record={'startedAtUtc':start.isoformat(),'durationSeconds':(datetime.datetime.now(datetime.timezone.utc)-start).total_seconds(),'command':command,'workingDirectory':str(work),'exitCode':code,'stdout':stdout,'stderr':stderr,'credentialHandling':'Official CLI uses its existing login; operator does not read, copy or export any credential file. No account change, key extraction or provider adapter.'}
    file.write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps({'step':name,'exitCode':code,'stdout':stdout[-3000:],'stderr':stderr[-1200:]}),flush=True)
