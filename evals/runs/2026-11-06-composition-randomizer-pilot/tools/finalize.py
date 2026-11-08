"""Freeze independent reviews before unblinding and publish the scoped report."""
from pathlib import Path
import datetime
import hashlib
import html
import json
import shutil
from review_integrity import verify_manifest

run = Path(__file__).resolve().parents[1]
root = Path(__file__).resolve().parents[4]
work = root / ".tmp/lon99-20261108"
packet = run / "review-packet"
packet_digest = verify_manifest(packet)
for task in ["proofdesk", "cabinet"]:
    available = {}
    for condition in ["baseline", "candidate"]:
        cell = task + "-" + condition
        report = json.loads((run / "evidence" / cell / "corrected/matched-v3/report.json").read_text())
        digest = hashlib.sha256((run / "outputs" / cell / "corrected/index.html").read_bytes()).hexdigest()
        assert digest == report["sourceSha256"], "Checked source changed after acceptance"
        available[digest] = report
    packet_sources = set()
    for label in ["A", "B"]:
        folder = packet / task / label
        digest = hashlib.sha256((folder / "source.html").read_bytes()).hexdigest()
        assert digest in available, "Packet source differs from accepted outputs"
        packet_sources.add(digest)
        checks = json.loads((folder / "checks.json").read_text())
        assert checks == {name: available[digest][name] for name in checks}, "Packet checks differ from acceptance"
    assert packet_sources == set(available), "Packet does not contain both accepted variants"
reviews = run / "reviews"
assert not (reviews / "freeze.json").exists(), "Preserve frozen judgments"
reviews.mkdir(exist_ok=True)
dimensions = {
    "taskQuality": ["firstActionSalience", "decisionContextRetention", "errorAndRecoveryClarity", "responsiveAccess", "semanticControlAndFocus"],
    "productSpecificity": ["contentToThesis", "suppliedArtifactsShapeComposition", "coherentMediaTypeDirection", "honestEvidenceLimits"],
}
judgments = []
review_resources = []
review_hashes = {}
for number in [1, 2]:
    source = work / f"ui-review-{number}"
    raw = json.loads((source / "stdout.json").read_text())
    assert raw["status"] == "SUCCESS", raw.get("status")
    response = raw["response"].strip()
    if response.startswith("```"):
        response = response.split("\n", 1)[1].rsplit("```", 1)[0]
    judgment = json.loads(response)
    for task in ["proofdesk", "cabinet"]:
        for category, names in dimensions.items():
            for name in names:
                assert judgment["tasks"][task][category][name]["preference"] in ["A", "B", "tie", "unassessed"]
    judgments.append(judgment)
    dest = reviews / f"reviewer-{number}"
    dest.mkdir()
    for filename in ["stdout.json", "stderr.txt", "invocation.json"]:
        shutil.copyfile(source / filename, dest / filename)
    (dest / "judgments.json").write_text(json.dumps(judgment, indent=2) + "\n")
    for file in sorted(dest.iterdir()):
        review_hashes[str(file.relative_to(reviews))] = hashlib.sha256(file.read_bytes()).hexdigest()
    invocation = json.loads((source / "invocation.json").read_text())
    review_resources.append({name: invocation.get(name) for name in ["host", "requestedModel", "effort", "startedAt", "finishedAt", "elapsedSeconds", "usage", "conversationId"]})
freeze = {"frozenAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "hashes": review_hashes, "packetManifestSha256": packet_digest, "packetVerification": "All indexed bytes/file paths, accepted source hashes and anonymous check records verified before freezing.", "procedure": "Both complete independent judgments frozen before this script reads review-key.json. No author restyling or adjudicated score."}
(reviews / "freeze.json").write_text(json.dumps(freeze, indent=2) + "\n")
# Condition identities become available only after the two review records are frozen.
key = json.loads((run / "review-key.json").read_text())["mapping"]
cells = {}
for task in ["proofdesk", "cabinet"]:
    for condition in ["baseline", "candidate"]:
        cell = task + "-" + condition
        evidence = Path("evidence") / cell / "corrected/matched-v3/report.json"
        report = json.loads((run / evidence).read_text())
        cells[cell] = {"report": str(evidence), "sourceSha256": report["sourceSha256"], "harnessSha256": report["harnessSha256"], **report["summary"], "states": len(report["captures"]), "axeViolations": sum(len(x["violations"]) for x in report["axe"]), "axeIncomplete": sum(len(x["incomplete"]) for x in report["axe"]), "startedAt": report["startedAt"], "finishedAt": report["finishedAt"]}
assert len({x["harnessSha256"] for x in cells.values()}) == 1
assert all(x["failed"] == x["harnessErrors"] == x["pageErrors"] == x["remoteRequests"] == x["axeViolations"] == 0 for x in cells.values())
acceptance = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "scope": "Matched corrected outputs at 320/390/1440; task/keyboard/focus/axe/geometry checks. Not human usability or accessibility conformance.", "cells": cells, "totalPassed": sum(x["passed"] for x in cells.values()), "totalStates": sum(x["states"] for x in cells.values()), "totalAxeIncomplete": sum(x["axeIncomplete"] for x in cells.values()), "corrections": "All four sources exactly match the 2026-11-07 handoff working snapshots. No UI edits or new generation in continuation.", "reviewFreeze": "reviews/freeze.json"}
(run / "acceptance.json").write_text(json.dumps(acceptance, indent=2) + "\n")
resources = json.loads((run / "resources.json").read_text())
resources["continuation20261108"] = {"scope": "Archive inherited corrections, matched-v3 checks, independent AGY reviews and reporting. Original Codex creator usage/billing remains unknown; delayed archive timestamps are not generation duration.", "checks": cells, "reviewers": review_resources, "providerUsageInterpretation": "AGY CLI reported categories are retained verbatim, not normalized or added to original creator costs. Exact backend/cache semantics, verified billing, parent/operator totals and full acceptance-cycle cost remain unknown.", "interruption": "Quota pause between 2026-11-06 corrections and 2026-11-08 acceptance; exclude unavailable interval from active-work claims.", "globalSettingsChanged": False}
(run / "resources.json").write_text(json.dumps(resources, indent=2) + "\n")
lines = ["# Composition/randomizer pilot — final scoped record", "", "Two fictional briefs, four preserved creator outputs and two independent AGY/Gemini reviews. This combined composition/type/skill/retrieval increment is compared with released beta.2. It does not isolate a font or algorithm effect.", "", "## Acceptance and preserved corrections", "", f"All four corrected outputs pass **{acceptance['totalPassed']} assertions across {acceptance['totalStates']} natural-viewport states** at 320/390/1440. Zero measured overflow failures, flow stops, page errors, external requests or axe violations. **{acceptance['totalAxeIncomplete']} axe incomplete records remain unassessed**, not passes. [Exact checks](acceptance.json).", "", "| Cell | Assertions | States | Axe incomplete |", "| --- | ---: | ---: | ---: |"]
for cell, data in cells.items():
    lines.append(f"| {cell} | {data['passed']} | {data['states']} | {data['axeIncomplete']} |")
lines += ["", "First outputs and matched-v2 failures are unchanged. The v3 harness fixes a hidden-media assumption uniformly; raw v2 counts are not distinct defects or a directly matched before/after quality metric. All corrected sources were already present in the handoff snapshot. The continuation verified zero frozen-input/snapshot drift, retained the existing proofdesk baseline archive and archived the other three. It made no additional UI correction and did not regenerate any initial output.", "", "## Independent judgments", "", "Both reviewers used fresh AGY CLI 1.4.12 contexts with `gemini-3.8-flash-high`, high effort, read-only packet access and no condition key/creator notes. [Judgments and raw records](reviews/) were hash-frozen before unblinding. Shared model/host and recognizable source style limit independence/blinding; AI judgments do not replace people using the product."]
for number, judgment in enumerate(judgments, 1):
    images = judgment.get("inspection", {}).get("imagesActuallyViewed", [])
    lines += ["", f"Reviewer {number} reports viewing {len(images)} image paths; its exact inspected scope, blockers and limitations remain in [the original judgment](reviews/reviewer-{number}/judgments.json)."]
for task in ["proofdesk", "cabinet"]:
    lines += ["", "### " + task, "", "Labels after unblinding: " + ", ".join(label + "=" + condition for label, condition in key[task].items()) + "."]
    for category, names in dimensions.items():
        lines += ["", category + ":", "", "| Dimension | Reviewer 1 | Reviewer 2 |", "| --- | --- | --- |"]
        for name in names:
            prefs = [j["tasks"][task][category][name]["preference"] for j in judgments]
            prefs = [key[task].get(p, p) for p in prefs]
            lines.append("| " + name + " | " + " | ".join(prefs) + " |")
lines += ["", "No aggregate quality/uniqueness score or overall winner is computed. Per-dimension evidence/tradeoffs, disagreements, ties, blockers and unassessed judgments stay in the original review records; this bounded pair cannot establish a general product-specificity or human-usability effect.", "", "## Resources and limits", "", "[Resources](resources.json) retain original dispatch/archive observations and append actual browser/reviewer intervals plus AGY-reported usage categories. Original creator provider tokens/cache/thinking/billing, normalized cross-host accounting and parent/operator totals remain unknown. The quota pause is availability loss, not UI failure; delayed corrected-archive timestamps are not creator duration. No full accepted-UI savings or model ranking is claimed.", "", "Frozen candidate and shared inputs remain bound by [freeze.json](freeze.json) and the original [protocol](protocol.md). Teaching families overlap; facts/assets are new fictional fixtures. Both conditions had identical facts/assets/optional fonts; reference retrieval differences belong to the combined treatment. Font delivery/script observations remain limited to recorded samples. Manual/human/native-speaker testing remains deferred. Broader LON-99 catalog ingestion, LON-109 replication and LON-95 host coverage are separate. No release, npm publication, main merge or global host setting change is included.", "", "[Gallery](index.html) · [Handoff](HANDOFF.md) · [Preflight](evidence/continuation-preflight-2026-11-08.json)"]
(run / "report.md").write_text("\n".join(lines) + "\n")
cards = []
for cell, data in cells.items():
    evidence = f"evidence/{cell}/corrected/matched-v3"
    cards.append(f'<section><h2>{html.escape(cell)}</h2><p>{data["passed"]} assertions; {data["states"]} states; {data["axeIncomplete"]} axe incomplete records.</p><p><a href="outputs/{cell}/corrected/index.html">Open corrected task</a> · <a href="{evidence}/report.json">Checks</a> · <a href="outputs/{cell}/initial/index.html">Preserved initial</a></p><details><summary>Natural viewport captures</summary>' + ''.join(f'<figure><img loading="lazy" src="{evidence}/{capture.name}" alt="{html.escape(cell)}: {html.escape(capture.stem)}"><figcaption>{html.escape(capture.stem)}</figcaption></figure>' for capture in sorted((run / evidence).glob("*.png"))) + '</details></section>')
(run / "index.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Composition/randomizer pilot</title><style>body{max-width:76rem;margin:auto;padding:1.5rem;font:1rem/1.6 system-ui;overflow-wrap:anywhere;color:#202522;background:#f6f5f0}a{color:#164c8a}section{border-top:1px solid #718078;padding:1rem 0}img{max-width:100%;height:auto}figure{margin:1rem 0}summary{cursor:pointer}:focus-visible{outline:3px solid #164c8a;outline-offset:4px}</style><main><h1>Composition/randomizer pilot</h1><p>Four preserved outputs; matched technical checks and independent per-dimension judgments. Human usability and accessibility conformance remain unassessed.</p><p><a href="report.md">Report</a> · <a href="acceptance.json">Acceptance</a> · <a href="resources.json">Resources</a> · <a href="reviews/freeze.json">Review freeze</a></p>' + ''.join(cards) + '</main></html>\n')
print(json.dumps({"assertions": acceptance["totalPassed"], "states": acceptance["totalStates"], "reviewsFrozen": 2, "report": str(run / "report.md")}))
