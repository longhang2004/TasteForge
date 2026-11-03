"""Freeze exact resource trees and common inputs before any creator dispatch."""
import hashlib
import json
import pathlib
import subprocess
from datetime import datetime, timezone

repo = pathlib.Path(__file__).resolve().parents[4]
run = pathlib.Path(__file__).resolve().parents[1]
baseline = "4c24a590974046c342de89f092da63fb419749a7"
candidate = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip()
assert candidate != baseline, "Commit checked candidate source before freezing"
manifest_path = run / "manifest.json"
assert not manifest_path.exists(), "Never overwrite a frozen manifest"
resources = run / "resources"
resources.mkdir()
manifest = {"frozenAt": datetime.now(timezone.utc).isoformat(), "baseline": baseline,
            "candidate": candidate, "resources": {}, "commonInputs": {},
            "provider": "Codex subagents / inherited same model; exact resolved model unavailable",
            "providerTelemetry": None,
            "dispatchOrder": ["press-A", "listen-B", "press-B", "listen-A"],
            "conditionKey": {"press-A": "lean", "press-B": "candidate",
                             "listen-A": "lean", "listen-B": "candidate"}}
sha = lambda data: hashlib.sha256(data).hexdigest()
for label, revision in [("R1", baseline), ("R2", candidate)]:
    files = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", revision,
                                     "skills/tasteforge"], cwd=repo, text=True).splitlines()
    record = {}
    for file in files:
        data = subprocess.check_output(["git", "show", f"{revision}:{file}"], cwd=repo)
        relative = pathlib.Path(file).relative_to("skills")
        target = resources / label / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        record[str(relative)] = {"sha256": sha(data), "bytes": len(data),
                                 "words": len(data.decode().split()) if file.endswith(".md") else None}
    manifest["resources"][label] = {"revision": revision, "files": record}
for relative in ["protocol.md", "operator.md", "prompts/press-booking.md", "prompts/listening-room.md",
                 "tools/freeze.py"]:
    data = (run / relative).read_bytes()
    manifest["commonInputs"][relative] = {"sha256": sha(data), "bytes": len(data),
                                         "words": len(data.decode().split())}
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
for cell in manifest["dispatchOrder"]:
    (run / "cells" / cell / "initial").mkdir(parents=True)
print(json.dumps({"candidate": candidate, "manifestSha256": sha(manifest_path.read_bytes()),
                  "resources": {k: {"entryWords": v["files"]["tasteforge/SKILL.md"]["words"],
                       "createInitialWords": sum(v["files"][f]["words"] for f in ["tasteforge/SKILL.md", "tasteforge/workflows/create-ui.md"]),
                       "markdownWords": sum(x["words"] or 0 for x in v["files"].values())}
                   for k, v in manifest["resources"].items()}}, indent=2))
