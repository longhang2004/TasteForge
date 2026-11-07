# Independent review — reviewer 2

Run: `2026-11-07-quality-identity-thesis-pilot`
Started 2026-11-07T17:35:33Z · finished 2026-11-07T18:12:09Z · I authored none of these outputs.

## What I inspected, and what I could not

**Read:** `reviewer-instructions.md`, `review-packet/index.json`, `freight/task.md`, `archive/task.md`, and for both families both variants — `index.html` (inline CSS + JS; freight A 876 lines, freight B 1600, archive A 728, archive B 857), `checks.json` (freight 22 checks × 3 widths = 66; archive 12 × 3 = 36), and the PNG renders.

**Image access: yes.** I can see the PNGs and looked at roughly 30 of the 78, covering every state type at 320/390/1440 plus both 1440 full-page captures. Type, colour, spacing and composition judgments below are readings of those renders. I also checked IHDR dimensions for all 78 files.

**Not inspected, by rule:** `review-key.json`, `cells/`, `evidence/`, `manifest.json`, `protocol.md`, `operator.md`, `report.md`, `acceptance.json`, `resources/`, `tools/`, `docs/`, `examples/`, and the earlier forward-test run. I did not run either page in a browser, installed nothing, and touched no file except these two outputs. So **behaviour, focus, scroll, overflow and axe results are quoted from `checks.json`; I did not independently reproduce them.**

**Gaps that limit the evidence itself:**
- The freight **success screen is not in the packet in either variant.** `freight/A/1440-success.png` and `320-success.png` show the in-flight "Submitting…" state with the primary button disabled; `freight/B/*-success.png` still show the failure alert (and `checks.json` records the success-state focus as `BUTTON#retry-button`). Success honesty was judged from source text and assertions only.
- Every freight and archive state carries unresolved axe **`color-contrast` `incomplete`** nodes. I report these as open questions; they are **not** passes and I make no contrast or accessibility-conformance claim.
- Neither page emits page errors, and no source references any external URL, font, image or dependency (grep for `http`, `@import`, `url(`, `<img`, `fetch(`, `@font-face` across the packet returned 0 matches).

No aggregate score, no total, no uniqueness or slop metric. Two sets, kept separate.

---

## Freight — Harbor Cold Chain consignment release

### Task quality

| Dimension | Verdict | One-line reason |
|---|---|---|
| `firstActionSalience` | **A** | A's whole task fits in a 1152 px full-page capture with the picker inside the first 320 px viewport; B's 320 entry spends ~780 px of an 1844 px page on intro and the "Release rule" card before the roster appears. |
| `decisionContextRetention` | **tie** | Both keep consignment, weight, dock, excursion summary and note on review, and both re-focus the retained choice on Edit (A → `INPUT#d-hold`, B → `H2#detail-title`); A holds facts still during failure, B displaces them but says "unchanged". |
| `errorAndRecoveryClarity` | **B** | B disables Release and states the reason inline, uses a focused error summary with jump links, and adds a simulated reference (SIM-503), escalation advice and a verified focus move to `H3#submit-error-title`; A's better-worded failure leaves focus on BODY because it calls `.focus()` on a `<p>` with no `tabindex`. |
| `responsiveAccess` | **A** | A's readings stay real text rows at 320; B's SVG trace shrinks its own 640-unit labels toward illegibility in `320-edit` and B hides the "Against limit" column below 560 px. Both record `horizontalOverflow: 0`. |
| `semanticControlAndFocus` | **B** | B has a real focus target in six of seven states plus `aria-describedby` on Release, `aria-busy` and a live region; A's mark-up is sound but its one intended focus move is a no-op, leaving BODY focused in failure and success. |

### Product specificity

| Dimension | Verdict | One-line reason |
|---|---|---|
| `contentToThesis` | **tie** | A is an ice/amber cold-store console with a dashed declared-limit band; B is a dock paperwork sheet with serif headings, monospace metadata and a standing rule card — both theses follow the declared-limit fixture. |
| `suppliedArtifactsShapeComposition` | **B** | B renders readings against the limit twice (trace + per-row deltas like "+0.6 °C above limit") and ties the disabled Release to the excursion; A states the delta once, in the verdict. |
| `coherentMediaTypeDirection` | **A** | A's palette and legend hold one meaning per colour; B reuses the failure red (`--danger #8a2317`) as the declared-limit line inside a figure where excursion is amber. |
| `honestEvidenceLimits` | **B** | B discloses pre-emptively that the first submit is staged and enumerates non-effects on success ("no consignment moved, no dock was notified…"); A states the limits in three places but never says the failure is simulated. |

**Strongest observation, A:** the evidence surface is genuinely built from the fixture — a dashed declared-limit band, one dot per reading, and a blocked state that names the reading, value, limit and margin before telling you to switch to Hold. Its failure sentence ("the dock link timed out before the record was written. Nothing was recorded, and your decision and note are unchanged") is the clearest line in either variant.

**Strongest observation, B:** the control architecture is the best in the run — disabled Release with an inline reason and `aria-describedby`, a focused error summary, `aria-busy`, a live region, a visible "Step 2 of 2", and recovery copy with an error reference and an escalation path.

**Tradeoffs:** A opens with HC-114 already selected, so nothing is chosen by the operator. B's two-panel workbench costs vertical space and pushes the first action below the fold at 320. A's `320` picker wraps "42.5 kg · Dock B" onto a broken third line, and its no-excursion copy reads "limit of at or below 2.0 °C". B splits "Review decision" from "Submit decision", so its first primary button does not submit.

---

## Archive — Lantern Slide Lecture Archive

### Task quality

| Dimension | Verdict | One-line reason |
|---|---|---|
| `firstActionSalience` | **A** | A's open affordance is a visible underlined title button in every row at every width; B hides its only row-level cue (`.chev { display:none }` until 1000 px), so nothing at 320/390 says the rows are openable. |
| `decisionContextRetention` | **tie** | Both pass "returning retains query, filter, order and focus" and both restore focus to the opener; A adds LS-02↔LS-19 cross-links, B adds exact scroll restoration and "Record 2 of 2 in current results". |
| `errorAndRecoveryClarity` | **A** | No failure state exists in this family, so this is the empty state only: A names the query and the series and states the recovery outcome ("restores all 5 records") with two reset buttons; B advises "Try a shorter term or clear the series filter" with one. |
| `responsiveAccess` | **B** | B keeps the long title unbroken at 320 where A hyphenates it mid-word ("re- / vised plate"), and A's 320/390 detail capture never reaches the record (focus rect y=889 at 320, y=778 at 390). |
| `semanticControlAndFocus` | **B** | B's whole row is one button (130 px tall at 1440), with `figure/figcaption`, `<article>`, `<aside aria-labelledby>` and a labelled plate; A's opener is a 25 px-high title button inside `<h3>` and its duplicate banner is a plain div. |

### Product specificity

| Dimension | Verdict | One-line reason |
|---|---|---|
| `contentToThesis` | **A** | A's thesis is the evidence limits themselves — h1 "Teaching slides, read as records before images" plus a leading "What this catalogue does not claim" block; B leads with the collection name and compresses the same limits into one Scope sentence. |
| `suppliedArtifactsShapeComposition` | **A** | A carries condition notes and duplicate linkage into the list ("CONDITION Emulsion lifting at one corner…", "HELD WITH DUPLICATE LS-19") so they are comparable before opening; B drops condition to the detail and shows only medium, date and plate size in its columns. |
| `coherentMediaTypeDirection` | **tie** | Both hold one printed-catalogue direction — serif display, sans text, monospace labels on warm paper, schematics in the same ink-and-accent stroke language. Nothing separates them. |
| `honestEvidenceLimits` | **A** | A states the placeholder limits at four levels (scope list, per-thumb "SCHEMATIC" caption, a dedicated "About the image on this page" block, footer) and B labels no plate in the list view; A does over-reach once by asserting "The catalogue holds two plates under the same figure", which is not a supplied fact. |

**Strongest observation, A:** identity built from honesty rather than decoration — the h1 thesis, the four-item "does not claim" list, series-derived abstract plate patterns that cannot be misread as a depiction, and list-level condition and duplicate status with navigable LS-02↔LS-19 links.

**Strongest observation, B:** the strongest comparison surface in the pack — the row becomes a genuine multi-column catalogue record at 1000 px, thumbnails are drawn to each record's own catalogue dimensions (with that stated as a legend), series are encoded as hue plus count, and the detail has a proper figure, a duplicate aside and a "What this record does not establish" panel.

**Tradeoffs:** A keeps the full masthead and scope block above a record, so opening or returning changes nothing in the first mobile viewport, and it hyphenates a proper title mid-word at 320. B's disclosure is thinner at the list level and its representational schematics come closer to reading as depictions, though each `figcaption` disclaims that.

---

## Where I was unsure

1. **`decisionContextRetention` (freight).** A keeps the facts physically unmoved during the failure; B says "unchanged, so you can retry without re-entering anything" while a large alert pushes them down. I read these as equivalent but could not test either as a user, so `tie` is a judgement, not a measurement.
2. **`errorAndRecoveryClarity` (archive).** This family has no failure, error or decision state, so I scored the empty state. The margin between A and B is one extra reset affordance.
3. **`firstActionSalience` (freight).** B's empty-state workbench means the operator must choose before seeing evidence, which is arguably the more faithful flow; I ruled on which action is findable first from the captures, not on which flow is better.
4. **Freight success in both variants.** Judged from source, because both "success" renders are stale (submitting/failure). If the strings in source are not what rendered, that dimension could move.
5. **Archive A's "two plates under the same figure".** Not in the fixtures. I treated it as a single over-reach inside an otherwise stronger disclosure posture rather than overturning `honestEvidenceLimits`, but a reader who weights invented provenance facts heavily could call that dimension a `tie` or even `B`.
6. **All axe `color-contrast` `incomplete`.** Freight A 55–58 unresolved nodes per state versus B 11–22; archive A 58 down to 13, B exactly one (none in its `detail-duplicate` state). Unresolved, not passed — I make no contrast claim either way.
