# Findings: current-beta automated trials

**There are local gains in information grouping and decision context, many ties, and remaining layout/content defects.** This run does not establish reliable removal of generic composition. Read the [viewer](index.html), [analysis](analysis.json), [raw browser results](results.json) and [individual ratings](reviews/ratings.csv) together.

## Scope and controls

Twelve fresh UIs form six pairs: GPT-6.1 Sol, GPT-6 Luna and native Antigravity/Gemini 3.8 Flash Medium, each creating a fictional transfer flow and a ceramic-product checkout without/with the frozen current skill. Each cell has one generation. The 20-file skill and catalog are frozen from beta commit449c90b; both conditions receive identical tasks, fixtures, starter, local SVG and offline CLI/catalog availability. Only assisted creators read the skill. TasteForge seed42 controls reference selection, not model inference.

Creators receive one implementation, one common wide/narrow preview and one review revision under a soft twelve-minute target. Actual backend snapshots, sampling seeds, matched compute and subagent token/runtime totals are not exposed. No operator design feedback or repair is supplied. The final submitted sources remain unchanged.

OpenCode1.19.3 listed the requested free models. Fresh bounded calls ran **DeepSeek V4.1 Flash Free first, then GLM5.3 Flash Free**, never concurrently. Both provider logs returned `Free usage limit reached`; no UI or quality score is attributed to them. Their eight optional planned cells remain availability-blocked.

## Executed task and geometry evidence

All12 final primary-task flows completed at1440×1000,390×844 and320×740. Transfer traces exercise invalid amounts, review arithmetic, retained edits, simulated failure and retry. Product traces exercise Sand×2, shipping-inclusive total, cart feedback and unavailable Ash.

| Model / task | Without skill | Current skill | Actual remaining failure |
| --- | --- | --- | --- |
| Sol / transfer |63/63|63/63|None in these scripted checks|
| Sol / product |30/30|27/30|Assisted c04:339px document at320px, initial/review/cart|
| Luna / transfer |63/63|63/63|None in these scripted checks|
| Luna / product |30/30|30/30|None in these scripted checks|
| AGY/Gemini / transfer |63/63|63/63|None in these scripted checks|
| AGY/Gemini / product |27/30|30/30|Baseline c11:349px document at320px, initial/review/cart|

The table includes18 supporting diagnostic assertions. Overall552/558 recorded assertions passed; excluding those diagnostics,534/540 passed. The six failures describe **two overflow defects**, each observed in three states. Repeated checks and widths are not independent samples, an accessibility certificate or a UX score. The read-only [c04 geometry diagnostic](evidence/diagnostics/c04-320-overflow.json) records affected regions; no raw UI was repaired.

Initial and later axe scans report contrast violations in all6 baselines and3/6 assisted outputs. c02,c04,c12 have no reported violating rule in captured scans; incomplete findings remain. Absence of reported violations does not establish conformance. Static source-audit results from creator notes are not substituted for rendered checks.

Separately, Node24.22.0 passed repository build/typecheck/lint/format and44 tests. Re-executed maintained inventory/effects/gallery checks passed77/95/108. The final comparison viewer passed171 states at three widths. These artifact-specific check sets are kept separate under [regressions](evidence/regressions/) and [viewer checks](evidence/viewer-checks/).

## Independent screenshot judgments

Reviewers freeze neutral-first notes before viewing authored renders. Batch A has r1/r2; batch B has r1 and fresh Sol reviewer r3 after usage/capacity interruptions. Complete JSON artifacts and inspected-image lists are retained even when a final host envelope failed. There are two reviews per UI,72 packet images total and144 image inspections across reviewers; no host/model ranking is inferred from different panels.

Counts below describe12 possible paired judgments per dimension:6 pairs×2 reviewers. They are **not** six independent replicated effects, and dimensions are never combined into a total.

| Dimension | Assisted higher | Tie | Assisted lower | Unassessed |
| --- | ---: | ---: | ---: | ---: |
| Entry priority |4|8|0|0|
| Information grouping |6|6|0|0|
| Decision context |4|8|0|0|
| Narrow context |4|7|1|0|
| Recovery evidence |1|1|0|10|
| Composition purpose |5|7|0|0|

Grouping gains are local; conventional form/ledger/product rails still dominate. Reviewers disagree on the Luna-product narrow result: one ties, the other prefers baseline. Across jointly assessed case/dimension cells,28/62 numeric ratings differ; two additional cells differ on whether evidence supports a rating at all. Initial notes, all scores, nulls and disagreements are preserved rather than resolved into a preferred conclusion.

Every state capture explicitly resets scroll to the top. A viewport PNG is a **top-of-page clip**, not a natural post-click focus/scroll landing. Several cart/failure clips omit offscreen feedback, so screenshot recovery is often unassessed. Actual task execution is recorded separately. Neutral font replacement can reflow; grayscale preserves transparency/luminance and is diagnostic. These limitations prevent inferring real-user comprehension or recovery ease.

## Content fidelity and workflow adoption

Both AGY transfer outputs use guaranteed-rate/payout wording not established by the illustrative fixture. Both reviewers flag this. AGY baseline product c11 adds wheel-thrown construction, mineral-glaze/strainer detail absent from the provided facts. Such unsupported copy weakens authenticity despite plausible styling and passing task paths; simulation disclosures do not substantiate those claims.

Skill use is instruction exposure, not certified execution of every workflow. Notes describe prose alternatives but do not establish consistent creation/comparison of two runnable structures. Preview is bounded to1440/390; independent320 traces catch defects the creator preview missed. Several assisted cases correctly retain Vietnamese/system-font requirements when the generator has no compatible candidate, using explicit manual tokens rather than fabricated DNA.

c06 records an `inspire` attempt without the required project brief. c08 initially claims successful empty output, then clarifies that exit/session/stderr were not captured: completion is unknown. [The clarification](evidence/c08/creator-clarification.txt) remains separate from frozen notes. No CLI engine success/empty-output defect is established by that attempt.

## Native AGY resources

| Task | Baseline seconds | Assisted seconds | Local duration difference |
| --- | ---: | ---: | ---: |
| Transfer |440.136|509.949|+15.9%|
| Product |436.758|631.493|+44.6%|

Generation records retain actual input/output/thinking/cache categories. Transfer reported input265,241 assisted versus140,960 baseline; product259,011 versus252,151. Cache-read totals are separate, not added as a price estimate. Two pairs under shared-machine/native-host conditions do not establish general overhead, billed cost or matched compute. Subagent timing/token totals are unknown.

## Follow-up and inference limits

Use fresh forward-tests for minimum-supported-width/state-specific layout gates, clearer optional CLI setup/completed-process evidence, and copy grounded in supplied product/transaction facts. Keep this run's raw sources and ratings immutable; a repaired worked example must be explicitly separate.

One generation per cell, AI reviewers, differing panels, soft budgets, offline references and screenshot scope limit inference. Human usability and manual assistive-technology tests were deferred at the user's request, never marked passed. This is useful local evidence, not proof that a larger style pool or the current skill reliably removes AI slop.

See [protocol](protocol.md), [manifest](manifest.json), [harness corrections](harness-notes.md), [scope/panel clarification](reviews/capture-scope-clarification.md), [source selection](evidence/selection.json) and [analysis derivation](tools/analyze-results.py).
