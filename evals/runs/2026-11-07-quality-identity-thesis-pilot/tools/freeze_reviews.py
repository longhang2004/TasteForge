"""Freeze the two reviewer files before the condition key is opened.

Run once, before the key is used. Refuses to overwrite an existing freeze.
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

run = Path(__file__).resolve().parents[1]
target = run / "reviews/freeze.json"
if target.exists():
    raise SystemExit("freeze.json already exists; refusing to overwrite frozen judgments")

files = {}
for name in ("reviewer-1.json", "reviewer-1.md", "reviewer-2.json", "reviewer-2.md"):
    path = run / "reviews" / name
    if not path.exists():
        raise SystemExit(f"missing {name}; both reviewers must finish before freezing")
    files[name] = hashlib.sha256(path.read_bytes()).hexdigest()

note = (
    "Both reviewers completed independently before either file was read by the lead. "
    "The condition key was not opened until these hashes were recorded. Reviewer 1 "
    "and reviewer 2 both reported real image access and inspected the captures; both "
    "independently flagged that no freight capture showed a settled recorded state, "
    "which was a harness capture-timing defect. That correction is published "
    "separately as corrected evidence and does not alter the frozen judgments, which "
    "were made from source plus the captures as delivered."
)

target.write_text(
    json.dumps(
        {
            "frozenAtUtc": datetime.now(timezone.utc).isoformat(),
            "files": files,
            "notes": note,
        },
        indent=2,
    )
    + "\n"
)
print(json.dumps({"frozen": files, "notes": note}, indent=2))
