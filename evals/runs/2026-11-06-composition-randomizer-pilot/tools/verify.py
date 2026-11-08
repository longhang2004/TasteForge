"""Verify frozen inputs, accepted sources, anonymous packet and final artifacts."""
from pathlib import Path
import hashlib
import json
import sys

sys.dont_write_bytecode = True
from review_integrity import verify_manifest

run = Path(__file__).resolve().parents[1]
digest = lambda file: hashlib.sha256(file.read_bytes()).hexdigest()
freeze = json.loads((run / "freeze.json").read_text())
for name, expected in freeze["files"].items():
    assert digest(run / name) == expected, f"Frozen input changed: {name}"
assert digest(run / "protocol.md") == freeze["protocolSha256"] == (run / "protocol.sha256").read_text().strip()
review_freeze = json.loads((run / "reviews/freeze.json").read_text())
assert verify_manifest(run / "review-packet") == review_freeze["packetManifestSha256"]
for name, expected in review_freeze["hashes"].items():
    assert digest(run / "reviews" / name) == expected, f"Frozen review changed: {name}"
acceptance = json.loads((run / "acceptance.json").read_text())
for cell, data in acceptance["cells"].items():
    assert digest(run / "outputs" / cell / "corrected/index.html") == data["sourceSha256"]
    report = json.loads((run / data["report"]).read_text())
    assert report["sourceSha256"] == data["sourceSha256"]
    assert report["harnessSha256"] == digest(run / "tools/check.mjs")
    assert report["summary"]["failed"] == report["summary"]["harnessErrors"] == 0
    initial = run / "outputs" / cell / "initial"
    assert digest(initial / "index.html") == json.loads((initial / "archive.json").read_text())["sourceSha256"]
files = {str(p.relative_to(run)): digest(p) for p in sorted(run.rglob("*")) if p.is_file() and p != run / "integrity.json" and "__pycache__" not in p.parts}
index = run / "integrity.json"
if sys.argv[1:] == ["--write-index"]:
    assert not index.exists(), "Preserve prior delivery integrity index"
    index.write_text(json.dumps({"scope": "All retained run files except this index and Python bytecode cache", "files": files}, indent=2) + "\n")
else:
    expected = json.loads(index.read_text())["files"]
    assert files == expected, "Final artifact file set or bytes changed"
print(json.dumps({"frozenInputs": len(freeze["files"]), "reviewFiles": len(review_freeze["hashes"]), "finalArtifacts": len(files), "acceptedCells": len(acceptance["cells"]), "status": "verified"}))
