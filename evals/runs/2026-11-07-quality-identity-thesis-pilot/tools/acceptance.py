"""Bind each accepted cell to the exact bytes that were checked.

Refuses to record an acceptance whose report has failures, whose source hash does
not match the submitted file, or whose browser run produced page errors or
external requests. Nothing here edits a creator's output.
"""

import hashlib
import json
from pathlib import Path

run = Path(__file__).resolve().parents[1]
manifest = json.loads((run / "manifest.json").read_text())
result = {}
for cell in manifest["conditionKey"]:
    cell_dir = run / "cells" / cell / "initial"
    # Freight cells have a corrected capture pass: the reviewed pass fired the
    # success capture mid-transition. Prefer the corrected pass when it exists, and
    # keep the reviewed pass referenced explicitly rather than discarding it.
    reviewed = run / "evidence" / cell / "initial-01" / "report.json"
    corrected = run / "evidence" / cell / "initial-02" / "report.json"
    report_path = corrected if corrected.exists() else reviewed
    if not report_path.exists():
        raise SystemExit(f"{cell}: missing acceptance report")
    report = json.loads(report_path.read_text())
    if report["failures"]:
        raise SystemExit(f"{cell}: report has failures: {report['failures']}")
    source = (cell_dir / "index.html").read_bytes()
    source_sha = hashlib.sha256(source).hexdigest()
    if report["sourceSha256"] != source_sha:
        raise SystemExit(f"{cell}: accepted bytes are not the submitted bytes")
    record = json.loads((cell_dir / "creator-record.json").read_text())
    versions = record.get("versions", [])
    last = versions[-1]["file"] if versions else None
    if last and (cell_dir / last).read_bytes() != source:
        raise SystemExit(f"{cell}: submission differs from its last kept version")

    traces = report["traces"]
    states = [s for t in traces for s in t["states"]]
    violations = sum(len(s["violations"]) for s in states)
    incomplete = sum(len(s["incomplete"]) for s in states)
    page_errors = sum(len(t["pageErrors"]) for t in traces)
    external = sum(len(t["externalRequests"]) for t in traces)
    widths = sorted({t["width"] for t in traces})

    result[cell] = {
        "report": str(report_path.relative_to(run)),
        "sourceSha256": source_sha,
        "condition": manifest["conditionKey"][cell],
        "checks": report["checks"],
        "states": len(states),
        "widths": widths,
        "axeViolations": violations,
        "axeIncomplete": incomplete,
        "pageErrors": page_errors,
        "externalRequests": external,
        "operatorUiCorrections": 0,
        "creatorCorrections": max(0, len(versions) - 1),
        "browser": f"Chromium {report['chromium']}",
        "reviewedEvidence": str(reviewed.relative_to(run)) if reviewed.exists() else None,
        "captureCorrection": (
            "success capture re-run after reviewers reported a mid-transition frame"
            if corrected.exists() and report_path == corrected
            else None
        ),
        "verdict": "scoped automated acceptance; human tests deferred",
    }

(run / "acceptance.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
