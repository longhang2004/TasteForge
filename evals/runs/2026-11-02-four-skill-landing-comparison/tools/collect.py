"""Copy submitted bytes from persistent isolated project; never replace an attempt."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,sys

run=Path(__file__).resolve().parents[1]
cell=sys.argv[1]
stage=sys.argv[2] if len(sys.argv)>2 else "initial"
assert cell in json.loads((run/"manifest.json").read_text())["cells"]
amend=json.loads((run/"workspace-amendment.json").read_text())
project=Path(amend["cells"][cell]["project"])
if cell=="fold-1" and stage=="initial":project=Path(json.loads((run/"workspace-amendment-02.json").read_text())["project"])
if cell=="relay-1" and stage=="initial-valid":project=Path(json.loads((run/"workspace-amendment-03.json").read_text())["project"])
assert (project/"index.html").is_file()
target=run/"cells"/cell/stage
assert not target.exists(),"Never overwrite evidence/source stage"
shutil.copytree(project,target,ignore=shutil.ignore_patterns("node_modules",".git","runtime",".cache","__pycache__"))
hashes={str(p.relative_to(target)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(target.rglob("*")) if p.is_file()}
record={"collectedAt":datetime.now(timezone.utc).isoformat(),"project":str(project),"stage":stage,"files":hashes,"scope":"Byte-identical project copy; runtime binary/cache excluded"}
(run/"cells"/cell/(stage+"-manifest.json")).write_text(json.dumps(record,indent=2)+"\n")
print(cell,stage,len(hashes),"files",hashes["index.html"])
