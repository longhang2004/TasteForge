"""Check the documented Windows regex matcher for the same scoped WSL action."""
from pathlib import Path
import datetime
import json
import subprocess

run=Path(__file__).resolve().parent.parent
out=run/'evidence/availability/command-rule.json'
assert not out.exists(), 'Preserve previous command probe'
source=json.loads((run/'tools/a02-settings.json').read_text())
prefix=source['permissions']['allow'][2]
assert prefix.startswith('command(wsl.exe ')
source['permissions']['allow'][2]='command(regex:'+prefix[len('command('):-1].replace('wsl.exe','wsl\\.exe')+' .*)'
source['permissions']['deny'].append('write_file(*)')
settings=run/'tools/command-probe-settings.json'
settings.write_text(json.dumps(source,indent=2)+'\n')
linux='/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-01-antigravity-inventory/cases/a02'
command=f"wsl.exe --distribution Ubuntu --cd {linux} --exec bash -lc 'ls -la'"
prompt=f'Run exactly this read-only command using your run_command tool, then reply READY if it succeeds: {command}. Do not read other files, write anything, delegate or browse. If denied, stop; do not try another command.'
args=['/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe','--new-project','--model','gemini-3.8-flash-medium','--effort','medium','--mode','accept-edits','--disable-slash-commands','--settings','C:/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-01-antigravity-inventory/tools/command-probe-settings.json','--output-format','stream-json','--print-timeout','45s','-p',prompt]
start=datetime.datetime.now(datetime.timezone.utc)
try:
 p=subprocess.run(args,cwd=run/'cases/a02',capture_output=True,text=True,timeout=65)
 result={'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr}
except subprocess.TimeoutExpired as e:
 result={'exitCode':'timeout-65s','stdout':e.stdout.decode() if isinstance(e.stdout,bytes) else e.stdout or '', 'stderr':e.stderr.decode() if isinstance(e.stderr,bytes) else e.stderr or ''}
result.update({'command':args,'startedAtUtc':start.isoformat(),'settings':source,'hypothesis':'The unchanged scoped WSL command requires regex matching on Windows when quote parsing makes literal prefix matching fail.','change':'Literal prefix -> documented regex prefix; all UI-task inputs untouched.'})
out.write_text(json.dumps(result,indent=2)+'\n')
for line in result['stdout'].splitlines():
 try:
  e=json.loads(line);s=e.get('step_update',{})
  if e.get('event')=='result' or s.get('step_type')=='tool': print(json.dumps(e,ensure_ascii=False)[:2500],flush=True)
 except json.JSONDecodeError:pass
print(result['stderr'][-1500:],flush=True)
