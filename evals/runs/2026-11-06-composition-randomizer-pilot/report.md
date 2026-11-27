# Composition/randomizer pilot — final scoped record

Two fictional briefs, four preserved creator outputs and two independent AGY/Gemini reviews. This combined composition/type/skill/retrieval increment is compared with released beta.2. It does not isolate a font or algorithm effect.

## Acceptance and preserved corrections

All four corrected outputs pass **306 assertions across 96 natural-viewport states** at 320/390/1440. Zero measured overflow failures, flow stops, page errors, external requests or axe violations. **84 axe incomplete records remain unassessed**, not passes. [Exact checks](acceptance.json).

| Cell | Assertions | States | Axe incomplete |
| --- | ---: | ---: | ---: |
| proofdesk-baseline | 87 | 24 | 18 |
| proofdesk-candidate | 87 | 24 | 24 |
| cabinet-baseline | 66 | 24 | 24 |
| cabinet-candidate | 66 | 24 | 18 |

First outputs and matched-v2 failures are unchanged. The v3 harness fixes a hidden-media assumption uniformly; raw v2 counts are not distinct defects or a directly matched before/after quality metric. All corrected sources were already present in the handoff snapshot. The continuation verified zero frozen-input/snapshot drift, retained the existing proofdesk baseline archive and archived the other three. It made no additional UI correction and did not regenerate any initial output.

## Independent judgments

Both reviewers used fresh AGY CLI 1.4.12 contexts with `gemini-3.8-flash-high`, high effort, read-only packet access and no condition key/creator notes. [Judgments and raw records](reviews/) were hash-frozen before unblinding. Shared model/host and recognizable source style limit independence/blinding; AI judgments do not replace people using the product.

Reviewer 1 reports viewing 20 image paths; its exact inspected scope, blockers and limitations remain in [the original judgment](reviews/reviewer-1/judgments.json).

Reviewer 2 reports viewing 18 image paths; its exact inspected scope, blockers and limitations remain in [the original judgment](reviews/reviewer-2/judgments.json).

### proofdesk

Labels after unblinding: A=baseline, B=candidate.

taskQuality:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| firstActionSalience | tie | tie |
| decisionContextRetention | baseline | candidate |
| errorAndRecoveryClarity | baseline | candidate |
| responsiveAccess | candidate | candidate |
| semanticControlAndFocus | baseline | candidate |

productSpecificity:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| contentToThesis | baseline | tie |
| suppliedArtifactsShapeComposition | candidate | candidate |
| coherentMediaTypeDirection | tie | candidate |
| honestEvidenceLimits | baseline | tie |

### cabinet

Labels after unblinding: A=candidate, B=baseline.

taskQuality:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| firstActionSalience | candidate | candidate |
| decisionContextRetention | candidate | tie |
| errorAndRecoveryClarity | candidate | candidate |
| responsiveAccess | candidate | candidate |
| semanticControlAndFocus | tie | tie |

productSpecificity:

| Dimension | Reviewer 1 | Reviewer 2 |
| --- | --- | --- |
| contentToThesis | candidate | candidate |
| suppliedArtifactsShapeComposition | tie | candidate |
| coherentMediaTypeDirection | tie | candidate |
| honestEvidenceLimits | tie | tie |

No aggregate quality/uniqueness score or overall winner is computed. Per-dimension evidence/tradeoffs, disagreements, ties, blockers and unassessed judgments stay in the original review records; this bounded pair cannot establish a general product-specificity or human-usability effect.

In these inspected states, both reviewers prefer candidate responsive access in both tasks and artifact-shaped composition in ShiftPress. Signal Cabinet also has agreed candidate preferences for first-action salience, error/recovery and content-to-thesis. ShiftPress decision context, recovery and focus judgments disagree; several specificity dimensions tie. These are local judgments, not an overall direction or evidence that the increment generalizes.

## Resources and limits

[Resources](resources.json) retain original dispatch/archive observations and append actual browser/reviewer intervals plus AGY-reported usage categories. Original creator provider tokens/cache/thinking/billing, normalized cross-host accounting and parent/operator totals remain unknown. The quota pause is availability loss, not UI failure; delayed corrected-archive timestamps are not creator duration. No full accepted-UI savings or model ranking is claimed.

Original creator hard-budget compliance cannot be reconstructed from dispatch/archive timestamps alone. Reviewers inspected desktop/320px captures directly; 390px is represented in automated checks rather than their dedicated image reads. Both report no additional blocker within their static inspection scope.

Frozen candidate and shared inputs remain bound by [freeze.json](freeze.json) and the original [protocol](protocol.md). Teaching families overlap; facts/assets are new fictional fixtures. Both conditions had identical facts/assets/optional fonts; reference retrieval differences belong to the combined treatment. Font delivery/script observations remain limited to recorded samples. Manual/human/native-speaker testing remains deferred. Broader LON-99 catalog ingestion, LON-109 replication and LON-95 host coverage are separate. No release, npm publication, main merge or global host setting change is included.

[Gallery](index.html) · [Handoff](HANDOFF.md) · [Preflight](evidence/continuation-preflight-2026-11-08.json)

## Offline verification and viewing

From the repository root, run `python3 evals/runs/2026-11-06-composition-randomizer-pilot/tools/verify.py` to verify frozen inputs, accepted source/check bindings, the anonymous packet, frozen judgments and the final artifact index. Serve the root with `python3 -m http.server 4173 --bind 127.0.0.1`, then open `/evals/runs/2026-11-06-composition-randomizer-pilot/` to use the gallery and four local task slices. Preparation/finalization helpers refuse to replace the existing packet, archives or frozen reviews.

Separate [delivery-gallery checks](evidence/delivery-gallery-2026-11-08-04/report.json) verify all96 capture assets,16 links and rendered report geometry/axe at320/390/1440. The retained [harness and heading-wrap corrections](evidence/delivery-gallery-2026-11-08/harness-failure.md) are outside the matched pilot and its frozen reviewer judgments.
