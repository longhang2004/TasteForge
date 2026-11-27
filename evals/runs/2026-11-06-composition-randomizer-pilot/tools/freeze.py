from pathlib import Path
import json, shutil, hashlib, subprocess, zipfile, datetime

root = Path('/mnt/c/Users/hi/src/personal_repos/TasteForge')
run = root/'evals/runs/2026-11-06-composition-randomizer-pilot'
scratch = root/'.tmp/composition-pilot/cells'
baseline = Path('/var/tmp/tasteforge-beta2-validation-20261103')
candidate = Path('/var/tmp/tasteforge-composition-20261106')
assert not (run/'freeze.json').exists(), 'Refuse to overwrite frozen trial'
assert not scratch.exists(), 'Fresh cell directories required'
sha = lambda b: hashlib.sha256(b).hexdigest()
def write(path, text):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(text,encoding='utf-8')
def dump(path, value):
    write(path,json.dumps(value,ensure_ascii=False,indent=2)+'\n')

archive = root/'.tmp/release-v0.2.0-beta.2/downloaded/tasteforge-skill-v0.2.0-beta.2.zip'
assert sha(archive.read_bytes()) == 'c6d37cb585e6b02b4c9eb7c4eb36651b71422e404809a11c843c65ad76f94337'
assert subprocess.check_output(['git','-C',str(baseline),'status','--porcelain'],text=True).strip() == ''
assert subprocess.check_output(['git','-C',str(baseline),'rev-parse','HEAD'],text=True).strip() == '6383a0b8a78b4875eb6b59aff1bed6a8d3649e55'
for path in ['packages/core/src/references.ts','packages/core/src/recommend.ts','packages/core/src/schemas.ts','packages/knowledge/src/data/knowledge.json','packages/knowledge/src/data/references.json']:
    original=subprocess.check_output(['git','show','98e1ebb:'+path],cwd=root)
    assert original == (baseline/path).read_bytes(), path
    assert (root/path).read_bytes() == (candidate/path).read_bytes(), 'Candidate validation drift: '+path

with zipfile.ZipFile(archive) as z:
    for name in z.namelist():
        p=Path(name)
        assert not p.is_absolute() and '..' not in p.parts and p.parts[0]=='tasteforge'
        if not name.endswith('/'):
            target=run/'conditions/baseline'/name
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(z.read(name))
shutil.copytree(root/'skills/tasteforge',run/'conditions/candidate/tasteforge')

source_paths=['packages/knowledge/src/data/knowledge.json','packages/knowledge/src/data/compositions.json','packages/knowledge/src/compositions.ts','packages/core/src/references.ts','packages/core/src/recommend.ts','packages/core/src/schemas.ts']
for path in source_paths:
    target=run/'conditions/candidate/source'/path
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(root/path,target)
for path in ['packages/core/src/references.ts','packages/core/src/recommend.ts','packages/core/src/schemas.ts','packages/knowledge/src/data/knowledge.json']:
    target=run/'conditions/baseline/source'/path
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(baseline/path,target)

for condition,engine_root in [('baseline',baseline),('candidate',candidate)]:
  for task,task_type in [('proofdesk','form'),('cabinet','portfolio')]:
    project=run/'inputs'/task
    engine=engine_root/'packages/cli/dist/index.js'
    def cli(*args):
        return subprocess.check_output(['node',str(engine),'--project',str(project),*args],cwd=root,text=True)
    pack_text=cli('inspire','--brief','brief.json','--task',task_type,'--count','1','--seed','49','--format','json')
    pack=json.loads(pack_text)
    cell=run/'conditions'/condition/task
    write(cell/'reference-pack.json',pack_text)
    for kind in ['style','template']:
        entry=pack['inspirations'][0].get(kind)
        if entry:
            write(cell/(kind+'-document.json'),cli('catalog',entry['id'],'--format','json'))
    cell_name=task+'-'+condition
    target=scratch/cell_name
    shutil.copytree(project,target)
    shutil.copytree(run/'conditions'/condition/'tasteforge',target/'tasteforge')
    for file in cell.iterdir(): shutil.copyfile(file,target/file.name)

files={str(p.relative_to(run)):sha(p.read_bytes()) for folder in ['inputs','conditions'] for p in (run/folder).rglob('*') if p.is_file()}
cell_files={str(folder.name):{str(p.relative_to(folder)):sha(p.read_bytes()) for p in folder.rglob('*') if p.is_file()} for folder in scratch.iterdir()}
dump(run/'freeze.json',{'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baselineCommit':'98e1ebb18c9eb7f14887b095c86c66e3009b130f','baselineReleaseCandidate':'6383a0b8a78b4875eb6b59aff1bed6a8d3649e55','baselineSkillZipSha256':sha(archive.read_bytes()),'candidate':'uncommitted exact source/resource manifest below; frozen before any creator','model':'gpt-6.1-sol','reasoning':'high','cellsOrder':['proofdesk-baseline','cabinet-candidate','proofdesk-candidate','cabinet-baseline'],'protocolSha256':sha((run/'protocol.md').read_bytes()),'files':files,'cellInputFiles':cell_files})
dump(run/'resources.json',{'providerTokens':'unknown','cacheTokens':'unknown','reasoningTokens':'unknown','verifiedBilling':'unknown','operatorTokens':'unknown','reviewerTokens':'unknown','fullBilledAcceptanceCycle':'unknown','creatorHost':'Codex subagents','creatorModel':'gpt-6.1-sol','reasoning':'high','cells':{},'implementationUsageLimitInterruption':'Before pilot dispatch; outside measured pilot span.'})
print(json.dumps({'frozenInputs':len(files),'cells':list(cell_files),'run':str(run)},indent=2))
