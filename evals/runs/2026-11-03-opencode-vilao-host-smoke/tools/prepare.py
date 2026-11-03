"""Prepare new disposable projects; never overwrite a previous trial."""
import argparse
import hashlib
import shutil
import subprocess
import zipfile
from pathlib import Path, PurePosixPath

parser=argparse.ArgumentParser()
parser.add_argument('--archive',type=Path,required=True)
parser.add_argument('--work-root',type=Path,required=True)
args=parser.parse_args()
inputs=Path(__file__).resolve().parents[1]/'inputs'
expected='c6d37cb585e6b02b4c9eb7c4eb36651b71422e404809a11c843c65ad76f94337'
if hashlib.sha256(args.archive.read_bytes()).hexdigest()!=expected:raise ValueError('Archive must be the exact released beta.2 skill ZIP')
for name in ['deepseek','glm']:
    target=args.work_root.resolve()/name
    if target.exists():raise FileExistsError(f'Refusing to overwrite {target}')
for name in ['deepseek','glm']:
    target=args.work_root.resolve()/name
    target.mkdir(parents=True)
    subprocess.run(['git','init','-q'],cwd=target,check=True)
    for file in ['PROMPT.md','AGENTS.md','fixture.json','opencode.json','input-freeze.json','assets/pouring-cup.svg']:
        (target/file).parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(inputs/file,target/file)
    with zipfile.ZipFile(args.archive) as package:
        for entry in package.infolist():
            relative=PurePosixPath(entry.filename)
            if relative.is_absolute() or '..' in relative.parts or relative.parts[0]!='tasteforge':raise ValueError('Unsafe archive path')
            destination=target/'.opencode/skills'/Path(*relative.parts)
            if entry.is_dir():destination.mkdir(parents=True,exist_ok=True)
            else:
                destination.parent.mkdir(parents=True,exist_ok=True)
                destination.write_bytes(package.read(entry))
print('Prepared two identical isolated projects. Invoke the models sequentially; no fallback.')
