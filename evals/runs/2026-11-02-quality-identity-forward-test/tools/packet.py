"""Build one immutable randomized packet for two independent reviewers."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import secrets
import shutil

run = Path(__file__).resolve().parents[1]
packet = run / "review-packet"
packet.mkdir()  # Refuse overwrite.
acceptance = json.loads((run / "acceptance.json").read_text())
index = {"createdAt": datetime.now(timezone.utc).isoformat(), "cases": {}}
key = {}
for family, prompt in [("press", "press-booking.md"), ("listen", "listening-room.md")]:
    (packet / family).mkdir()
    shutil.copyfile(run / "prompts" / prompt, packet / family / "task.md")
    cells = [f"{family}-A", f"{family}-B"]
    secrets.SystemRandom().shuffle(cells)
    index["cases"][family] = {"task": f"{family}/task.md", "variants": {}}
    key[family] = {}
    for label, cell in zip(["A", "B"], cells):
        key[family][label] = cell
        destination = packet / family / label
        destination.mkdir()
        shutil.copyfile(run / "cells" / cell / "final/index.html", destination / "index.html")
        report = json.loads((run / acceptance[cell]["report"]).read_text())
        sanitized = {"scope": report["scope"], "checks": report["checks"], "failures": report["failures"], "traces": []}
        images = []
        for trace in report["traces"]:
            row = {"width": trace["width"], "checks": trace["checks"], "pageErrors": trace["pageErrors"], "states": []}
            if trace.get("error"):
                row["error"] = trace["error"].replace(cell, label)
            for state in trace["states"]:
                filename = f"{trace['width']}-{state['label']}.png"
                shutil.copyfile(run / state["viewport"], destination / filename)
                images.append({"width": trace["width"], "state": state["label"], "file": f"{family}/{label}/{filename}"})
                full = (run / state["viewport"]).parent / "full-page.png"
                if full.exists():
                    full_name = f"{trace['width']}-{state['label']}-full-page.png"
                    shutil.copyfile(full, destination / full_name)
                    images.append({"width": trace["width"], "state": state["label"] + "-full-page", "scope": "Optional full page; not natural post-action visibility", "file": f"{family}/{label}/{full_name}"})
                row["states"].append({k: state[k] for k in ["label", "geometry", "focus", "scroll", "violations", "incomplete"]})
            sanitized["traces"].append(row)
        (destination / "checks.json").write_text(json.dumps(sanitized, indent=2) + "\n")
        index["cases"][family]["variants"][label] = {"source": f"{family}/{label}/index.html", "checks": f"{family}/{label}/checks.json", "images": images}
(packet / "index.json").write_text(json.dumps(index, indent=2) + "\n")
hashes = {str(p.relative_to(packet)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(packet.rglob("*")) if p.is_file()}
(packet / "hashes.json").write_text(json.dumps(hashes, indent=2) + "\n")
(run / "review-key.json").write_text(json.dumps({"createdAt": index["createdAt"], "key": key}, indent=2) + "\n")
print("Randomized packet frozen; key withheld until two reviewer judgments are hashed.")
