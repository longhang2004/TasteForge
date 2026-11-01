"""Bounded anonymous availability probes for explicitly requested free models."""
import datetime
import json
import os
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[4]
workspace = root / '.tmp/opencode-probe'
workspace.mkdir(parents=True, exist_ok=True)
out = Path(__file__).resolve().parents[1] / 'evidence/opencode-availability'
out.mkdir(parents=True, exist_ok=True)
models = ['opencode/deepseek-v4.1-flash-free', 'opencode/glm-5.3-flash-free']
for model in models:
    private = workspace / model.split('/')[1]
    private.mkdir(exist_ok=True)
    config = {
        '$schema': 'https://opencode.ai/config.json', 'autoupdate': False,
        'share': 'disabled', 'snapshot': False, 'formatter': False, 'lsp': False,
        'enabled_providers': ['opencode'], 'model': model, 'small_model': model,
        'permission': 'deny',
    }
    env = os.environ.copy()
    for name in list(env):
        if name.endswith(('_API_KEY', '_TOKEN')) or name.startswith('OPENCODE_'):
            env.pop(name, None)
    for key, folder in [('XDG_CONFIG_HOME','config'),('XDG_DATA_HOME','data'),('XDG_CACHE_HOME','cache'),('XDG_STATE_HOME','state')]:
        location = private/folder
        location.mkdir(exist_ok=True)
        env[key] = str(location)
    env['OPENCODE_CONFIG_CONTENT'] = json.dumps(config)
    command = ['opencode','run','--pure','--model',model,'--format','json','--title','TasteForge free model availability', 'Reply exactly READY. Do not use tools.']
    start = datetime.datetime.now(datetime.timezone.utc)
    try:
        result = subprocess.run(command, cwd=workspace, env=env, text=True, capture_output=True, timeout=90)
        stdout,stderr,code = result.stdout,result.stderr,result.returncode
    except subprocess.TimeoutExpired as error:
        stdout = error.stdout.decode() if isinstance(error.stdout,bytes) else error.stdout or ''
        stderr = error.stderr.decode() if isinstance(error.stderr,bytes) else error.stderr or ''
        code = 'timeout-90s'
    events = []
    for line in stdout.splitlines():
        try: events.append(json.loads(line))
        except json.JSONDecodeError: pass
    record = {'requestedModel':model,'cliVersion':'1.19.3','startedAtUtc':start.isoformat(),'durationSeconds':(datetime.datetime.now(datetime.timezone.utc)-start).total_seconds(),'exitCode':code,'stdout':stdout,'stderr':stderr,'events':events,'config':config,'credentialContext':'isolated XDG directories and API-key/token env variables removed; no existing credential file read'}
    (out/(model.split('/')[1]+'.json')).write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps({'model':model,'exitCode':code,'eventTypes':[e.get('type') for e in events],'lastOutput':stdout[-600:],'stderr':stderr[-500:]}),flush=True)
