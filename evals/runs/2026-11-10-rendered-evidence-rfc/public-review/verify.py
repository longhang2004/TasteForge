"""Verify retained viewer artifacts and their exact implementation/input bindings."""
import hashlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
run = Path(__file__).resolve().parent
root = run.parents[2]
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
files = {str(p.relative_to(run)): digest(p) for p in sorted(run.rglob("*"))
         if p.is_file() and p.name != "integrity.json" and "__pycache__" not in p.parts}
names = ["examples/rendered-evidence/render.py", "examples/rendered-evidence/test_render.py",
         "examples/rendered-evidence/annotations.json"]
annotations = json.loads((root / names[-1]).read_text())
for capture in annotations["captures"]:
    for kind in ("image", "source", "report"):
        asset = capture[kind]
        assert digest(root / asset["path"]) == asset["sha256"], asset["path"]
        names.append(asset["path"])
bindings = {name: digest(root / name) for name in sorted(set(names))}
index = run / "integrity.json"
if sys.argv[1:] == ["--write-index"]:
    with index.open("x") as stream:
        json.dump({"files": files, "bindings": bindings}, stream, indent=2)
        stream.write("\n")
else:
    expected = json.loads(index.read_text())
    assert files == expected["files"], "Retained run file set or bytes changed"
    assert bindings == expected["bindings"], "Implementation/input bytes changed"
print(json.dumps({"status": "verified", "artifacts": len(files), "bindings": len(bindings)}))
