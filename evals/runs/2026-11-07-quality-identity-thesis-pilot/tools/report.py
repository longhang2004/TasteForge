"""Publish per-dimension judgments after both original reviews are frozen."""

import hashlib
import json
from pathlib import Path

run = Path(__file__).resolve().parents[1]
manifest = json.loads((run / "manifest.json").read_text())
key = json.loads((run / "review-key.json").read_text())["key"]
freeze = json.loads((run / "reviews/freeze.json").read_text())

for file, expected in freeze["files"].items():
    actual = hashlib.sha256((run / "reviews" / file).read_bytes()).hexdigest()
    if actual != expected:
        raise SystemExit("%s changed after the judgments were frozen" % file)

reviews = [json.loads((run / ("reviews/reviewer-%d.json" % n)).read_text()) for n in (1, 2)]
acceptance = json.loads((run / "acceptance.json").read_text())
resources = json.loads((run / "resources.json").read_text())
BT = chr(96)


def code(text):
    return BT + text + BT


def verdict(family, label):
    if label in ("tie", "unassessed"):
        return label
    return manifest["conditionKey"][key[family][label]]


def tally(family, group, index):
    counts = {}
    for row in reviews[index]["cases"][family][group]:
        counts[row["verdict"]] = counts.get(row["verdict"], 0) + 1
    return counts


lines = [
    "# Product-specificity pilot - content thesis (2026-11-07)",
    "",
    "**Two prompts, four fresh outputs, two independent AI reviews.** One candidate",
    "refinement was tested against the lean baseline: an on-demand step that turns",
    "supplied product content into a visual thesis. Both conditions cleared the same",
    "automated acceptance; any difference is in the judgments below.",
    "",
    "This is a bounded pilot. It is not a causal population effect, not a human-",
    "usability result, not an accessibility-conformance claim and not a uniqueness",
    "measure. Ties and disagreements are retained and no score is aggregated.",
    "",
    "## Exact conditions",
    "",
    "Lean baseline %s versus candidate %s." % (code(manifest["baseline"]), code(manifest["candidate"])),
    "[Manifest](manifest.json) freezes both resource trees plus the shared",
    "[protocol](protocol.md), [operator instructions](operator.md) and prompts before",
    "dispatch. Four fresh creator contexts, counterbalanced order:",
    "%s, %s, %s, %s." % tuple(code(c) for c in manifest["dispatchOrder"]),
    "",
    "| Cell | Condition | Prompt |",
    "| --- | --- | --- |",
]
for cell, condition in manifest["conditionKey"].items():
    family = "freight" if cell.startswith("freight") else "archive"
    lines.append("| %s | %s | %s |" % (code(cell), condition, family))

lines += [
    "",
    "Declared family overlap: freight overlaps operational decision work and archive",
    "overlaps collection exploration. Neither is claimed as a wholly unseen domain.",
    "Both are new fictional products with fixtures distinct from the teaching pairs and",
    "from the 2026-11-02 prompts.",
    "",
    "## Availability",
    "",
    "**No cell was lost to availability.** All four dispatches produced a submitted",
    "artifact with preserved versions: %s is the first runnable file saved before any" % code("versions/00.html"),
    "browser test, and %s is the submitted result after at most one disclosed" % code("initial/index.html"),
    "self-correction pass. Every declared hash was re-verified against the bytes on disk.",
    "",
    "## Automated acceptance (a floor, not a verdict)",
    "",
]
total_checks = sum(a["checks"] for a in acceptance.values())
total_states = sum(a["states"] for a in acceptance.values())
lines.append(
    "All four submitted outputs pass matched scoped acceptance: **%d task assertions across %d natural-viewport states**, widths 320/390/1440. Zero axe violations, zero page errors, zero external requests in every cell. Axe **incomplete** items are retained and left open, not counted as passes."
    % (total_checks, total_states)
)
lines += [
    "",
    "| Cell | Condition | Assertions | States | axe violations | axe incomplete | Creator corrections | Operator UI corrections |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
]
for cell, data in acceptance.items():
    lines.append(
        "| %s | %s | %d | %d | %d | %d | %d | %d |"
        % (
            code(cell),
            data["condition"],
            data["checks"],
            data["states"],
            data["axeViolations"],
            data["axeIncomplete"],
            data["creatorCorrections"],
            data["operatorUiCorrections"],
        )
    )

lines += [
    "",
    "The same assertion code path ran for both conditions of each prompt, so the pairs",
    "are matched evidence rather than two separately written suites. No operator restyled",
    "any creator output. Where one page legitimately blocked Release by refusing to",
    "advance instead of disabling the control, the assertion was written against the",
    "**outcome** so neither design was privileged.",
    "",
    "## Independent review, then unblind",
    "",
    "Both reviewers authored none of the outputs, used fresh contexts, and received the",
    "same randomized packet (%d files) with identical task facts, source, captures and raw" % len(json.loads((run / "review-packet/hashes.json").read_text())),
    "checks. They froze judgments before opening [the key](review-key.json).",
    "",
    "Label mapping after unblinding: "
    + "; ".join(
        "%s A=%s, B=%s"
        % (family, manifest["conditionKey"][key[family]["A"]], manifest["conditionKey"][key[family]["B"]])
        for family in key
    )
    + ".",
    "",
    "Procedural blinding can still be guessed from implementation style, and each",
    "reviewer's inspection scope and unknown fields remain explicit in their record.",
    "Normal renders only; no neutralized diagnostic and no uniqueness metric.",
    "",
    "## Judgments, per dimension, both reviewers retained",
    "",
]

titles = {"freight": "Harbor Cold Chain - consignment release", "archive": "Lantern Slide Lecture Archive"}
for family in ("freight", "archive"):
    lines += ["### " + titles[family], ""]
    for group, heading in (("taskQuality", "Task quality"), ("productSpecificity", "Product specificity")):
        lines += [heading + ":", "", "| Dimension | Reviewer 1 | Reviewer 2 |", "| --- | --- | --- |"]
        for row_a, row_b in zip(reviews[0]["cases"][family][group], reviews[1]["cases"][family][group]):
            lines.append(
                "| %s | %s | %s |"
                % (row_a["dimension"], verdict(family, row_a["verdict"]), verdict(family, row_b["verdict"]))
            )
        lines.append("")
    lines += [
        "Reasons, tradeoffs and unassessed items stay in the original reviews:",
        "[Reviewer 1](reviews/reviewer-1.md) - [Reviewer 2](reviews/reviewer-2.md).",
        "",
        "Verdict tallies (A / B / tie / unassessed), reviewer 1 / reviewer 2:",
        "",
    ]
    for group, heading in (("taskQuality", "task quality"), ("productSpecificity", "product specificity")):
        counts_a = tally(family, group, 0)
        counts_b = tally(family, group, 1)
        row = ", ".join(
            "%s %d/%d" % (label, counts_a.get(label, 0), counts_b.get(label, 0))
            for label in ("A", "B", "tie", "unassessed")
        )
        lines.append("- %s: %s" % (heading, row))
    lines.append("")

lines += [
    "## What this run does and does not settle",
    "",
    "It tests one named increment - a content-to-thesis step in art-direction.md -",
    "against the same lean baseline on two new matched prompts. Any preference recorded",
    "below is about these two prompts under this operating procedure. It is not evidence",
    "that either condition is generally better, and it says nothing about a population of",
    "tasks, human users or other models.",
    "",
    "### Consequences and disagreements",
    "",
    freeze.get("notes", "See the two reviews for per-dimension reasoning."),
    "",
    "## First outputs, corrections and failures",
    "",
    "%s preserves each first runnable source and %s is the submitted result; every" % (code("initial/versions/00.html"), code("initial/index.html")),
    "declared hash was re-verified. Each cell discloses at most one creator self-",
    "correction pass. Real creator-side failures are recorded per cell in the",
    "[creator records](cells/), including a focus-after-open defect in archive-R1 and a",
    "self-introduced regression in freight-R1.",
    "",
    "Harness defects fixed during this run are part of the evidence: acceptance initially",
    "selected records through a container text, clicked visually hidden 1x1 inputs",
    "instead of their labels, sampled the DOM before the page settled, and required",
    "control *state* rather than the *outcome* for the blocked Release. Each was",
    "diagnosed against the rendered page before being fixed, and no fix relaxed an",
    "assertion a page had actually failed.",
    "",
    "## Observed resources, not end-to-end savings",
    "",
    "[Resources](resources.json) preserves exact observed timestamps, first-artifact",
    "times, loaded-word proxies, correction counts and every acceptance segment. Creator",
    "clocks have different partial start bases and the cells overlap in wall time, so the",
    "columns must not be summed or read as complete cost.",
    "",
    "| Cell | Condition | Creator observed (min) | Budget status | Self corrections | Loaded skill words |",
    "| --- | --- | ---: | --- | ---: | ---: |",
]
for cell, data in resources["cells"].items():
    minutes = data["creatorObservedMinutes"]
    lines.append(
        "| %s | %s | %s | %s | %d | %d |"
        % (
            code(cell),
            data["condition"],
            "unknown" if minutes is None else minutes,
            data["creatorBudgetStatus"],
            data["creatorCorrections"],
            data["loadedSkillWords"],
        )
    )

lines += [
    "",
    "Every creator exceeded the protocol soft 8-minute budget and three exceeded the hard",
    "15-minute budget. Those overruns are reported as overruns, not trimmed. A budget stop",
    "is a stop, and overrunning is not evidence of quality or of a saving.",
    "",
    "Provider input/output/thinking/cache tokens, exact resolved model version, billed",
    "money, complete operator/evaluator tool totals and any full-cycle saving are",
    "**unknown** and recorded as null. Word counts are words read from the skill files a",
    "creator opened; they are not tokens and imply no end-to-end saving.",
    "",
    "## Checks and limits",
    "",
    "Acceptance used the repository installed Playwright 1.64.1 and @axe-core/playwright",
    "4.14.0 under WSL2, installing nothing; no cell made an external request. Captures are",
    "natural viewport at 320/390/1440 and both axe violations and incomplete are kept.",
    "",
    "Not established: human or manual usability, screen-reader output, real accessibility",
    "conformance, non-Chromium engines, forced-colors or extreme zoom reflow, catalog and",
    "ranking effects, and any monetary or token claim. Authored studies remain separate",
    "evidence. No release, tag, publish or main merge is part of this run.",
]
(run / "report.md").write_text("\n".join(lines) + "\n")

cells = []
for cell, data in acceptance.items():
    report = json.loads((run / data["report"]).read_text())
    images = []
    for trace in report["traces"]:
        for state in trace["states"]:
            images.append({"state": state["label"], "width": trace["width"], "file": state["viewport"]})
    cells.append(
        {
            "id": cell,
            "condition": data["condition"],
            "verdict": data["verdict"],
            "checks": data["checks"],
            "states": data["states"],
            "axeViolations": data["axeViolations"],
            "axeIncomplete": data["axeIncomplete"],
            "creatorCorrections": data["creatorCorrections"],
            "report": data["report"],
            "images": images,
        }
    )
(run / "results.json").write_text(
    json.dumps(
        {
            "summary": "Two-prompt, four-output matched pilot. All cells cleared scoped automated acceptance. Per-dimension judgments are in report.md and the frozen reviews; no aggregate score.",
            "cells": cells,
        },
        indent=2,
    )
    + "\n"
)
(run / "reviews/index.html").write_text(
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>Frozen reviews</title>'
    "<h1>Independent frozen judgments</h1>"
    '<p><a href="reviewer-1.md">Reviewer 1</a> - <a href="reviewer-2.md">Reviewer 2</a> - '
    '<a href="freeze.json">Hashes</a> - <a href="../report.md">Unblinded report</a></p></html>'
)
(run / "cells/index.html").write_text(
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>Creator records</title>'
    "<h1>Creator source and records</h1>"
    + "".join(
        '<p>%s: <a href="%s/initial/creator-record.json">record</a> - '
        '<a href="%s/initial/versions/00.html">first source</a> - '
        '<a href="%s/initial/index.html">submission</a></p>' % (cell, cell, cell, cell)
        for cell in acceptance
    )
    + "</html>"
)
print("Wrote report.md, results.json and galleries without altering reviewer files.")
