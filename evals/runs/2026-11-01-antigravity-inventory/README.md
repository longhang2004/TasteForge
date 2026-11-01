# Antigravity inventory comparison — 1 November 2026

**Antigravity CLI works. This pair shows better mobile grouping with TasteForge, but no clear escape from generic panel/card composition.** Two native Antigravity 1.4.12 sessions used pinned Gemini 3.8 Flash (Medium) and the same fictional warehouse task, fixture, starter and available tools.

Open the [comparison viewer](index.html), [full findings](report.md), or [measured results](results.json). Prior twelve-case scores are not reused or mixed into this host/model experiment.

## What actually happened

- Both final UIs complete all **19 contract/execution checks per viewport**, plus a passing selection-hook diagnostic, at 1440px and 390px. Search/no-results, stock evidence, edit retention, invalid quantity prevention, simulated first failure and retry were exercised. No initial document overflow was measured at the supporting 320px width. These checks do not measure comprehension or ease.
- Two independent, condition-blind AI reviewers each inspect sixteen images. Both rate the assisted narrow layout **3 versus 2** for baseline: clearer metric grouping and earlier item selection. Both identify long stacked mobile content and repeated evidence; the baseline's compact desktop table has advantages too.
- Recovery scores tie. Reviewers differ on entry/decision/composition gains; all individual scores and disagreements are retained. Familiar list/detail composition is appropriate to the task, but the large empty placeholder regions, repeated disclosures and nested metrics still feel conventional rather than strongly task-edited.
- Initial axe scans report zero violating rules in both cases. Failure/final scans report contrast findings in both and a target-size finding in baseline. No accessibility conformance claim; zero source-audit warnings did not establish rendered contrast.
- Assisted creation used about **578 seconds**, baseline **471 seconds**. Reported input-token use was roughly twice as high with the skill; cache categories are separate and no price estimate is inferred. One sample cannot establish general cost/quality tradeoffs.

## Fairness and deviations

The first two bootstrap attempts stopped before implementation because native Windows quoted command matching did not accept a literal WSL prefix. A scoped regex-matcher probe ran that same read-only action successfully; both fresh sessions then received the same correction, without an all-permissions bypass or global settings change. Original failures remain under `evidence/<case>/bootstrap-01/`; see [bootstrap notes](bootstrap-notes.md).

No-skill a01 ran the preview helper twice and inspected four PNGs, while assisted a02 ran it once and inspected two. This exceeds the common single-preview rule for a01 and limits matched-budget interpretation. Native global customizations may affect context. Creator notes' broad verification claims are not treated as evidence of unperformed tests. Final source and operator findings are preserved without repair.

A duplicated Back to list hook stopped the first operator trace. The final shared harness chooses the first visible equivalent action, just as it does for Clear search. The original trace is retained, and neither UI was edited; see [harness notes](harness-notes.md).

## Inspect the evidence

```bash
cd /path/to/TasteForge/evals/runs/2026-11-01-antigravity-inventory
python3 -m http.server 8768 --bind 127.0.0.1
# Open http://127.0.0.1:8768/
```

- [Protocol](protocol.md), [manifest](manifest.json), [ratings CSV](reviews/ratings.csv), [independent review r1](reviews/reviewer-r1.json), [r2](reviews/reviewer-r2.json).
- `cases/a01/`: raw no-skill UI, task/fixture, notes and final self-preview images.
- `cases/a02/`: raw skill-assisted UI, plan, notes and actual CLI/source-audit artifacts.
- `treatment/`: frozen skill and reference catalog; hashes in the manifest. Imported style documents remain reference data, not validated token profiles.
- `evidence/<case>/`: generation JSON/events/stderr, actual final browser traces and screenshots, bootstrap failures.
- `evidence/availability/`: actual version/model listing, READY inference and successful scoped command-rule check. No credential files were read/copied or account/model fallback used.
- `reviews/packet/`: anonymous monochrome/authored screenshots, with their hashes. Monochrome preserves transparency/luminance and differs from the earlier study's neutral method; it can still reflow text.

The independent browser tools reuse Playwright 1.64.1, axe 4.14.0 and Chromium 156.0.8078.4. `node tools/check-gallery.mjs` checks twenty paired-viewer states; `node tools/verify.mjs` verifies frozen artifacts, inputs, actual traces and unmodified reviews. Reproduction scripts exist, but future generations/captures should use a new run folder rather than overwriting this evidence.

This is one pair, one task and one requested model. No replicated comparison, representative users, exact backend/inference seed, complete zoom/screen-reader study, host ranking or universal UX improvement claim. The result is a useful local signal, not proof that adding more style references solves AI slop.
