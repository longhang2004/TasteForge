"""Copy selected real captures into a fresh anonymous, two-stage packet."""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import random
import re
import shutil


run = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument("--ids", nargs="+", help="Explicit actual case IDs; defaults to all nonoptional cells")
parser.add_argument("--out", default="reviews/packet")
parser.add_argument("--map", dest="map_file", default="reviews/packet-map.private.json")
parser.add_argument("--prefix", default="view")
parser.add_argument("--seed", type=int, default=20261102)
parser.add_argument("--allow-missing-states", action="store_true", help="Disclose absent state captures; never substitute or invent images")
args = parser.parse_args()
assert re.fullmatch(r"[a-z]+", args.prefix), "Opaque prefix must contain lowercase letters only"
manifest = json.loads((run / "manifest.json").read_text())
selection_file = run / "evidence/selection.json"
assert selection_file.exists(), "Final evidence selection is required before any packet is built"
selection = json.loads(selection_file.read_text())
entries = [entry for entry in manifest["cases"] if entry["id"] in args.ids] if args.ids else [entry for entry in manifest["cases"] if not entry["optional"]]
assert entries and (not args.ids or {entry["id"] for entry in entries} == set(args.ids)), "Unknown/empty case selection"
assert all(not entry["optional"] for entry in entries), "Unavailable optional cells must not enter the review packet"
out = (run / args.out).resolve()
private = (run / args.map_file).resolve()
assert out.is_relative_to(run.resolve()) and private.is_relative_to(run.resolve()), "Paths must stay within study"
assert not private.is_relative_to(out), "Private map must be outside reviewer packet"
assert not out.exists() and not private.exists(), "Never overwrite review packets or private mappings"
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
preflight, missing = [], []
for entry in entries:
    row = selection.get("cases", {}).get(entry["id"], {})
    assert row.get("selected"), f'{entry["id"]}: explicit final evidence selection missing'
    trace_path = (run / row["selected"]).resolve()
    assert trace_path.is_relative_to(run.resolve()) and trace_path.exists(), f'{entry["id"]}: selected trace missing'
    trace = json.loads(trace_path.read_text())
    assert trace.get("caseId") == entry["id"] and trace.get("captureVersion") == "2.0", "Use uniformly corrected final captures"
    for relative, expected in trace["sourceHashes"].items():
        assert sha(run / "cases" / entry["id"] / relative) == expected, f'{entry["id"]}: source changed after final capture: {relative}'
    images = [
        ("neutral", "desktop", "initial", "full-page", "desktop-neutral-full.png"),
        ("neutral", "mobile", "initial", "full-page", "mobile-neutral-full.png"),
        ("authored", "desktop", "initial", "actual viewport", "desktop-initial.png"),
        ("authored", "mobile", "initial", "actual viewport", "mobile-initial.png"),
    ]
    if entry["promptId"] == "fintech-transfer":
        images.extend([("authored", "mobile", "review", "actual viewport", "mobile-review-viewport.png"), ("authored", "mobile", "recoverable failure", "actual viewport", "mobile-failure-viewport.png")])
    else:
        images.extend([("authored", "mobile", "cart confirmation", "actual viewport", "mobile-cart-viewport.png"), ("authored", "desktop", "initial", "full-page", "desktop-full.png")])
    for image in images:
        if not (trace_path.parent / image[4]).exists(): missing.append(f'{entry["id"]}/{image[4]}')
    preflight.append((entry, trace_path, images))
if missing and not args.allow_missing_states:
    raise SystemExit("No packet written. Missing actual captures: " + ", ".join(missing))
random.Random(args.seed).shuffle(preflight)
for directory in [out / "neutral", out / "authored", out / "tasks"]:
    directory.mkdir(parents=True)
views, private_rows = [], []
for index, (entry, trace_path, image_specs) in enumerate(preflight, 1):
    view_id = f"{args.prefix}-{index:02}"
    task_id = "transfer" if entry["promptId"] == "fintech-transfer" else "product"
    view = {"view": view_id, "task": task_id, "brief": f"tasks/{task_id}.md", "fixture": f"tasks/{task_id}.json", "images": []}
    private_row = {"view": view_id, "case": entry["id"], "host": entry["host"], "model": entry["model"], "condition": entry["condition"], "selectedTrace": str(trace_path.relative_to(run)), "initialTrace": selection["cases"][entry["id"]].get("initial"), "images": []}
    for number, (stage, viewport, state, scope, raw_name) in enumerate(image_specs, 1):
        source = trace_path.parent / raw_name
        relative = f"{stage}/{view_id}-{number:02}.png"
        image = {"stage": stage, "viewport": {"width": 1440 if viewport == "desktop" else 390, "height": 1000 if viewport == "desktop" else 844}, "state": state, "scope": scope, "available": source.exists()}
        if source.exists():
            shutil.copyfile(source, out / relative)
            image.update({"file": relative, "sha256": sha(source)})
            private_row["images"].append({"packet": relative, "raw": str(source.relative_to(run)), "sha256": image["sha256"]})
        else:
            image["observation"] = "No actual capture for this state; leave unsupported judgments unassessed. No substitute image supplied."
        view["images"].append(image)
    views.append(view)
    private_rows.append(private_row)
    fixture = run / "shared" / f'{entry["promptId"]}.json'
    shutil.copyfile(fixture, out / "tasks" / f"{task_id}.json")
    brief = (run / "prompts" / f'{entry["promptId"]}.md').read_text().split("# Common implementation and tool conditions")[0]
    (out / "tasks" / f"{task_id}.md").write_text(brief)
common = {"schemaVersion": "1.0", "views": views, "method": "Anonymous randomized view labels. Original image bytes and hashes. Neutral first, authored only after neutral notes are locked. Full-page includes below-fold content; actual viewport is clipped to the stated height. Neutral grayscale preserves transparency/luminance but font replacement can reflow text."}
for stage in ["neutral", "authored"]:
    stage_data = {**common, "stage": stage, "views": [{**view, "images": [image for image in view["images"] if image["stage"] == stage]} for view in views]}
    (out / f"{stage}.json").write_text(json.dumps(stage_data, indent=2) + "\n")
(out / "README.md").write_text('''# Anonymous interface review

Use only the task briefs, fixtures and stage images in this packet. Do not inspect source outside this packet, private maps, implementation notes, task-test results or other runs. Do not infer unavailable interactions from screenshots.

First read neutral.json and its two images per view. Record structural observations and dimension notes without opening authored.json or authored images. Freeze those initial notes before the second stage. Neutral grayscale preserves transparency/luminance and removes radius/shadows; font replacement can reflow content, so it is a diagnostic rather than the original layout.

After neutral notes are locked, inspect authored.json and the four authored captures per view. Distinguish actual viewport from full-page scope. Record changes to your interpretation explicitly and preserve initial observations. Assess entry priority, decision context, narrow context, recovery evidence and composition purpose separately, with concrete image/task evidence. Use unassessed/null when a state or behavior is not shown. Do not use an overall score, assume a screenshot proves task success, or claim representative-user usability. Full-page captures include material below the visible screen.

Labels are randomized opaque IDs. Some captures can legitimately be absent if an operator task trace stopped; absent images are explicitly marked, never replaced with imagined states.
''')
packet_hashes = {str(path.relative_to(out)): sha(path) for path in sorted(out.rglob("*")) if path.is_file()}
private.parent.mkdir(parents=True, exist_ok=True)
private.write_text(json.dumps({"seed": args.seed, "builtAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "packet": args.out, "views": private_rows, "packetHashes": packet_hashes}, indent=2) + "\n")
for path in out.rglob("*.json"):
    content = path.read_text()
    assert not re.search(r'\bc\d{2}\b|gpt-|gemini|opencode|no-skill|current-skill', content, re.I), "Identity leakage in packet metadata"
print(json.dumps({"packet": args.out, "views": len(views), "images": sum(image["available"] for view in views for image in view["images"]), "missingCaptures": len(missing), "privateMap": args.map_file, "seed": args.seed}))
