# Reviewer 1 — independent review

Run: `2026-11-07-quality-identity-thesis-pilot`
Started: 2026-11-07T17:35:33Z · Finished: 2026-11-07T18:20:00Z
I authored none of the outputs under review.

## What I inspected

Read in full: `reviewer-instructions.md`, `review-packet/index.json`, `freight/task.md`, `archive/task.md`, all four `index.html` sources (freight A 875 lines, freight B 1599, archive A 727, archive B 856) and all four `checks.json` — freight A and B each 66 assertions across three width traces of seven states; archive A and B each 36 assertions across three width traces of six states. No failures, no `pageErrors`, no external requests recorded in any of the four.

I viewed the PNG renders directly; image input works in this session. Freight: entry, blocked-excursion, note-too-short, review, edit, submit-failure and success at 320, 390 and 1440 for both variants, plus both 1440 full-page entries. Archive: entry, filter-field-surveys, search-weir, empty, detail-duplicate and return at 320, 390 and 1440 for both, plus both full-page entries. I also parsed every PNG header to confirm real dimensions and non-blank content (8-bit RGB; 320×740, 390×844, 1440×1000; full-page 1440×1152 / 1052 / 1770 / 1502).

**Not opened:** `review-key.json`, `cells/`, `evidence/`, `manifest.json`, `protocol.md`, `operator.md`, `report.md`, `acceptance.json`, `resources/`, `tools/`, `docs/`, `examples/`, `hashes.json`, and the 2026-11-02 run. A/B assignment remains unknown to me and I did not try to infer it. I ran neither page in a browser, installed nothing, and used no keyboard or assistive technology.

**Image access: true.** Type direction, palette, composition and legibility judgments below rest on the renders, not on CSS alone. Two limits still apply. (1) *No freight success panel exists in any capture* — all six freight success PNGs show the review panel mid-flight (A reads "Submitting…"; B still shows the failure alert with a live Retry button, and checks.json records focus on `BUTTON#retry-button` there), so freight success claims are derived from source and assertions. (2) axe reported an `incomplete` color-contrast finding in every captured state except archive/B detail-duplicate; I treat those as **open questions**, never as passes, and I make no contrast, conformance or human-usability claim.

## Freight — task quality

| Dimension | Verdict | One-line reason |
|---|---|---|
| firstActionSalience | **A** | At 320 the picker with per-row weight, dock and EXCURSION / WITHIN LIMIT tags is already in the first viewport; B's 320 viewport ends at the "Release rule" card with the roster below the fold. A also pre-tags Release "BLOCKED" and keeps a persistent Evidence→Review→Recorded rail. |
| decisionContextRetention | **B** | Both keep selection, decision and note through edit and failure, but B's recorded view re-states the excursion state, declared limit and all four readings; A's recorded panel drops the excursion summary its own review step showed. |
| errorAndRecoveryClarity | **B** | B names a reference ("Simulated error: SIM-503 · release-log service unavailable · attempt 1"), says nothing was recorded, adds escalation guidance and a dedicated red Retry, and keeps the release-block reason on screen whenever an excursion exists; A shows one sentence and reveals the reason only after Release is picked. |
| responsiveAccess | **A** | B's schematic is one 640-unit viewBox compressed to ~262px at 320, so its 10.5–12.5-unit labels render at ~4–5px and are unreadable in `320-edit.png` (B also hides the "Against limit" column below 560px); A keeps every label and value as DOM text at `.83rem` and compresses only the track. B's table still carries the facts in text, so the loss is confined to the schematic. |
| semanticControlAndFocus | **B** | checks.json shows focus on `H3#submit-error-title` after the failure at all three widths in B, but on BODY in A because A calls `focus()` on a `<p class="err">` with no `tabindex`; B also disables Release with `aria-describedby` pointing at the reason and gives its error summary anchor links to fields. |

## Freight — product specificity

| Dimension | Verdict | One-line reason |
|---|---|---|
| contentToThesis | **tie** | Both encode the supplied threshold rule as the organising structure — A a dashed band boundary in an ice-cyan cold-store console with amber reserved for excursion, B a dashed limit line in a paper workbench with mono catalogue numerals — and both must carry the same disclaimer, so the evidence does not separate them. |
| suppliedArtifactsShapeComposition | **B** | B computes the trace scale from the readings' own min/max ("−2.1 to −0.4 °C"), adds a per-reading delta column ("−1.1 °C against limit", "+0.6 °C above limit"), gives a nearest-margin sentence for clear consignments, and grids product, catch date, limit and weight; A's strip encodes only the worst margin plus one prose "Highest: Reading 3…" sentence. |
| coherentMediaTypeDirection | **tie** | Each holds exactly one direction — A one sans family, tabular numerals, 14px radii, ice/amber tokens reused across picker, strip, verdict and block; B serif headings, mono numerals and labels, stroke-1.8 inline icons used consistently from roster to chart to summary grid. |
| honestEvidenceLimits | **tie** | Both name the limits at the decision point and again on the record (A "no real shipment was moved, released or held, and no food-safety determination was made"; B "no dock was notified and no regulatory or customer record was created") and both caption the schematic as schematic. B additionally pre-declares that the first submit is scripted to fail — more transparent — but neither misstates a limit. |

## Archive — task quality

| Dimension | Verdict | One-line reason |
|---|---|---|
| firstActionSalience | **tie** | Both put search and series filter directly above the count and the list, so the first useful action is equally obvious. A's always-visible "Clear search and filter" at first load is a control-state defect, counted once under semanticControlAndFocus. |
| decisionContextRetention | **tie** | Both preserve query, filter and result order and return focus to the opened record's control (checks: return focus=BUTTON; A "2 OF 5 RECORDS", B "Showing 2 of 5 records — 3 hidden by search or series"), and each adds something the other lacks — A cross-navigates the duplicate pair, B restores the captured scroll offset and shows "Record 2 of 2 in current results". |
| errorAndRecoveryClarity | **tie** | Both empty states name the failing query and the active series and offer a one-click reset that demonstrably restores all five records; they differ only in prose length, not on what happened, why, or what to do next. |
| responsiveAccess | **tie** | checks.json records horizontalOverflow 0 at all three widths for both, and the long "River weir cross-section — revised plate" title wraps without clipping in either; the difference is density (B keeps a 64–80px thumbnail beside the text at 320, A stacks it) and A's `hyphens:auto` splits "re-vised" where B does not — not reachability. |
| semanticControlAndFocus | **B** | Two source-verifiable defects in A that B avoids: `.btn{display:inline-flex}` overrides the `[hidden]` UA rule, so "Clear search and filter" is visible and operative at first load with nothing to clear (`1440-entry.png`); and `resetAll("empty")` focuses the empty block's `h3` after `renderList()` has re-hidden it — the exact hidden-subtree focus failure A's own comment documents. B declares `[hidden]{display:none !important}` and always focuses the visible search input on reset. Against B: its record buttons concatenate id, series, title and all meta into one long accessible name. |

## Archive — product specificity

| Dimension | Verdict | One-line reason |
|---|---|---|
| contentToThesis | **tie** | A enacts an epistemic thesis in page order (h1 "Teaching slides, read as records before images", a "What this catalogue does not claim" block **before** the controls, every thumbnail captioned SCHEMATIC); B enacts the plate as physical object, drawing each thumbnail and detail plate to its supplied catalogue ratio inside dark mounts. Both are specific to this product. |
| suppliedArtifactsShapeComposition | **A** | A expresses the supplied duplicate relationship from both sides — LS-02's row carries "HELD WITH DUPLICATE LS-19" and its detail offers "Open duplicate record LS-19" — while B marks only LS-19 and leaves LS-02's row unmarked, so the two-copies-under-one-figure fact shapes both rows of A's list and one row of B's. |
| coherentMediaTypeDirection | **tie** | Both build one coherent direction from the same ingredients — serif display, system sans body, mono catalogue labels, paper/ink tokens, 2px radii, hairline rules — with colour used semantically (A accent #7a4a10 / moss #3c5142; B rust #8B3A1E with distinct series colours); neither shifts vocabulary between list and detail. |
| honestEvidenceLimits | **tie** | Both state every required limit truthfully — no original plate, no full-resolution file, no rights statement, catalogue dates not confirmed attribution, schematic not the archival photograph, duplicate "not a different photograph and not a new discovery" — A in a pre-control block plus an "About the image on this page" panel, B in a scope line plus a per-record "What this record does not establish" panel and per-record artNote. |

## Strongest single observation per variant

**Freight A** — the entry composition. A picker carrying each consignment's weight, dock and excursion tag sits beside an evidence card whose declared limit ("at or below −1.0 °C"), limit-crossing strip and "BLOCKED" Release tag remain legible from 320 to 1440, so the hold-when-any-excursion rule is visible before any interaction.

**Freight B** — the evidence and failure panels. A computed-scale trace with a dashed limit line, per-reading deltas, a release-block reason that is on screen whenever an excursion exists, and a failure alert that takes focus and names an error reference.

**Archive A** — the duplicate. The hardest supplied fact is handled from both sides with an explicit reading of the catalogue's own logic ("The catalogue holds two plates under the same figure, so both records stay listed; the date is undated and the condition note is the catalogue's own"), and the plate abstraction is deliberately non-representational so it cannot be mistaken for a photograph.

**Archive B** — the list composition. Ledger rows with series colour tags, thumbnails mounted and drawn to each record's catalogue ratio, a count line that states exactly what is hidden, and a return that resumes mid-page instead of jumping to the top.

## Where I was unsure

1. **Freight decisionContextRetention** is my narrowest call. A does retain decision and note through edit and failure and its success panel satisfies the brief; the separation rests solely on the excursion summary not being carried into A's recorded view — and I could not *see* either success panel, so this rests on reading `openSuccess()` against `showSuccess()`.
2. **All freight success-state claims** are source-derived for the same reason: every freight success capture is mid-submit. I am reasonably confident the code path is as I describe, but I did not verify it rendered.
3. **Contrast, everywhere.** axe's color-contrast check was `incomplete` in every state I could look at (except archive/B detail-duplicate, which reported none). Those nodes are open questions. I make no conformance claim and no claim about how these pages read to a person using them.
4. **Focus behaviour is not behaviour I observed.** Every focus claim above is checks.json plus source, not a keyboard session; hover, pointer targets and screen-reader output are all unverified.
5. **Freight firstActionSalience** assumes the Entry capture represents what an operator meets. A pre-selects HC-114 on load, which makes its first action salient — but an operator could then record a decision for a consignment they never chose. I counted that against neither, though a different reviewer might count it against A.
6. **Freight honestEvidenceLimits** could go to B on the pre-declared scripted failure alone. I left it a tie because the dimension asks whether limits are stated truthfully, and neither variant misstates one.
7. **Archive firstActionSalience / contentToThesis** could plausibly be scored rather than tied on taste, since A's thesis is explicit in its h1 while B's lives in geometry. I found nothing in the packet that ranks one as more product-derived.
8. **Archive/B detail-duplicate reporting zero axe incomplete findings** while every other state reports one is unexplained by the packet. I did not treat it as a pass.
