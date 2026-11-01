# Reference-led follow-up: observations, not an improvement claim

One fresh gpt-6.1-sol creator used the revised skill on the same fictional transfer task and fixture as original assisted case c02. The resulting UI has an explicit task plan and a different information arrangement. **This does not establish better UX or removal of generic AI composition.** The creator's raw submission is preserved, including its defects and incomplete artifacts.

Open the [comparison viewer](index.html), [new task plan](cases/r01/UX_PLAN.md), [browser evidence](evidence/r01/browser.json), or [machine-readable comparison](results.json). Original c02 remains in the [pilot](../2026-11-01-ui-pilot/README.md); its sources, frozen instructions, evidence and ratings were not rewritten.

## What changed structurally

| Relationship | Original assisted c02 | Revised-skill r01 |
| --- | --- | --- |
| First working region | Large introductory headline and progress above a form | Simulation notice and progress above a task-specific form heading |
| Quote while editing | A separate summary beside the form on desktop, following it on mobile | A cost ledger directly after the amount field and before the review action |
| Review | Summary beside a review panel; a general Edit details action | A dedicated receipt view with contextual recipient/amount edits |
| Narrow screen | Desktop regions stack; the quote follows the entry panel | One reading order for input, fee, total, amount received, then action |
| Planning evidence | Original visual guidance and submission notes | Three structural alternatives, selected task rationale, state/recovery map, reference observations |

These are source/render observations, not reviewer scores. A single-column form is conventional too. Both versions already require a review before confirmation and preserve details through a simulated failure; the new run did not invent those behaviors.

## Actual task and accessibility checks

| Observed checks | Original c02 | Follow-up r01 |
| --- | --- | --- |
| Wide viewport, 1440 × 1000 | 16 / 16 passed | 16 / 16 passed |
| Narrow viewport, 390 × 844 | 16 / 16 passed | 16 / 16 passed |
| axe rule violations: initial / failure / success | 0 / 0 / 0 at both widths | 0 / 0 / 0 at both widths |
| Uncaught JS errors / external requests | None observed | None observed |

The harness checks amount bounds, recalculated amounts/fee/total, the full Vietnamese recipient, edit/data retention, recoverable first failure, retry success, simulation disclosure and document overflow. It does not measure user comprehension, confidence, task time, screen-reader usability or layout quality. Passing the same checks provides regression evidence, not a measured UX gain.

**Manual review remains necessary.** Both versions have axe contrast checks marked incomplete for non-text symbols. The new initial state additionally has an incomplete `aria-prohibited-attr` check: a generic quote `div` has an `aria-label` without an appropriate role. In the captured Linux environment, the new disclosure's decorative ⓘ appears as a missing-glyph box. The Vietnamese recipient is visibly rendered, but this is not a font-coverage certification. No accessibility conformance claim is made.

## First viewport: a remaining layout cost

Initial unscrolled control top positions, in CSS pixels, are measured in [fold-observations.json](evidence/fold-observations.json). “Fully visible” includes the complete button box. Lower values alone do not establish an easier task.

| Case | Viewport | Recipient y | Amount y | Review action y | Review action fully visible |
| --- | --- | --- | --- | --- | --- |
| original-c02 | 1440 × 1000 | 580 | 719 | 928 | Yes |
| followup-r01 | 1440 × 1000 | 425 | 555 | 883 | Yes |
| original-c02 | 390 × 844 | 559 | 699 | 907 | No |
| followup-r01 | 390 × 844 | 408 | 556 | 892 | No |

The recipient input starts earlier in the new mobile page, while the review action remains below the initial 844px viewport in both versions. The revised card still uses considerable vertical space. There is no evidence here that the new layout eliminates the user's “AI slop” concern. No corrective edits were made after capture.

## What reference research actually happened

The creator inspected the VoltAgent collection index and the official GOV.UK check-answers/confirmation documentation with inline HTML. The attempted pinned Wise DESIGN.md and its raw URL both failed with cache misses; **the exact Wise document was not read**. No external product was rendered, and no upstream code, assets or brand tokens were copied. The selected review/receipt relationship is a design inference from the inspected task patterns. URLs, dates, licensing scope, adaptations and rejected alternatives are in the submitted [UX_PLAN.md](cases/r01/UX_PLAN.md).

This demonstrates the provenance/failure-reporting workflow as much as the UI output. The hand-authored [worked plans](../../../examples/ux-plans/transfer.md) were not supplied as the creator's answer.

## CLI limitation preserved

CLI 0.1.0 found no compatible direction for the required Vietnamese language plus system-font delivery. The creator kept both constraints and used a documented manual visual treatment. Only `brief.json` and `config.json` were retained under `.tasteforge`; **no generated DNA or CSS tokens exist in r01**. The submitted `suggestions.json` is zero bytes, not valid JSON. The operator separately reproduced the failed suggestion in [cli-suggestion-check.json](evidence/cli-suggestion-check.json), without altering the submission. This coverage gap remains unresolved in the current visual catalog.

## Method and limits

- One new generation using the same requested model name, task, fixture, bare starter and hooks as c02; no old outputs or design feedback supplied to the creator.
- The revised skill snapshot is frozen separately with hashes. Research was newly permitted, and tool/time context differs. The original sample was reused, not generated concurrently with a matched budget.
- CLI seed 42 is not a model generation seed. Exact backend snapshot, inference seed, token usage and equal compute were not controlled.
- Actual Chromium captures use the original pinned harness/settings: light theme, reduced motion, en-US locale, Asia/Ho_Chi_Minh timezone, device scale 1. Browser evidence includes initial/full, keyboard-focus, review, failure and success captures at both widths.
- No new independent ratings, human testing, neutral-wireframe study, replicated comparison or causal improvement estimate. Earlier pilot ratings remain exactly as recorded.

For a stronger evaluation, repeat baseline, frozen-original-skill and revised-skill conditions with equivalent reference/rendering access and budgets, then assess neutral structure and actual tasks independently before revealing visual treatment. The [methodology](../../README.md#evaluating-structure-and-reference-use) describes this next study; it is not claimed as completed.
