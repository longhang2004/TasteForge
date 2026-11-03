"""Verify pinned inputs, accepted bytes and independently frozen review evidence."""
from pathlib import Path
import hashlib, json, ast

run = Path(__file__).resolve().parents[1]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
load = lambda p: json.loads(p.read_text())
manifest = load(run / "manifest.json")
assert sha(run / "manifest.json") == "d3db81478bdfd652fed9e1a478680d20252185fdf014f7912f8403f082fe1f70"
for relative, expected in manifest["inputs"].items():
    assert sha(run / relative) == expected["sha256"], relative
packet = load(run / "review-packet/hashes.json")
for relative, expected in packet.items():
    assert sha(run / "review-packet" / relative) == expected, relative
accepted = load(run / "acceptance.json")
assert len(accepted) == 8
common = {str(p.relative_to(run / "common")): sha(p) for p in (run / "common").rglob("*") if p.is_file()}
for cell, record in accepted.items():
    final = run / "cells" / cell / "final"
    report = load(run / record["report"])
    assert not report["failures"], cell
    assert record["sourceSha256"] == report["sourceSha256"] == sha(final / "index.html"), cell
    assert all(sha(final / "common" / relative) == expected for relative, expected in common.items()), cell
    assert record["states"] == 16
    assert all(not s["violations"] and s["geometry"]["status"] == "pass" for t in report["traces"] for s in t["states"]), cell
    creator = load(final / "creator-record.json")
    for version in creator.get("versions", []):
        relative = version.get("path", version.get("file", version.get("version")))
        expected = version.get("sha256", version.get("hash"))
        if relative and expected:
            file = final / relative if not relative.startswith("/") else final / "versions" / Path(relative).name
            assert sha(file) == expected, (cell, relative)
assert sum(r["checks"] for r in accepted.values()) == 276
assert sum(r["states"] for r in accepted.values()) == 128
key = load(run / "review-key.json")["key"]
for case, mapping in key.items():
    for label, cell in mapping.items():
        assert sha(run / "review-packet" / case / label / "index.html") == accepted[cell]["sourceSha256"]
probe = load(run / "evidence/price-precision-probe/report.json")
assert not probe["failures"]
freeze = load(run / "reviews/freeze.json")
for relative, expected in freeze["files"].items():
    assert sha(run / relative) == expected, relative
for n in [1, 2]:
    review = load(run / f"reviews/reviewer-{n}.json")
    assert len(set(review["inspectedImages"])) >= 40
    for relative in review["inspectedImages"]:
        # Reviewers may retain either packet-root or run-relative names.
        file = run / relative if relative.startswith("review-packet/") else run / "review-packet" / relative
        assert file.is_file(), relative
    for case in ["field-fold", "relay-notes"]:
        for group, count in [("visualCraft", 4), ("productSpecificity", 3), ("taskAccess", 3)]:
            assert len(review["cases"][case][group]) == count
            for row in review["cases"][case][group]:
                labels = [label for tier in row["groups"] for label in tier] + row["unassessed"]
                assert sorted(labels) == list("ABCD"), (n, case, row["dimension"])
gallery = load(run / "evidence/gallery-02/report.json")
assert not gallery["failures"]
for relative in ["README.md", "report.md", "resources.md", "reviews/comparison.md"]:
    import re
    file = run / relative
    for target in re.findall(r"\]\(([^)]+)\)", file.read_text()):
        if not target.startswith(("http:", "https:", "#", "mailto:")):
            assert (file.parent / target.split("#")[0]).exists(), (relative, target)
for file in (run / "tools").glob("*.py"):
    ast.parse(file.read_text(), filename=str(file))
print(json.dumps({"frozenInputs": len(manifest["inputs"]), "packetFiles": len(packet), "acceptedCells": len(accepted), "taskAssertions": 276, "taskStateCaptures": 128, "priceProbeChecks": len(probe.get("checks", [])), "galleryAssertions": len(gallery["checks"]), "reviewFilesFrozen": len(freeze["files"]), "result": "pass"}))
