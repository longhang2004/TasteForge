"""Publish per-dimension judgments after both original reviews are frozen."""
from pathlib import Path
import hashlib
import json

run = Path(__file__).resolve().parents[1]
manifest = json.loads((run / "manifest.json").read_text())
key = json.loads((run / "review-key.json").read_text())["key"]
freeze = json.loads((run / "reviews/freeze.json").read_text())
for file, expected in freeze["files"].items():
    assert hashlib.sha256((run / "reviews" / file).read_bytes()).hexdigest() == expected
reviews = [json.loads((run / f"reviews/reviewer-{n}.json").read_text()) for n in [1, 2]]
acceptance = json.loads((run / "acceptance.json").read_text())
resources = json.loads((run / "resources.json").read_text())
def verdict(family, label):
    return label if label in ["tie", "unassessed"] else manifest["conditionKey"][key[family][label]]
lines = ["# Quality / product-identity forward test", "",
"**Mixed scoped evidence:** candidate improves several observed task-context/narrow-access decisions; it does not demonstrate generally stronger product specificity. Lean has stronger visual/artifact direction in several reviewer dimensions. Ties and disagreements remain. This is a two-prompt AI-reviewed pilot, not a causal population effect, human-usability result or uniqueness certificate.", "",
"## Exact scope", "",
"Lean `4c24a590974046c342de89f092da63fb419749a7` vs frozen candidate `1f5b8089be26232afbbc054dc8a6e0c73f79b826`. [Manifest](manifest.json) freezes source/resource trees and common [protocol](protocol.md), prompts and operator instructions before dispatch. Two fresh contexts per prompt; same inherited Codex model/host/tools/allowances within pairs, exact resolved model/provider telemetry unavailable. Counterbalanced dispatch: press lean first, listening candidate first. No AGY/OpenCode cells or paid substitution, and no expansion.", "",
"Different fictional products/fixtures from teaching studies, with declared work/content family overlap. No external media, network, packages or global settings were used in cells. [Authored studies](../../../examples/composition-studies/README.md) are a separate evidence layer.", "",
"All four submitted outputs pass matched scoped acceptance: **114 task assertions,72 natural viewport states**, widths320/390/1440. Press33 checks/cell, listening24/cell; no reported final functional/overflow/page-error/axe violations. Incomplete contrast checks remain. [Acceptance hashes](acceptance.json) bind each final byte-identically to its checked creator submission. No operator UI corrections. Passing automation alone did not establish the review verdicts.", "",
"## Independent review, then unblind", "",
"Both reviewers authored none of the outputs, used fresh contexts and identical randomized88-file [packet](review-packet/index.json). They inspected34/30 actual images plus identical tasks/source/checks. [Initial judgments and hashes](reviews/freeze.json) froze before opening [key](review-key.json): press A=candidate / B=lean; listen A=candidate / B=lean (the independent randomizations happened to align). No creator notes or identity were provided. Procedural blinding can still be guessed from styling; reviewer inspection/sample scopes and unknown start/resource fields are explicit. Normal renders only; no neutralized diagnostic or uniqueness metric.", "",
"[Reviewer1](reviews/reviewer-1.md) · [Reviewer2](reviews/reviewer-2.md). No aggregate quality/slop score. Each row below retains both judgments; evidence/tradeoffs remain in the original reviews.", ""]
for family, title in [("press", "Margin Pressroom"), ("listen", "Estuary Listening Room")]:
    lines += [f"### {title}", ""]
    for group, title2 in [("taskQuality", "Task quality"), ("productSpecificity", "Product specificity")]:
        lines += [f"{title2}:", "", "| Dimension | Reviewer1 | Reviewer2 |", "| --- | --- | --- |"]
        for a, b in zip(reviews[0]["cases"][family][group], reviews[1]["cases"][family][group]):
            lines.append(f"| {a['dimension']} | {verdict(family,a['verdict'])} | {verdict(family,b['verdict'])} |")
        lines += [""]
lines += ["### Consequences and disagreements", "",
"Press: both prefer candidate's complete mobile conditions before confirmation and shorter post-action review/edit path. Entry priority disagrees: lean exposes both dates, candidate is more compact/task-direct. Lean's red/blue process schematic/type system is visually stronger to both reviewers; structural responsiveness and supplied-fact specificity are mixed. Retention/recovery/access evidence ties. Candidate's native date selector clips its display at320 and some390 focus outlines start about0.4px above viewport; these are recorded concerns, not established completion blockers. Lean retains a stale date-change instruction after selection and puts complete narrow terms after actions.", "",
"Listening: both prefer candidate's earlier controls/comparative records and narrow access; decision context is candidate/tie. Lean has more record-specific illustrative sketches and a more coordinated notebook direction. Structure and cross-width preservation disagree/tie. Lean's two-column390 disclaimer creates a tall narrow prose column; candidate's generic water/air strip is less connected to the chosen note. Both retain truthful no-audio limits and result context; recovery/access evidence ties. Required metadata still exists in both, with different ordering.", "",
"No reviewer established a concrete functional completion blocker. Minor clipping, reading-order/first-viewport and spacing costs remain visible, with no further restyling. No additional prompts were dispatched: the pilot yields a clear mixed boundary rather than a named functional uncertainty requiring expansion. It cannot settle general treatment efficacy.", "",
"## First outputs, corrections and failures", "",
"`initial/versions/00.html` preserves each first runnable source; `initial/index.html` is the submitted creator result after any disclosed self-correction. Press lean had no UI correction. Press candidate corrected a landmark finding and narrow conditions order in one pass. Listening lean corrected a navigation-name semantic finding in one pass; listening candidate separated visually joined date/local time in one pass. Every numbered source hash was verified. [Creator records](cells/) retain actual loaded paths, limits and failures; final copies have no hidden operator change.", "",
"Root listening candidate initial01 failed readiness because a strict `h1` locator included a hidden heading. The initial02 harness selected a visible heading and passed, without changing UI. Task/harness byte snapshots and source hashes are kept in each root evidence directory. Creator failures include WSL sandbox denial, runtime lookup/quoting and axe context setup. Listening candidate's first auxiliary creator browser report was overwritten and reconstructed/transcribed: **not preserved raw evidence**. This provenance loss cannot be repaired by relabeling the reconstruction. First00 HTML remains, and root matched acceptance is separate fresh evidence. No reconstruction is used for the accepted root verdict.", "",
"## Observed resources, not end-to-end savings", "",
"[Resources](resources.json) preserves exact observed segment timestamps, first-artifact times, loaded-word proxies, correction versions and every root browser attempt. Some creator clocks start after initial input/launcher work; these intervals have different partial start bases. Columns must not be treated as complete or billed cost, and overlapping cells must not be summed as total elapsed.", "",
"| Cell / condition | First-artifact observed seconds | Creator observed seconds incl. checks/revision | Self UI passes | Root browser seconds | Loaded skill words |", "| --- | ---: | ---: | ---: | --- | ---: |"]
for cell, data in resources["cells"].items():
    durations = ", ".join(f"{v['seconds']:.1f}" + (" (harness failure)" if v["failures"] else "") for v in data["operatorBrowserSegments"])
    lines.append(f"| {cell} / {data['condition']} | {data['firstArtifactObservedSeconds']:.1f} | {data['creatorObservedSeconds']:.1f} | {data['creatorUiCorrections']} | {durations} | {data['loadedSkillWords']} |")
lines += ["", "Example of the boundary: press candidate reaches a first artifact earlier in its observed segment but has a longer observed creator/check/revision interval than lean. Neither is a full-cycle saving. Listening shows a shorter observed candidate creator interval, with different start coverage and added reference words. This pair-level mixture does not support general savings.", "",
"Provider input/output/thinking/cache tokens, exact model version, billing, complete operator/evaluator tool/token totals, and full accepted-UI monetary/resource savings are **unknown**. Reviewer start timestamps were not completely sampled; their actual image scopes and null fields remain in original records. Harness authoring/revisions, queue/review/finalization are not silently counted as zero. Static entry words582→593, entry+create853→883 and all-resource words9979→10554 are source proxies, not model tokens. Fast edits do not load this full library.", "",
"## Checks and limits", "",
"The teaching implementation passed normal build/typecheck/lint/format plus44/44 repo tests, skill-creator validation, relative links and local package-resource inspection. The fresh cells have their own source hashes, functional/width/access checks and natural viewport/focus captures. Original studies/runs were not rewritten. Final new-run hash manifest and gallery verify file/link coverage; no human/manual, screen-reader, real-device or accessibility-conformance test is claimed.", "",
"LON-99's79-observation StartBootstrap/AdminLTE concentration remains a catalog-ingestion/source-balancing gap; these original task studies add teaching/routing coverage, not proof of catalog diversity or regression balance. No catalog/schema/ranking/generator/hard-gate change. LON-109 retains broader full-cycle/profile replication; LON-95 actual host installation/discovery is separate. No release, version bump, publication, main merge or global host change."]
(run / "report.md").write_text("\n".join(lines) + "\n")
cells = []
for cell, data in acceptance.items():
    report = json.loads((run / data["report"]).read_text())
    images = []
    for trace in report["traces"]:
        selected = ["entry", "failure" if cell.startswith("press") else "detail"] if trace["width"] == 320 else ["entry"] if trace["width"] == 1440 else ["review" if cell.startswith("press") else "return"]
        for state in trace["states"]:
            if state["label"] in selected:
                images.append({"state":state["label"],"width":trace["width"],"file":state["viewport"]})
    cells.append({"id":cell,"condition":manifest["conditionKey"][cell],"verdict":"Scoped automated acceptance","checks":data["checks"],"correction":f"{resources['cells'][cell]['creatorUiCorrections']} creator self-correction;0 operator UI corrections","report":data["report"],"images":images})
(run / "results.json").write_text(json.dumps({"summary":"Mixed pilot: candidate helps several task-context/narrow-access decisions; stronger product specificity is not established. Lean has several stronger visual/artifact judgments. Ties/disagreements and unknown total costs remain.","cells":cells},indent=2)+"\n")
(run / "reviews/index.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Frozen reviews</title><h1>Independent frozen judgments</h1><p><a href="reviewer-1.md">Reviewer1</a> · <a href="reviewer-2.md">Reviewer2</a> · <a href="freeze.json">Hashes</a> · <a href="../report.md">Unblinded report</a></p></html>')
(run / "cells/index.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Creator records</title><h1>Creator source and records</h1>' + ''.join(f'<p>{cell}: <a href="{cell}/initial/creator-record.json">record</a> · <a href="{cell}/initial/versions/00.html">first source</a> · <a href="{cell}/initial/index.html">submission</a> · <a href="{cell}/final/index.html">final</a></p>' for cell in acceptance) + '</html>')
print("Wrote report, per-dimension tables and gallery results without altering reviewer files.")
