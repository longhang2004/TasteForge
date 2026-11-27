# 10 — Contextual case bank and legitimate counterexamples

Date: 2026-11-10. Status: proposed; part of [programme design 08](../2026-11-10-evidence-led-quality-design.md). A case bank is a reasoning aid, not an AI-authorship detector or a benchmark of representative users.

## 1. Unit of a case

**CASE-01:** a case connects a source observation to a task, a consequence, a legitimate counterexample and a possible decision. “Purple gradient bad” is not a complete case. “The glow obscures the selected option at the declared contrast and width; a decorative campaign background outside the reading surface may be fine” is a testable distinction.

Every case records:

- Stable ID and revision; status; author/reviewer role when applicable.
- Source/observation IDs and inspected locations, or `authored-illustration` provenance.
- Task, audience assumptions, relevant artifact, surface-purpose lens and constraints.
- Observed signal, actual consequence if measured, and hypothesized consequence if not.
- Evidence kind and limits; state, width and source hash when a local artifact was inspected.
- Legitimate counterexample and the conditions that make it legitimate.
- Proposed decision: keep, adapt, remove or unassessed; minimum recheck for the decision.
- Open disagreement, relevant retention requirements and superseding case revision.

Use existing `Decide`, `Work`, `Read` and `Explore` lenses as research tags. They do not extend the strict CLI brief schema. Missing audience or state information stays unknown.

## 2. Findings have different force

| Class               | Meaning                                                                                               | Appropriate action                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `defect`            | A demonstrated broken behavior, false fact, lost required content or applicable accessibility failure | Correct within scope and recheck the affected behavior   |
| `contextual-signal` | A possible mismatch with the task, information or identity                                            | Explain the consequence; keep or change based on context |
| `craft-note`        | A finishing opportunity whose impact has not been established                                         | Optional refinement within the budget                    |

**CASE-02:** a repeated stylistic ingredient does not become a defect by frequency alone. A source's own “floor” can include house-style preferences. Preserve ordinary cards, tables, system fonts, familiar controls and quiet layouts when they serve the task. “Unusual” is not an acceptance criterion.

The boundary can change with evidence: a card layout is a contextual question; a clipped required field inside it is a defect. Record both findings separately rather than assigning the entire design a slop score.

## 3. Initial curation target

Start with about 8–12 cases, including at least six problem/legitimate-counterexample distinctions across at least four task contexts. A case may contribute more than one distinction, but reused artifacts and sources must remain visible. This is a practical curation target, not a sample-size justification or representative dataset. If fewer well-supported cases answer the chosen question, retain that smaller set with its coverage limit.

Candidate contexts include a public product page, a recurring work surface, a long-form reading surface, and a search/comparison flow. Do not generate four new apps merely to satisfy the tags. Public sources, existing artifacts and clearly marked authored illustrations can supply different parts of the bank.

## 4. Seed distinctions

These are **authored candidate cases**, informed by [Spec 09 sources](09-source-evidence.md), awaiting case-level review. They are not reported outcomes from testing the fictional products.

| Candidate                          | Problem context                                                                                            | Legitimate counterexample                                                                   | Decision question                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C01: generic promise               | A setup screen says “Unlock your potential” where the user needs supported file types and an import action | A campaign headline introduces a brand with nearby concrete product information             | Does the text supply the object, condition or next action this visitor needs?               |
| C02: empty-state drift             | A carefully structured records screen becomes an oversized generic mascot and “Nothing here” on first use  | A short empty message with a relevant create action and the same type/hierarchy             | What remains true about terminology, density and the next step?                             |
| C03: error-state drift             | Validation changes the product's labels and replaces the form, losing entered data                         | Clear inline error, retained inputs and a recoverable route                                 | Are the actual user choices and recovery path preserved?                                    |
| C04: decorative metrics            | A landing page invents a success rate or customer count to look credible                                   | A real sourced metric with period, definition and owner-approved wording                    | Is the claim verified and useful to the visitor?                                            |
| C05: stacked SaaS defaults         | Every section becomes the same three feature cards despite a sequential workflow                           | Cards make sense for independent choices; a table makes sense for comparison                | Is the content relationship represented accurately?                                         |
| C06: editorial replacement default | Cream, serif and paper textures turn a dense operator console into a lifestyle story                       | A reading-first archive or print-work ledger has a documented reason for editorial type     | Does the visual decision fit the content, constraints and working speed?                    |
| C07: crowded feedback              | Every reversible toggle opens a toast and interrupts repeated work                                         | Persistent local status or a relevant announced result clarifies a consequential action     | Is the status perceivable without unnecessary disruption?                                   |
| C08: overflow concealment          | Root clipping hides a long required label at a narrow width                                                | An intentional two-dimensional region retains required access and a clear scroll affordance | Did information/function remain reachable, rather than just disappear from geometry checks? |
| C09: eyebrow labels                | A label merely restates the adjacent heading in decorative capitals                                        | A meaningful section/category label helps orientation in a long page                        | Does the label add navigation or information?                                               |
| C10: novelty pressure              | A redesign replaces a familiar selection control with an unfamiliar gesture for distinction                | Conventional control with precise labels and deliberate spacing                             | Did the new pattern solve an observed problem worth its learning cost?                      |

Link C01–C03 to the specific S01 observations when curated; C05/C06 to S02/S03/S06 as appropriate; C07/C08 to applicable W3C guidance. A theme resemblance alone is not evidence that the same task problem occurred. C04 and C10 are original reasoning examples unless a directly inspected source is attached later.

## 5. Admission and lifecycle

Statuses are `proposed`, `reviewed`, `adopted`, `contested` and `retired`. Status is separate from `evidenceKind` and `decision`. An adopted case can recommend keeping a conventional pattern. A contested case can still be useful for posing a question.

**CASE-03:** admission to guidance requires enough context to explain when the recommendation applies, a meaningful counterexample, and a traceable source or explicit illustration label. Review checks fidelity and decision value; it does not certify the source as unbiased. Reviewer identity/model and inspected scope must be recorded when a formal review is claimed.

Retire a case when it is redundant, unsupported or overtaken by an actual contract change. Preserve its ID, prior revision and reason. Do not edit a frozen evaluation's copy of the case. When a source disappears, follow Spec 09's tombstone rule and reassess active recommendations.

## 6. Using a case during real work

Select at most the few cases that change a current decision. Read the context and counterexample together. Identify the target state, evidence, consequence and smallest useful edit. Preserve required content, actions and design constraints. Recheck the named risk and report unknowns.

Do not attach every case to every task. A fast correction should not load the whole bank. Search/retrieval is optional; a short hand-maintained index is sufficient initially. Cases belong in research material; only concise distilled guidance belongs in the packaged skill.

## 7. Acceptance and evaluation

For the initial bank, a reviewer must be able to trace each adopted recommendation to its support and explain a context where the ingredient should remain. Detect duplicates and unsupported source claims through inspection or later optional helpers. Count cases and contexts descriptively, without claiming coverage of “AI UI” as a population.

The bank succeeds at documentation when it supports useful decisions without turning aesthetics into mandatory bans. It demonstrates product improvement only if a separately scoped evaluation supplies that evidence. Use [Spec 12](12-evaluation-policy.md) to choose the least expensive adequate lane.
