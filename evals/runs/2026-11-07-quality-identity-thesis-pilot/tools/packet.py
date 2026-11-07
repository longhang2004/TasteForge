"""Build one immutable randomized packet for two independent reviewers.

Labels A/B are drawn per prompt from a fresh system-random shuffle. The key is
written separately and stays unopened until both reviewer judgments are frozen.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import secrets
import shutil

run = Path(__file__).resolve().parents[1]
packet = run / "review-packet"
packet.mkdir()  # Refuse overwrite: one immutable packet per run.
acceptance = json.loads((run / "acceptance.json").read_text())
manifest = json.loads((run / "manifest.json").read_text())
index = {"createdAt": datetime.now(timezone.utc).isoformat(), "cases": {}}
key = {}
# Declared pairs, in the protocol's dispatch order. Each pair is the same prompt
# under the lean (R1) and candidate (R2) skill tree.
pairs = [("freight", "freight.md"), ("archive", "archive.md")]
for family, prompt in pairs:
    (packet / family).mkdir()
    shutil.copyfile(run / "prompts" / prompt, packet / family / "task.md")
    cells = [f"{family}-R1", f"{family}-R2"]
    secrets.SystemRandom().shuffle(cells)
    index["cases"][family] = {"task": f"{family}/task.md", "variants": {}}
    key[family] = {}
    for label, cell in zip(["A", "B"], cells):
        if cell not in acceptance:
            raise SystemExit(f"{cell} missing from acceptance.json; refusing a partial packet")
        if manifest["conditionKey"][cell] not in ("lean", "candidate"):
            raise SystemExit(f"Unexpected condition for {cell}")
        key[family][label] = cell
        destination = packet / family / label
        destination.mkdir()
        # Source is the submitted creator result; acceptance.json binds its hash.
        shutil.copyfile(run / "cells" / cell / "initial/index.html", destination / "index.html")
        report = json.loads((run / acceptance[cell]["report"]).read_text())
        # Strip every cell name and condition-bearing path so the label is all a
        # reviewer can see. Raw violations and incomplete findings are retained.
        sanitized = {
            "scope": report["scope"],
            "checks": report["checks"],
            "failures": [failure.replace(cell, label) for failure in report["failures"]],
            "traces": [],
        }
        images = []
        for trace in report["traces"]:
            row = {
                "width": trace["width"],
                "checks": trace["checks"],
                "pageErrors": trace["pageErrors"],
                "states": [],
            }
            if trace.get("error"):
                row["error"] = trace["error"].replace(cell, label)
            for state in trace["states"]:
                filename = f"{trace['width']}-{state['label']}.png"
                shutil.copyfile(run / state["viewport"], destination / filename)
                images.append(
                    {
                        "width": trace["width"],
                        "state": state["label"],
                        "file": f"{family}/{label}/{filename}",
                    }
                )
                full = (run / state["viewport"]).parent / "full-page.png"
                if full.exists():
                    full_name = f"{trace['width']}-{state['label']}-full-page.png"
                    shutil.copyfile(full, destination / full_name)
                    images.append(
                        {
                            "width": trace["width"],
                            "state": state["label"] + "-full-page",
                            "scope": "Optional full page; not natural post-action visibility",
                            "file": f"{family}/{label}/{full_name}",
                        }
                    )
                row["states"].append(
                    {
                        k: state[k]
                        for k in ["label", "geometry", "focus", "scroll", "violations", "incomplete"]
                    }
                )
            sanitized["traces"].append(row)
        (destination / "checks.json").write_text(json.dumps(sanitized, indent=2) + "\n")
        index["cases"][family]["variants"][label] = {
            "source": f"{family}/{label}/index.html",
            "checks": f"{family}/{label}/checks.json",
            "images": images,
        }
(packet / "index.json").write_text(json.dumps(index, indent=2) + "\n")
hashes = {
    str(p.relative_to(packet)): hashlib.sha256(p.read_bytes()).hexdigest()
    for p in sorted(packet.rglob("*"))
    if p.is_file()
}
(packet / "hashes.json").write_text(json.dumps(hashes, indent=2) + "\n")
(run / "review-key.json").write_text(json.dumps({"createdAt": index["createdAt"], "key": key}, indent=2) + "\n")
print("Randomized packet frozen; key withheld until two reviewer judgments are hashed.")
print(json.dumps(key, indent=2))
