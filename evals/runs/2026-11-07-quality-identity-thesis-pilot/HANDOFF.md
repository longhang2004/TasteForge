# Run record: 2026-11-07 quality / content-thesis pilot

Status: **complete and accepted for this scope**. Everything below was verified
against the files in this directory, not carried over from a plan.

## What this run is

A two-prompt, four-output matched pilot. One candidate increment (an on-demand
"choose a direction the content can carry" step in
`skills/tasteforge/references/art-direction.md`) against the lean baseline
`4c24a59`, on two new fictional products: Harbor Cold Chain (freight) and the
Lantern Slide Lecture Archive (archive).

Read in this order: [protocol.md](protocol.md) (predeclaration),
[report.md](report.md) (outcome), [acceptance.json](acceptance.json) (what was
checked and on which exact bytes), [resources.json](resources.json) (observed
segments, not savings).

## Final state

| Item | State |
| --- | --- |
| Cells | 4 of 4 present: `freight-R1`, `freight-R2`, `archive-R1`, `archive-R2` |
| Availability loss | none; every cell has `versions/00.html` plus a submitted `index.html` |
| Creator corrections | 1 disclosed self-correction pass per cell |
| Operator UI corrections | 0; no creator output was restyled |
| Acceptance | 204 assertions over 78 natural-viewport states, 320/390/1440 |
| axe | 0 violations everywhere; `incomplete` retained and left open |
| Page errors / external requests | 0 / 0 |
| Reviews | 2 independent reviewers, judgments frozen before unblinding |
| Repo checks | `pnpm check` 44/44 tests, `pnpm pack:smoke` passed, prettier clean |

## Evidence map

- `cells/<cell>/initial/versions/00.html` — first runnable source, preserved byte for byte before any test.
- `cells/<cell>/initial/index.html` — the submitted result.
- `cells/<cell>/initial/creator-record.json` — loaded skill paths, rationale, real failures, null telemetry.
- `cells/<cell>/initial/checks/` — each creator's own raw check output and screenshots.
- `evidence/<cell>/initial-01/` — root acceptance pass that the reviewers inspected.
- `evidence/<cell>/initial-02/` — corrected capture pass for the freight cells only (see below).
- `evidence/post-review-verification.json` — lead's verification of defects the reviewers reported.
- `review-packet/` — the randomized 93-file packet handed to reviewers.
- `reviews/` — the two reviewers' files plus `freeze.json` hashes.
- `review-key.json` — the A/B mapping, opened only after the freeze.

## Known limitations, stated rather than hidden

1. **Freight success capture was initially mid-transition.** Both reviewers caught it
   independently. The success screenshot showed "Submitting…" or a stale failure alert
   instead of the recorded state. Fixed and re-run into `initial-02`; the reviewed
   `initial-01` is preserved untouched, and assertion counts, sources and axe results
   are identical between the two passes.
2. **Every creator overran the budget.** Soft 8 minutes, hard 15; observed 23.6, 24.4,
   15.7 and 14.1 minutes. Reported as overruns, not trimmed, and never treated as
   evidence of quality.
3. **Provider telemetry is unknown.** Tokens, cache, thinking, billed money and tool
   call counts are `null` because they were never exposed. Word counts here are words
   read from skill files, not tokens, and imply no saving.
4. **`archive-R2`'s creator record uses a different schema**, so its
   `loaded_skill_paths` are unavailable and its loaded-word proxy is 0. Not guessed.
5. **Axe contrast stayed `incomplete`** in nearly every state; nobody claims contrast
   or accessibility conformance.
6. **No human testing.** No manual usability, screen-reader, real-device, non-Chromium
   or forced-colors evidence. Visual claims come only from the two reviewers, who both
   confirmed working image access.

## Outcome in one line

The increment was **not** shown to improve content-to-thesis on the dimension it was
added to test; the separations both reviewers agree on lie elsewhere (artifact-shaped
composition, focus architecture, and a reset control visible when nothing is filtered).
The pair is mixed and inconclusive, and no aggregate score exists by design.
