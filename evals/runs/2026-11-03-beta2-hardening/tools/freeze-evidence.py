"""Freeze all run files except this self-referential output, once."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json

run = Path(__file__).resolve().parents[1]
target = run / "evidence-manifest.json"
assert not target.exists(), "Do not overwrite frozen evidence; make a declared new record instead."
files = {str(p.relative_to(run)): {"sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "bytes": p.stat().st_size} for p in sorted(run.rglob("*")) if p.is_file() and p != target}
target.write_text(json.dumps({"frozenAt": datetime.now(timezone.utc).isoformat(), "scope": "All run files except this manifest. Commit/push/Linear are external publication metadata. Historical runs unchanged.", "files": files}, indent=2) + "\n")
print(json.dumps({"files": len(files), "bytes": sum(v["bytes"] for v in files.values()), "manifestSha256": hashlib.sha256(target.read_bytes()).hexdigest()}))
