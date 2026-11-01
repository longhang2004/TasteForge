# Antigravity inventory pair: observed findings

Two fresh native Antigravity CLI 1.4.12 sessions requested Gemini 3.8 Flash (Medium), effort medium, on the same inventory task and fixture. One receives the frozen TasteForge skill; the other receives no skill. This is **one host/model pair**, separate from the twelve-UI Codex study. It cannot establish general improvement, rank hosts/models, or isolate data/tool/instruction effects beyond the actual matched access here.

**The native CLI worked, and both reviewers favor the skill-assisted mobile grouping by one score point. Neither design escapes the familiar stacked list/detail/card shell.** The no-skill desktop table is more compact for cross-item comparison; the assisted design makes shortage meaning and evidence quantities more explicit. Both retain long mobile paths and repeated information. Recovery scores tie. This supports a specific local improvement, not a universal anti-slop claim.

Open the [comparison viewer](index.html), [protocol](protocol.md), [full results](results.json), [raw ratings](reviews/ratings.csv), or [bootstrap notes](bootstrap-notes.md). The README records the operator's evidence-qualified interpretation after reviewing these actual outputs.

## Actual task behavior

Contract/execution checks exclude technical diagnostics. Wide = 1440 × 1000; mobile = 390 × 844. Initial axe counts are violating **rules**, not nodes or a conformance score. The 320px column is an initial-page width measurement, not a full task/zoom study.

| Case | Condition | Wide checks | Mobile checks | Wide initial axe rules | Mobile initial axe rules | Document width at 320px |
| --- | --- | --- | --- | --- | --- | --- |
| a01 | no-skill | 19/19 | 19/19 | 0 | 0 | 320 |
| a02 | current-skill | 19/19 | 19/19 | 0 | 0 | 320 |

The scripted path filters the three shortages, recovers from no results, selects LIN-115, checks item evidence, returns with context, rejects invalid quantities, reviews/edits the decision, exercises first-save failure and retries to success. Missing hooks or an early failure remain in the trace; unvisited states are not inferred. Script success verifies those operations, not comprehension, ease, real warehouse policy or screen-reader usability. See each `evidence/<case>/browser.json` for failed checks, diagnostics, axe incomplete checks, geometry and screenshots.

## Independent task/layout judgments

Two fresh AI reviewers see anonymous sample IDs, task/fixture and actual observations, with no condition/source/plan/log/model assignment. Each inspects four monochrome and four authored screenshots per sample where available, reading monochrome before authored for that sample. This is **not** the original study's separately hash-frozen neutral/authored two-stage review; these scores are combined evidence-qualified judgments and must not be compared numerically across studies. Monochrome preserves transparency/luminance but font replacement may reflow. AI reviewers are not warehouse operators or representative users.

Scores are separate dimensions (1 blocking/seriously obscured through 5 particularly strong in inspected evidence), never an aggregate taste/slop score.

| Reviewer | Case | Condition | Entry priority | Decision context | Narrow context | Recovery | Composition purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
| r1 | a01 | no-skill | 3 | 3 | 2 | 4 | 3 |
| r2 | a01 | no-skill | 4 | 4 | 2 | 4 | 3 |
| r1 | a02 | current-skill | 4 | 4 | 3 | 4 | 3 |
| r2 | a02 | current-skill | 4 | 4 | 3 | 4 | 4 |

Current-skill minus no-skill differences, one pair only; ordinal descriptive differences, not calibrated effect sizes:

| Reviewer | Entry priority | Decision context | Narrow context | Recovery | Composition purpose |
| --- | --- | --- | --- | --- | --- |
| r1 | 1 | 1 | 1 | 0 | 0 |
| r2 | 0 | 0 | 1 | 0 | 1 |

Reviewers disagree in 3 of 10 case/dimension cells. Raw judgments are retained unchanged. They are not silently reconciled into a winner.

### a01 / r1

The table/detail pattern is appropriate for inventory comparison and earns no penalty for familiarity. Generic nested summary/disclosure panels remain, with limited adaptation of column balance to the long item name and little purposeful use of mobile vertical space.

- **entryPriority:** Desktop table puts all five items and their quantities in a compact comparable area (54px rows; LIN-115 Inspect at y289). Search/filter are adjacent above it. However SHORTAGE displays -8 while the task fixture and later summary use positive 8, adding interpretation. Mobile has a large blank gap between search and filter, and LIN-115 Inspect is originally at y1049, below the first viewport.
- **decisionContext:** Review retains the selected row and summarizes the full LIN-115 name, B-04, available 2, shortage 8, incoming 4, requested 8 pieces and no-purchase-order consequence. Reorder 10 remains in the selected row rather than in the summary, separating part of the justification. The narrow desktop detail column wraps long item and stock-status strings, while list -8 and summary 8 use inconsistent shortage presentation.
- **narrowContext:** Mobile retains list state and all named evidence without document horizontal overflow, including at 320px. But each table row becomes about 311px of single-column lines, a large blank filter region persists in the authored capture, and selected detail begins only below the card. The primary item's initial action at y1049 and review Save at y1275 show the cost despite successful scripted completion.
- **recoveryFlow:** Mobile 'Save Interrupted' and 'Save Failed (Simulated)' explicitly say LIN-115 and 8 pieces were preserved. The summary, no-order disclosure and full-width Retry/Edit/Back actions make the next action understandable. The scripted traces confirm retry success, retained quantity, valid edits and retained search/filter on return. They do not establish discoverability or keyboard ease.
- **compositionPurpose:** Desktop table efficiently aligns available/reorder/shortage/incoming across all items, a useful familiar pattern. The right review uses much less width than its wrapped content needs, while the empty instruction card and mobile one-field-per-line cards create avoidable space and travel.
- **Blockers:** ["No task-completion blocker observed. Separate accessibility findings: axe reports selected-row label/unit contrast of 4.37:1 in failure/final states; the inline Clear target is 43 by 17px with insufficient spacing for the reported 24px criterion."]
- **Unnecessary regions:** ["Large empty space between mobile search and shortage filter appears in both authored full and failure captures.", "The empty evidence panel repeats selection instructions, adds an example-SKU tip, and remains a large block after all five mobile rows.", "Two Back to list controls in the compact review panel duplicate the same exit."]
- **Monochrome caveat:** The monochrome diagnostic loses amber shortage and teal selection cues, but negative shortage tokens and selected labels remain. The blank mobile filter gap and tall cards persist in authored images, so they are supported layout observations. Desktop location wrapping appears more pronounced in monochrome; it is not treated as a separate failure.

### a01 / r2

The familiar table/detail arrangement suits the inventory task; its placeholder card, badges and bordered summary are conventional and add limited task-specific guidance beyond the stock data.

- **entryPriority:** The desktop table places all five items, quantities, filter, search and Inspect controls in one compact view. LIN-115 is directly comparable with other rows, though shortage is shown as -8 while the fixture describes a positive shortage of 8 and incoming as +4.
- **decisionContext:** The review shows selected LIN-115, location, available 2, shortage 8, incoming 4, requested 8 pieces and the no-order disclosure; reorder 10 remains visible in the adjacent selected row rather than the summary. The trace confirms editing preserves quantity and invalid quantities cannot commit.
- **narrowContext:** Mobile retains the selected list row and filter above the decision, but an unexplained large blank gap separates search and filter and each initial row occupies about 312px. The LIN-115 Inspect control begins at y=1049.5 and review Save at y=1275, both below the first viewport. At 320px recorded scroll width equals viewport width.
- **recoveryFlow:** The mobile failure explicitly says the simulated save failed and the entered 8 pieces were preserved; the summary, Retry, Edit and Back actions are present. The scripted retry succeeds, but the long preceding list and summary mean success of the path is not evidence of low effort.
- **compositionPurpose:** The compact desktop table and adjacent decision panel directly support comparison and inspection. On mobile, the blank search/filter region and individually separated metric lines consume space without adding information, and the empty detail panel repeats selection instructions.
- **Blockers:** []
- **Unnecessary regions:** ["Large blank vertical area between mobile search and shortage filter.", "Empty detail panel's tip repeats the instruction to inspect an item; mobile metric lines and separators are disproportionately tall."]
- **Monochrome caveat:** Font replacement can change wrapping and radius/shadows are removed; the mobile gap, long row stack and recovery placement also appear in the authored captures.

### a02 / r1

Conventional bordered list/detail panels and nested metric cards remain. The split itself is task-fit; the less purposeful part is duplicating inventory evidence across the selected row, detail header, evidence grid and review rather than using the space to shorten the decision path.

- **entryPriority:** Search and shortage-only control directly precede the inventory. SKU, location and explicit '8 pieces shortage' make LIN-115 distinguishable without selection; desktop Inspect is at y454. The large disclosure and heading delay mobile inventory, but LIN-115 Inspect remains in the original first viewport at y731.
- **decisionContext:** Desktop review keeps the selected row beside the full item name and six explicitly labeled evidence cells: available 2, reorder 10, shortage 8, incoming 4, B-04 and pieces. Requested 8 pieces and the no-purchase-order notice immediately precede Edit quantity and Save decision. Repeated item/shortage/location information consumes space without adding relationships.
- **narrowContext:** Mobile preserves search, filter and the selected inventory card above detail, and the full long name wraps rather than disappearing. Two-column metrics remain readable. However the repeated stock evidence and long header put original review actions at y1754, requiring substantial travel between retained list and decision. 320px geometry reports no horizontal overflow, which does not remove this scrolling burden.
- **recoveryFlow:** The mobile failure visibly names a simulated save error, retains LIN-115 and pending 8 pieces, and places Retry decision beside Edit quantity. Error is below the full stock evidence, so it is not immediate on entering the stacked detail. Scripted traces on both viewports confirm invalid values rejected, edit retains quantity, failure retains state, retry records the simulation, and return retains search/filter; these passes establish behavior rather than ease.
- **compositionPurpose:** The familiar list/detail split supports comparing the selected evidence and review on desktop. Shortage labels use words and quantities, not only color. Yet the large empty-state instruction panel, nested metric cards and repeated selected-item badges make a five-item task unnecessarily tall, especially when stacked on mobile.
- **Blockers:** ["No task-completion blocker observed. Separate accessibility finding: axe reports 4.35:1 contrast for current-shortage label/unit in failure and final states on both viewports, below its 4.5:1 threshold."]
- **Unnecessary regions:** ["The empty detail panel repeats selection instructions and simulation disclosure already present above.", "A dedicated inventory-unit tile and repeated location/shortage badges add vertical space when units and location already appear alongside values."]
- **Monochrome caveat:** Monochrome removes colored shortage/selected-state cues but retains textual labels and borders. Long-name wrapping and the mobile inventory-count/filter wrap also occur in authored images, so those are not inferred solely from font replacement. Geometry judgments use the original packet values, not transformed image measurements.

### a02 / r2

A conventional list/detail workspace is appropriate to this task; the large empty instructional panel and nested metric cards remain generic dashboard composition rather than additional operational context.

- **entryPriority:** Search and shortage filter precede the inventory, with explicit shortage quantities and Inspect actions on each row. LIN-115 is the second row and its 2 available, 10 reorder, 8 short and 4 incoming are visible together; the tall repeated rows make scanning the full set slower than a compact table.
- **decisionContext:** The desktop review keeps the filtered selected row beside a detail panel containing all five requested facts, selected item, 8 pieces and a prominent no-purchase-order notice. The row and evidence panel repeat much of the same information, but the relationship to the decision remains clear.
- **narrowContext:** The mobile failure capture retains the search, active filter, selected row and detailed evidence above the error; the two-column metrics remain readable. This continuity costs substantial scrolling: the recorded mobile review save is at y=1754, below the first viewport, and the long name wraps tightly beside Back to list. At 320px there is no recorded document overflow.
- **recoveryFlow:** The failure visibly names a simulated save error, retains LIN-115 and 8 pieces, and provides Retry decision and Edit quantity. The trace records successful retry and retained edit quantity; it does not establish how easily a person finds the actions after scrolling.
- **compositionPurpose:** The list/detail arrangement supports finding and inspecting stock, and the operator guide explains that incoming does not erase the shortage. The persistent snapshot notice and repeated stock evidence take considerable space, especially on mobile.
- **Blockers:** []
- **Unnecessary regions:** ["The empty detail panel's lengthy introduction and repeated simulation explanation occupy substantial space; the incoming-stock explanation is useful.", "The selected row and detail panel repeat all four metrics, extending the mobile path to recovery actions."]
- **Monochrome caveat:** Font replacement can reflow the long name and the transformation removes radius and shadows; the tight mobile name wrapping and lengthy stack are also visible in the authored capture.


## Actual generation/resource context

Fresh creation sessions after the uniformly corrected bootstrap rule. CLI-reported token categories are reproduced as supplied, with no pricing or cross-host token equivalence assumed. Initial blocked bootstrap/probe usage is separate in its original envelopes, not hidden in creation totals. Duration is operator wall time, not measured user task time.

| Case | Creation seconds | Input tokens | Output tokens | Thinking tokens | Cache read tokens | Command tool steps |
| --- | --- | --- | --- | --- | --- | --- |
| a01 | 471.1 | 159282 | 61412 | 29877 | 686293 | 5 |
| a02 | 577.9 | 325979 | 65447 | 23719 | 1331379 | 11 |

All actual native command calls, tool errors, model initialization and terminal envelopes remain under `evidence/<case>/`. Task/fixture, prompt, settings, skill/catalog and runtime hashes are recorded. Identical tool access does not mean identical tool use. Both groups had the same preview helper, but actual inspection/deviations must be read from traces and creator notes.

The assisted creation took about 578 seconds versus 471 seconds for no skill (about 23% longer in this single sample), and the CLI reports roughly twice the input tokens, with cached input reported separately. These values are actual observations, not a general overhead estimate or a billing calculation. The baseline invoked the preview helper **twice** and read four PNGs, exceeding the specified one invocation; the assisted case invoked it once and read two PNGs. Both have one self-review iteration, but actual render access/use was not matched. The helper overwrote the baseline's first preview files; the submitted final self-previews and operator captures are retained.

Both creator notes claim no unverified requirements. Treat those as overbroad self-reports: their traces establish initial-image inspection and, for the assisted case, source auditing, not the complete interaction/accessibility checks. Actual task evidence comes from the separate operator harness. Its later-state contrast/target findings remain unresolved even though the assisted static audit reported zero errors/warnings.

## Operational deviations and limits

- The first sessions soft-denied the same WSL directory-listing command before creating UIs. They returned a misleading zero/SUCCESS envelope with empty response and denied actions. Both are preserved under `bootstrap-01`; neither is presented as a completed UI. A scoped read-only regex-matcher probe established the Windows literal-prefix cause, followed by fresh sessions with the same matching correction. No global permission change, shell substitution, all-permissions bypass, account switch or key extraction.
- One model, task and generation per condition; soft budget and model stochasticity; no controlled inference seed or exposed backend snapshot. Existing global Antigravity customizations may affect context; no claim of a fully isolated host system prompt.
- Offline static UI, fictional stock snapshot and simulated local decision recording; no real ordering/inventory service or actual data freshness guarantee. Upstream reference material is untrusted, and imported styles do not certify font coverage/contrast/layout fit.
- Final sources are preserved without operator repair. Chromium checks are actual, but only named states/actions are exercised. 320px is supporting initial evidence; zoom, complete screen-reader use, real-user comprehension and time are unassessed.
- Monochrome is a diagnostic, not an exact neutral wireframe. Transparent overlays remain transparent to avoid the previous study's known white-overlay defect. Do not infer improvement merely from styling, a shorter page, passing scripts, or different sampling IDs.

This pair can expose concrete useful relationships and regressions. Reliable claims require repeated creation samples and users completing the task, checking consequences, correcting mistakes and recovering at narrow widths.
