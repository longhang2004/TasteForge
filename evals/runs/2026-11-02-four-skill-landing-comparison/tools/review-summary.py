"""Unblind only after both independent initial records were frozen."""
from pathlib import Path
import hashlib, html, json

run = Path(__file__).resolve().parents[1]
load = lambda p: json.loads(p.read_text())
freeze = load(run / "reviews/freeze.json")
for relative, expected in freeze["files"].items():
    assert hashlib.sha256((run / relative).read_bytes()).hexdigest() == expected
key = load(run / "review-key.json")["key"]
manifest = load(run / "manifest.json")
names = {"tasteforge": "TasteForge", "promax": "UI/UX Pro Max", "elaya": "Elaya", "impeccable": "Impeccable (offline constrained)"}
reviews = [load(run / f"reviews/reviewer-{n}.json") for n in [1, 2]]
def group_text(case, row):
    text = " > ".join(" = ".join(names[manifest["cells"][key[case][label]]["arm"]] for label in tier) for tier in row["groups"])
    if row["unassessed"]:
        text += "; unassessed: " + ", ".join(row["unassessed"])
    return text
lines = ["# Independently frozen dimension comparisons", "", "Both initial JSON/Markdown reviews were hashed before the parent opened the identity key. Preference groups run strongest to weaker; equals signs preserve ties. These are separate local dimension judgments, with no aggregate or overall repository ranking. Impeccable here means the constrained native offline path, not its full default online workflow.", "", "[Reviewer 1](reviewer-1.md) inspected 64 actual images; [reviewer 2](reviewer-2.md) inspected 56. Both covered the identical five-image core for all eight variants, plus symmetric invalid/full-page expansion. Reviewer 1 additionally inspected eight wide decision images. Different expansion scope can contribute to disagreement. Full comparative evidence/tradeoffs remain in their [JSON 1](reviewer-1.json) and [JSON 2](reviewer-2.json). [Freeze receipt](freeze.json), [identity key](../review-key.json), [packet](../review-packet/index.json), [operator adjudication](adjudication.md).", ""]
tables = []
comparisons = {}
for case in ["field-fold", "relay-notes"]:
    title = "Field Fold" if case == "field-fold" else "Relay Notes"
    lines += [f"## {title}", "", "| Dimension | Reviewer 1 | Reviewer 2 |", "| --- | --- | --- |"]
    rows = []
    comparisons[case] = []
    for category in ["visualCraft", "productSpecificity", "taskAccess"]:
        for one, two in zip(reviews[0]["cases"][case][category], reviews[1]["cases"][case][category]):
            dimension = one["dimension"]
            a, b = group_text(case, one), group_text(case, two)
            lines.append(f"| {category}: {dimension} | {a} | {b} |")
            rows.append(f"<tr><th scope='row'>{html.escape(category)}<br>{html.escape(dimension)}</th><td>{html.escape(a)}</td><td>{html.escape(b)}</td></tr>")
            comparisons[case].append({"category": category, "dimension": dimension, "reviewer1": a, "reviewer2": b, "sameOrderedGroups": one["groups"] == two["groups"] and one["unassessed"] == two["unassessed"]})
    lines += ["", "The two columns remain independent. A changed tie or ordering is retained as a disagreement rather than averaged away.", ""]
    tables.append(f"<section><h2>{title}</h2><div class='table-scroll' tabindex='0' role='region' aria-label='{title} dimension comparison'><table><thead><tr><th scope='col'>Dimension</th><th scope='col'>Reviewer 1</th><th scope='col'>Reviewer 2</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div></section>")
lines += ["## Identity mapping", "", "| Brief | A | B | C | D |", "| --- | --- | --- | --- | --- |"]
for case, mapping in key.items():
    lines.append("| " + case + " | " + " | ".join(f"{names[manifest['cells'][mapping[label]]['arm']]} ({mapping[label]})" for label in "ABCD") + " |")
lines += ["", "Read [findings and limitations](../report.md) and [resource coverage](../resources.md) separately. No human/manual test was conducted. Native detectors were creator aids, not the common judge. The raw initial reviews have not been overwritten after unblinding.", ""]
(run / "reviews/comparison.md").write_text("\n".join(lines))
(run / "reviews/unblinded-comparison.json").write_text(json.dumps({"mapping": key, "dimensions": comparisons, "basis": "Directly mapped frozen initial groups; no aggregation or adjudication changes to original judgments."}, indent=2) + "\n")
page = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Frozen independent reviews · Four-skill comparison</title><link rel="stylesheet" href="../gallery.css"><style>body{max-width:1500px}section{margin-block:36px}table{border-collapse:collapse;width:100%;font-size:.84rem;line-height:1.65}th,td{text-align:left;vertical-align:top;border:1px solid #9bafa1;padding:14px;overflow-wrap:anywhere}th{font-weight:650}tbody th{width:34%}td{width:33%}.table-scroll{overflow-x:auto}.table-scroll:focus-visible{outline:3px solid #a74a17;outline-offset:4px}</style></head><body><header><p class="eyebrow">Independently frozen / then unblinded</p><h1>Dimensions, ties<br>and disagreements.</h1><p>Two fresh AI reviewers inspected the identical anonymous packet. Initial files were hashed before the identity key was opened. Reviewer 1 inspected 64 images, reviewer 2 inspected 56. Both covered every variant's required wide/narrow and task-state sample; extra scope is recorded.</p><p>Groups run strongest to weaker. Equals signs mean a tie. No aggregate score, overall repository winner or human-usability claim. Impeccable means the constrained native offline path in this pilot.</p><p><a href="../index.html">UI gallery</a> · <a href="../report.md">Findings / limits</a> · <a href="comparison.md">Mapped comparison</a> · <a href="adjudication.md">Operator adjudication</a></p><p><a href="reviewer-1.md">Reviewer 1</a> (<a href="reviewer-1.json">JSON</a>) · <a href="reviewer-2.md">Reviewer 2</a> (<a href="reviewer-2.json">JSON</a>) · <a href="freeze.json">Freeze receipt</a> · <a href="../review-key.json">Identity key</a></p></header><main>""" + "".join(tables) + "<p>Complete comparative evidence, tradeoffs, limitations and findings stay in each unchanged initial review. <a href='../resources.md'>Observed resource coverage</a> is separate from these judgments. Human/manual tests remain deferred.</p></main></body></html>"
(run / "reviews/index.html").write_text(page + "\n")
print("Mapped frozen judgments without aggregation; initial reviews unchanged")
