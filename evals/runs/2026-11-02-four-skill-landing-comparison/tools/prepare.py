"""Freeze eight-cell common inputs and create isolated projects before dispatch."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess

run = Path(__file__).resolve().parents[1]
repo = Path(__file__).resolve().parents[4]
assert subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip() == "78aab5826b672f4a6a30773a5ae35dd4b0faf286"
assert not (run / "manifest.json").exists(), "Never replace a frozen manifest"
sha = lambda data: hashlib.sha256(data).hexdigest()
arms = {
    "tasteforge": {"revision": "78aab5826b672f4a6a30773a5ae35dd4b0faf286", "repo": "longhang2004/TasteForge"},
    "promax": {"revision": "3a13158ff1f32156cbe144108de48eda2ecaed9a", "repo": "nextlevelbuilder/ui-ux-pro-max-skill"},
    "elaya": {"revision": "456d9e0d3e2d84c748bb143c6ca3d90c45e16213", "repo": "elayadesign/ai-design-skills"},
    "impeccable": {"revision": "e89e3ada3e875a89ac2c5d33d11e65ebef6fe285", "repo": "pbakaus/impeccable"},
}
for arm, record in arms.items():
    entry = run / "resources" / arm / "skill/SKILL.md"
    assert entry.is_file()
    record["entry"] = str(entry.relative_to(run))
    record["entrySha256"] = sha(entry.read_bytes())
    record["entryWords"] = len(entry.read_text().split())
order = [("fold-1", "field-fold", "promax"), ("relay-1", "relay-notes", "impeccable"),
         ("fold-2", "field-fold", "elaya"), ("relay-2", "relay-notes", "tasteforge"),
         ("fold-3", "field-fold", "tasteforge"), ("relay-3", "relay-notes", "elaya"),
         ("fold-4", "field-fold", "impeccable"), ("relay-4", "relay-notes", "promax")]
cells = {}
for cell, task, arm in order:
    project = Path("/tmp") / f"tasteforge-four-skill-{cell}"
    project.mkdir()  # Refuse old/user paths; no deletion/move.
    shutil.copytree(run / "common", project / "common")
    shutil.copyfile(run / "prompts" / f"{task}.md", project / "PRODUCT.md")
    artifact = run / "cells" / cell
    (artifact / "creator-evidence").mkdir(parents=True)
    home = repo / ".tmp/comparison-runtime/impeccable-home" / cell
    home.mkdir(parents=True)
    cells[cell] = {"task": task, "arm": arm, "project": str(project),
                   "artifact": str(artifact.relative_to(run)), "entry": arms[arm]["entry"],
                   "impeccableHome": str(home), "productSha256": sha((project / "PRODUCT.md").read_bytes())}
files = {}
for path in sorted(run.rglob("*")):
    relative = str(path.relative_to(run))
    if path.is_file() and not relative.startswith("cells/"):
        files[relative] = {"sha256": sha(path.read_bytes()), "bytes": path.stat().st_size}
manifest = {"frozenAt": datetime.now(timezone.utc).isoformat(), "baseline": arms["tasteforge"]["revision"],
            "profile": "controlled single-creator code-first skill-layer comparison; not full native orchestration",
            "arms": arms, "cells": cells, "dispatchOrder": [row[0] for row in order], "inputs": files,
            "provider": {"host": "Codex fresh subagents", "model": "same inherited model, exact resolved identity unavailable", "tokens": None, "billing": None},
            "nativeEngine": {"version": "0.1.18", "sha256": "736ed785e74ae2344d3036127f614ddde5ab520a527d8bc82a891612ef71f648",
                             "path": str(repo / ".tmp/comparison-runtime/bin/0.1.18/impeccable-linux-x64")}}
(run / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(json.dumps({"frozenAt": manifest["frozenAt"], "manifestSha256": sha((run / "manifest.json").read_bytes()), "cells": len(cells), "frozenFiles": len(files), "entryWords": {arm:record["entryWords"] for arm,record in arms.items()}}, indent=2))
