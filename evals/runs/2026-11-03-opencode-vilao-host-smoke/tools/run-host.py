"""Portable form of the observed wrapper. Does not install or change host config."""
import argparse
import json
import subprocess
import time
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--executable',type=Path,required=True)
parser.add_argument('--project',type=Path,required=True)
parser.add_argument('--model',choices=['deepseek','glm'],required=True)
parser.add_argument('--phase',choices=['generation','correction'],default='generation')
parser.add_argument('--session')
parser.add_argument('--correction-prompt',type=Path)
args=parser.parse_args()
model={'deepseek':'vilao/chib/deepseek-v4.1-flash','glm':'vilao/mn/glm-5.3-flash'}[args.model]
project=args.project.resolve()
if not (project/'opencode.json').exists():raise ValueError('Prepare an isolated project first')
if args.phase=='correction' and (not args.session or not args.correction_prompt):raise ValueError('Correction requires the observed session ID and a concrete correction prompt')
evidence=project/'evidence'
evidence.mkdir(exist_ok=True)
if any((evidence/(args.phase+suffix)).exists() for suffix in ['.jsonl','.stderr.log','-meta.json']):raise FileExistsError('Use a fresh phase/project; do not overwrite evidence')
message='Read PROMPT.md and implement its task. Explicitly load the installed tasteforge skill via the native skill tool first.'
command=[str(args.executable.resolve()),'run','--standalone','--model',model,'--format','json','--title','TasteForge Kiln Notes UI '+args.model]
if args.phase=='correction':
    command+=['--session',args.session]
    message=args.correction_prompt.read_text()
command.append(message)
started=time.time()
with (evidence/(args.phase+'.jsonl')).open('wb') as out,(evidence/(args.phase+'.stderr.log')).open('wb') as err:
    result=subprocess.run(command,cwd=project,stdout=out,stderr=err)
metadata={'model':model,'startedAtUnix':started,'durationSeconds':round(time.time()-started,3),'exitCode':result.returncode,'fallback':'none','command':command[1:]}
(evidence/(args.phase+'-meta.json')).write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata))
