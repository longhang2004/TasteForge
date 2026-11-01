# Independent UI review packet

Read only this packet directory. The creator model, generation condition, case source, and other reviewer's ratings are withheld. Do not inspect the parent run manifest, original cases, implementation notes, gallery source, or repository skill. Do not delegate.

Read `packet.json`, view the supplied desktop and mobile screenshots for **every** anonymous view, and inspect the task/fixture and browser observations. Use the extra review, failure, success, and cart screenshots to assess interaction presentation. Do not infer unseen screen-reader behavior or user outcomes.

## Ratings

Use a 1–5 ordinal rating with evidence for each dimension. 1 means blocking failure, 3 means usable with material issues, 5 means consistently strong in the evidence inspected; 2/4 are intermediate. Use `null` when the evidence cannot establish a rating. Mark confidence low/medium/high, and explain what was actually observed. Do not score novelty alone as quality.

- `taskSuccess`: primary task completion and clarity of result.
- `hierarchy`: purpose, state, primary action, values, and supporting information can be found.
- `contextIdentity`: the visual/content treatment fits this product and audience.
- `typographyContent`: reading, text roles, concrete copy, long names/diacritics, and captions.
- `layoutResponsive`: grouping, density, narrow/wide layouts, and long content.
- `interactionCompleteness`: relevant review, pending, error, retry, success, and focus states in the evidence.
- `accessibility`: semantics/focus/contrast evidence actually available; no full conformance claim.
- `systemCoherence`: consistent typography, spacing, colors, and component roles.
- `evidenceIntegrity`: honest fictional-data disclosure, claims, and understandable units/conditions.

Record `taskBlockers`, `accessibilityBlockers`, `unassessed`, `blindingConcerns`, and a short `observation` for each view. If visible interface text reveals generation metadata, record it as a blinding concern; do not seek the actual mapping. A diagnostic about an optional calculated cart total is not automatically a task blocker. Axe zero findings do not prove accessibility.

Write one JSON file to the exact output path assigned by the operator, with this shape:

```json
{
  "reviewer": "assigned reviewer identifier",
  "reviewedEvidence": "Methods and limits of what you inspected",
  "cases": [
    {
      "id": "view-01",
      "ratings": {
        "taskSuccess": { "score": 3, "confidence": "medium", "evidence": "Specific observation" }
      },
      "taskBlockers": [],
      "accessibilityBlockers": [],
      "unassessed": [],
      "blindingConcerns": [],
      "observation": "Short factual assessment"
    }
  ]
}
```

The abbreviated example shows only one dimension; complete all nine for each of all eight views. Do not compute an aggregate taste score, rank the generating models, identify treatments, or invent benchmark improvement percentages. Preserve your independent first assessment before discussion.
