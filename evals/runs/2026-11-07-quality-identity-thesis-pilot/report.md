# Product-specificity pilot - content thesis (2026-11-07)

**Two prompts, four fresh outputs, two independent AI reviews.** One candidate
refinement was tested against the lean baseline: an on-demand step that turns
supplied product content into a visual thesis. Both conditions cleared the same
automated acceptance; any difference is in the judgments below.

This is a bounded pilot. It is not a causal population effect, not a human-
usability result, not an accessibility-conformance claim and not a uniqueness
measure. Ties and disagreements are retained and no score is aggregated.

## Exact conditions

Lean baseline `4c24a590974046c342de89f092da63fb419749a7` versus candidate `f41fc252c68f5828c8c3fec0cedafaf57f9535c2`.
[Manifest](manifest.json) freezes both resource trees plus the shared
[protocol](protocol.md), [operator instructions](operator.md) and prompts before
dispatch. Four fresh creator contexts, counterbalanced order:
`freight-R1`, `archive-R2`, `freight-R2`, `archive-R1`.

| Cell | Condition | Prompt |
| --- | --- | --- |
| `freight-R1` | lean | freight |
| `freight-R2` | candidate | freight |
| `archive-R1` | lean | archive |
| `archive-R2` | candidate | archive |

Declared family overlap: freight overlaps operational decision work and archive
overlaps collection exploration. Neither is claimed as a wholly unseen domain.
Both are new fictional products with fixtures distinct from the teaching pairs and
from the 2026-11-02 prompts.

## Availability

**No cell was lost to availability.** All four dispatches produced a submitted
artifact with preserved versions: `versions/00.html` is the first runnable file saved before any
browser test, and `initial/index.html` is the submitted result after at most one disclosed
self-correction pass. Every declared hash was re-verified against the bytes on disk.

## Automated acceptance (a floor, not a verdict)

All four submitted outputs pass matched scoped acceptance: **204 task assertions across 78 natural-viewport states**, widths 320/390/1440. Zero axe violations, zero page errors, zero external requests in every cell. Axe **incomplete** items are retained and left open, not counted as passes.

| Cell | Condition | Assertions | States | axe violations | axe incomplete | Creator corrections | Operator UI corrections |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `freight-R1` | lean | 66 | 21 | 0 | 21 | 1 | 0 |
| `freight-R2` | candidate | 66 | 21 | 0 | 21 | 1 | 0 |
| `archive-R1` | lean | 36 | 18 | 0 | 18 | 1 | 0 |
| `archive-R2` | candidate | 36 | 18 | 0 | 15 | 1 | 0 |

The same assertion code path ran for both conditions of each prompt, so the pairs
are matched evidence rather than two separately written suites. No operator restyled
any creator output. Where one page legitimately blocked Release by refusing to
advance instead of disabling the control, the assertion was written against the
**outcome** so neither design was privileged.

## Independent review, then unblind

Both reviewers authored none of the outputs, used fresh contexts, and received the
same randomized packet (93 files) with identical task facts, source, captures and raw
checks. They froze judgments before opening [the key](review-key.json).

Label mapping after unblinding: freight A=lean, B=candidate; archive A=lean, B=candidate.

Procedural blinding can still be guessed from implementation style, and each
reviewer's inspection scope and unknown fields remain explicit in their record.
Normal renders only; no neutralized diagnostic and no uniqueness metric.

## Judgments, per dimension, both reviewers retained

### Harbor Cold Chain - consignment release

Task quality:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| firstActionSalience | lean | lean |
| decisionContextRetention | candidate | tie |
| errorAndRecoveryClarity | candidate | candidate |
| responsiveAccess | lean | lean |
| semanticControlAndFocus | candidate | candidate |

Product specificity:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| contentToThesis | tie | tie |
| suppliedArtifactsShapeComposition | candidate | candidate |
| coherentMediaTypeDirection | tie | lean |
| honestEvidenceLimits | tie | candidate |

Reasons, tradeoffs and unassessed items stay in the original reviews:
[Reviewer 1](reviews/reviewer-1.md) - [Reviewer 2](reviews/reviewer-2.md).

Verdict tallies (A / B / tie / unassessed), reviewer 1 / reviewer 2:

- task quality: A 2/2, B 3/2, tie 0/1, unassessed 0/0
- product specificity: A 0/1, B 1/2, tie 3/1, unassessed 0/0

### Lantern Slide Lecture Archive

Task quality:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| firstActionSalience | tie | lean |
| decisionContextRetention | tie | tie |
| errorAndRecoveryClarity | tie | lean |
| responsiveAccess | tie | candidate |
| semanticControlAndFocus | candidate | candidate |

Product specificity:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| contentToThesis | tie | lean |
| suppliedArtifactsShapeComposition | lean | lean |
| coherentMediaTypeDirection | tie | tie |
| honestEvidenceLimits | tie | lean |

Reasons, tradeoffs and unassessed items stay in the original reviews:
[Reviewer 1](reviews/reviewer-1.md) - [Reviewer 2](reviews/reviewer-2.md).

Verdict tallies (A / B / tie / unassessed), reviewer 1 / reviewer 2:

- task quality: A 0/2, B 1/2, tie 4/1, unassessed 0/0
- product specificity: A 1/3, B 0/0, tie 3/1, unassessed 0/0

## What this run does and does not settle

It tests one named increment - a content-to-thesis step in art-direction.md -
against the same lean baseline on two new matched prompts. Any preference recorded
below is about these two prompts under this operating procedure. It is not evidence
that either condition is generally better, and it says nothing about a population of
tasks, human users or other models.

### Consequences and disagreements

Both reviewers completed independently before either file was read by the lead. The
condition key was not opened until their hashes were recorded
([freeze](reviews/freeze.json)). Both reported working image access and inspected the
captures rather than inferring from CSS alone.

**Freight.** The one dimension both reviewers agree on is
`suppliedArtifactsShapeComposition`, and both prefer **candidate**: its schematic
computes its scale from the readings' own min/max and states per-reading margins,
where lean carries only the worst margin. Both also prefer candidate on
`errorAndRecoveryClarity` and `semanticControlAndFocus`; the latter rests on a
source-level fact rather than taste — lean calls `focus()` on a paragraph with no
`tabindex`, so focus stays on `BODY` after a failed submission, while candidate moves
it to the failure heading. Both prefer **lean** on `firstActionSalience` and
`responsiveAccess`. `decisionContextRetention` disagrees (candidate / tie) and
`contentToThesis` is a tie for both, so **the content-thesis increment did not
separate the two conditions on the dimension it was added to test.**

**Archive.** `suppliedArtifactsShapeComposition` is again the agreed dimension, and
again both prefer **lean** — reviewer 2 also prefers lean on `contentToThesis`. Both
prefer **candidate** on `semanticControlAndFocus`, on two source-verifiable control
defects in lean; reviewer 2 additionally reports that lean asserts "The catalogue holds
two plates under the same figure", which is not a supplied fixture. `errorAndRecoveryClarity`
disagrees (tie / lean), and recall this family has **no failure state at all**, so that
dimension was scored against the empty state — a narrow basis. Every other archive
dimension is a tie or a disagreement, so **archive does not establish a direction for
the increment either.**

No aggregate is computed, and no reviewer established a functional blocker in either
condition. The honest summary is a mixed, inconclusive pair: the increment was not
shown to improve content-to-thesis, and the clearest separations both reviewers
supply are elsewhere (artifact-shaped composition, focus architecture, and a
visible-when-empty reset control).

### Independent post-review verification

Both reviewers independently reported that no freight capture showed a settled
"recorded" state. That was a real harness defect, not a property of either page: the
success capture fired mid-transition. It was fixed and re-run as
`evidence/<cell>/initial-02`, with the reviewed pass preserved untouched at
`initial-01`. Assertion counts, sources and axe results are identical, so the frozen
judgments remain valid for the same pages. Verified details, including the lead's own
confirmation of the `display:inline-flex` override and the dead `focus()` call, are in
[post-review-verification.json](evidence/post-review-verification.json). Reviewers'
visual judgments were not re-judged by the lead.

## First outputs, corrections and failures

`initial/versions/00.html` preserves each first runnable source and `initial/index.html` is the submitted result; every
declared hash was re-verified. Each cell discloses at most one creator self-
correction pass. Real creator-side failures are recorded per cell in the
[creator records](cells/), including a focus-after-open defect in archive-R1 and a
self-introduced regression in freight-R1.

Harness defects fixed during this run are part of the evidence: acceptance initially
selected records through a container text, clicked visually hidden 1x1 inputs
instead of their labels, sampled the DOM before the page settled, and required
control *state* rather than the *outcome* for the blocked Release. Each was
diagnosed against the rendered page before being fixed, and no fix relaxed an
assertion a page had actually failed.

## Observed resources, not end-to-end savings

[Resources](resources.json) preserves exact observed timestamps, first-artifact
times, loaded-word proxies, correction counts and every acceptance segment. Creator
clocks have different partial start bases and the cells overlap in wall time, so the
columns must not be summed or read as complete cost.

| Cell | Condition | Creator observed (min) | Budget status | Self corrections | Loaded skill words |
| --- | --- | ---: | --- | ---: | ---: |
| `freight-R1` | lean | 23.6 | over hard budget | 1 | 2455 |
| `freight-R2` | candidate | 24.4 | over hard budget | 1 | 2208 |
| `archive-R1` | lean | 15.7 | over hard budget | 1 | 2210 |
| `archive-R2` | candidate | 14.1 | over soft, within hard budget | 1 | 0 |

Every creator exceeded the protocol soft 8-minute budget and three exceeded the hard
15-minute budget. Those overruns are reported as overruns, not trimmed. A budget stop
is a stop, and overrunning is not evidence of quality or of a saving.

Provider input/output/thinking/cache tokens, exact resolved model version, billed
money, complete operator/evaluator tool totals and any full-cycle saving are
**unknown** and recorded as null. Word counts are words read from the skill files a
creator opened; they are not tokens and imply no end-to-end saving.

## Checks and limits

Acceptance used the repository installed Playwright 1.64.1 and @axe-core/playwright
4.14.0 under WSL2, installing nothing; no cell made an external request. Captures are
natural viewport at 320/390/1440 and both axe violations and incomplete are kept.

Not established: human or manual usability, screen-reader output, real accessibility
conformance, non-Chromium engines, forced-colors or extreme zoom reflow, catalog and
ranking effects, and any monetary or token claim. Authored studies remain separate
evidence. No release, tag, publish or main merge is part of this run.