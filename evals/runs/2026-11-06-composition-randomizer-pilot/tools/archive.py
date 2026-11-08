from pathlib import Path
import json, hashlib, shutil, sys, datetime

root = Path(__file__).resolve().parents[4]
run = Path(__file__).resolve().parents[1]
cell, stage = sys.argv[1:3]
assert cell in ['proofdesk-baseline','proofdesk-candidate','cabinet-baseline','cabinet-candidate']
assert stage in ['initial','corrected']
source = root/'.tmp/composition-pilot/cells'/cell
dest = run/'outputs'/cell/stage
assert not dest.exists(), 'Never overwrite an archived output'
dest.mkdir(parents=True)
manifest=json.loads((run/'freeze.json').read_text())['cellInputFiles'][cell]
drift=[]
for path, expected in manifest.items():
    file=source/path
    actual=hashlib.sha256(file.read_bytes()).hexdigest() if file.exists() else None
    if actual != expected: drift.append({'path':path,'expected':expected,'actual':actual})
for name in ['index.html','first-write.html','creator-notes.md','fixture.json']:
    if (source/name).exists(): shutil.copyfile(source/name,dest/name)
assert (dest/'index.html').exists()
shutil.copytree(source/'assets',dest/'assets')
metadata={'archivedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceSha256':hashlib.sha256((dest/'index.html').read_bytes()).hexdigest(),'inputDrift':drift,'cell':cell,'stage':stage}
(dest/'archive.json').write_text(json.dumps(metadata,indent=2)+'\n')
resources=json.loads((run/'resources.json').read_text())
resources['cells'].setdefault(cell,{})[stage+'ArchivedAt']=metadata['archivedAt']
(run/'resources.json').write_text(json.dumps(resources,indent=2)+'\n')
print(json.dumps(metadata,indent=2))
