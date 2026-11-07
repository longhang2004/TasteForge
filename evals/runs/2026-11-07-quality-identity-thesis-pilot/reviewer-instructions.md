# Independent reviewer instructions

You are one of two independent reviewers. You did not author any of these outputs.
Work from the evidence in `review-packet/` only.

## Read only this

- `review-packet/index.json` — the packet contents
- `review-packet/<family>/task.md` — the original task (identical for both variants)
- `review-packet/<family>/A/` and `/B/` — `index.html`, `checks.json`, and the PNG renders
- this file

Do **not** read: `review-key.json`, `cells/`, `evidence/`, `manifest.json`, `protocol.md`, `report.md`, `acceptance.json`, `resources/`, `docs/`, or anything outside this run directory. The A/B labels are randomized and the mapping must stay unknown to you.

## What the packet gives you

For each of two prompts (`freight`, `archive`) there are two variants, `A` and `B`, from two different skill conditions. You are not told which is which and must not guess or rank the conditions. Identical task facts, identical check harness semantics, natural-viewport renders at 320/390/1440 for every captured state.

`checks.json` is the root acceptance record: the automated assertions that ran, their pass/fail count, any page errors or external requests, geometry, focus, scroll, and both the axe **violations** and **incomplete** findings. Both variants passed the same automated acceptance; that is a floor, not the judgment.

## What to judge, and separately

Score each variant for each prompt on two independent sets. Do not merge them into one number. Do not produce a total, an average, a "uniqueness" or "slop" score.

**Task quality** (5 dimensions, judge how well the interface serves the stated task):
1. `firstActionSalience` — is the first useful action obvious and correctly prioritised?
2. `decisionContextRetention` — are the compared facts, the decision and the note preserved through edit, failure and recovery?
3. `errorAndRecoveryClarity` — does the blocked/failed state explain what happened, why, and what to do next?
4. `responsiveAccess` — is the real content reachable and readable at 320/390/1440, including long text and error states?
5. `semanticControlAndFocus` — controls, labels, focus order and focus visibility; state what you verified vs. inferred.

**Product specificity** (4 dimensions, judge whether the interface is shaped by *this* product's supplied content):
1. `contentToThesis` — does a specific visual/situational thesis follow from the supplied facts, rather than a generic dashboard skin?
2. `suppliedArtifactsShapeComposition` — do the supplied artifacts (readings vs. limit, catalogue series/plate sizes/duplicate) actually determine the layout and emphasis?
3. `coherentMediaTypeDirection` — is there one consistent direction in type, colour, spacing, and any authored schematic?
4. `honestEvidenceLimits` — are the demo's limits stated truthfully (no real shipment/release/food-safety determination; schematic placeholders not archival photographs; duplicate not a new discovery)?

## Verdict per dimension

Use exactly one of: `A` (A is better), `B` (B is better), `tie`, `unassessed`.
Add a one-line reason. A `tie` is a real answer when the evidence does not separate them.

## Hard rules

- Judge only what the packet shows. Do not speculate about intent, cost, tokens or model.
- Do not claim accessibility conformance, human usability, or that axe passing proves accessibility. Report axe `incomplete` items as open.
- If you cannot verify something from the text/source/checks available to you (for example you cannot see an image), write `unassessed` and say so. Do not invent a visual judgment.
- Prefer concrete evidence: name the element, state, width or assertion you relied on.
- Do not edit any file except the two you are asked to write.

## Write exactly these two files

`reviews/reviewer-<N>.json` (N is given in your task), shape:

```json
{
  "reviewer": <N>,
  "startedAtUtc": "...",
  "finishedAtUtc": "...",
  "scope": "what you actually inspected, and what you could not",
  "imageAccess": "true|false, and what that means for your judgments",
  "cases": {
    "freight": {
      "taskQuality": [{"dimension": "...", "verdict": "A|B|tie|unassessed", "reason": "..."}],
      "productSpecificity": [{"dimension": "...", "verdict": "A|B|tie|unassessed", "reason": "..."}],
      "notes": "strongest observation for each variant, tradeoffs, what you could not assess"
    },
    "archive": { "taskQuality": [...], "productSpecificity": [...], "notes": "..." }
  }
}
```

And `reviews/reviewer-<N>.md`: a short human-readable version of the same judgments, including your strongest single observation per variant and every point where you were unsure.

Write them, then reply with a compact summary: per prompt, your per-dimension verdicts, and the two or three observations you are most and least confident about. Do not wait for anything else.
