# 12 — Reuse-first evaluation and optional escalation

Date: 2026-11-10. Status: proposed prospective policy; part of [programme design 08](../2026-11-10-evidence-led-quality-design.md). Historical protocols keep their recorded requirements. This policy does not retroactively complete an unfinished study.

## 1. Select by the claim

**EVAL-01:** write the decision and intended claim before choosing a method. Choose the least expensive evidence that can answer it. “Can we add a traceable guidance distinction?” and “does this improve new outputs across tasks?” require different evidence. “Do actual users finish faster?” requires evidence about actual users; an AI preference cannot substitute for it.

The normal sequence is retained information → targeted source reading → relevant existing artifacts → bounded review. It stops as soon as the intended scoped decision is supportable. Fresh generation and participant recruitment are optional escalation lanes.

| Lane                         | Suitable question                                                            | Minimum evidence                                               | Honest limit                                                 |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| E0: source synthesis         | Is this recommendation well-grounded and contextual?                         | Inspected sources, counterexamples and provenance              | No output improvement measured                               |
| E1: retrospective inspection | Is the named issue present in retained artifacts?                            | Exact source/artifact refs, selected states, findings          | No causal comparison of a new skill                          |
| E2: revision regression      | Did a particular edit retain behavior and address a named issue?             | Before/after binding, retention contract and relevant checks   | Applies to the edited artifact; not a fresh-generation study |
| E3: bounded AI judgment      | Is a contextual judgment useful or disputed?                                 | Declared packet, reviewer scope, rationale, unknowns           | A model's judgment, not human task evidence                  |
| E4: fresh matched comparison | Does a named guidance change affect new outputs under controlled conditions? | Predeclared matched generation and frozen review process       | Narrow sample/host/model inference                           |
| E5: targeted human study     | Do actual users understand or perform the task?                              | Appropriate participants, tasks, consent and recorded outcomes | Limited by design, sample and context                        |

Lanes can be combined. They are not a mandatory ladder. E0 can close a research task; E1 can discover a defect that needs E2; E4 can be unnecessary even after an E3 tie. Report the lanes actually executed.

## 2. Existing artifacts first

**EVAL-02:** choose artifacts because they expose the question, including a conventional design that should remain acceptable. Record selection criteria and exclusions before judging. Do not select only known winners or count rereads as new samples.

The existing composition pilot at `6e1a91621176be699c3b41c19da6574b91e701f2` supplies inspectable source, screenshots, behavior records and judgments. Reuse can mean reading those records without rerunning anything. If replay is necessary, render verified source in a new output directory, record current environment and distinguish the new check from the historical run. Do not change old manifests or mix fresh screenshots into old reports.

A different browser or newly installed renderer may change output. Record it; do not silently call the result an exact replication. If an artifact cannot be run, inspect the available evidence and mark the missing behavior unassessed.

## 3. Separate observations

**EVAL-03:** keep these dimensions distinct:

- Static/source facts: literal copy, retained fields, provenance, imports and implementation boundary.
- Rendered geometry/content: actual visible content, clipping, hierarchy and state at named widths.
- Behavior: named action, result, persistence and recovery, with an actual interaction trace when claimed.
- Accessibility: tool/version/rule result, keyboard/focus observations and unresolved manual checks.
- Contextual judgment: copy information value, state coherence, task fit and identity, with reason.
- Human findings: only observations actually collected from people in the declared study.

Do not sum these into an overall slop score. A defect can block scoped acceptance even if visual preference improves. A tie or negative result can still complete an honest research task.

## 4. Review packet and reviewer policy

The default is one bounded independent AI review when it can change a consequential decision. Routine source curation can instead use direct inspection. A second reviewer is justified by a material disagreement, a high-impact decision or a protocol chosen before review; it is not mandatory for every small task. Reusing the creator to summarize its own work must be labelled self-review.

**EVAL-04:** packet preparation binds the exact material the reviewer can inspect before judgments are frozen. Include an allowlist and real hashes for source, screenshots and check records; declare exclusions. Reviewer access should be to the packet, not a mutable working tree. Validation must reject missing, changed or unlisted files before accepting a formal frozen review. The prior pilot's binding checks are a reference, not permission to create another mutable review root.

If comparison labels are blinded, keep the key outside the review read root; freeze packet membership, input hashes and submitted judgments before opening it. Labels should not encode provider, candidate or expected winner. Existing recognizable public artifacts cannot be called fully blind merely because filenames changed.

The reviewer returns inspected scope, task-fit findings, copy/state findings, defect evidence, uncertainties and keep/change recommendations. A screenshot-only reviewer cannot claim a form was submitted. If images fail to load, visual judgment is unassessed. Record model/provider/host where known and `unknown` where not.

## 5. Proposed operating budgets

These are initial caps for a future lightweight workflow, not measured optimal budgets. A chosen run may set smaller caps. Any expansion must record the unresolved question and revised budget before consuming it.

| Activity                                  | Default proposal                                                 | On exhaustion                                                                |
| ----------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Targeted reading during one ordinary task | One or two relevant sources already indexed when possible        | Record gap; open a separately scoped research task only if valuable          |
| One lightweight review packet             | Up to 6 cases, 24 images and 32 file reads                       | Reduce packet or predeclare a larger scope                                   |
| One external/model review attempt         | Up to 600 seconds active review time where enforceable           | Mark timeout/partial; retain useful observations without claiming completion |
| Correction                                | One bounded correction pass plus confirmation of affected checks | Additional work only for an identified blocker or explicitly expanded task   |

The 600-second cap excludes archive transfer time and quota waiting; total wall time must still be reported. If a host cannot enforce a cap, record an attempted budget and actual usage rather than claiming enforcement. At most one immediate retry is the default for transient infrastructure failure, with both attempts retained. Repeated quota/model failure should lead to another available lane or an explicit unassessed result, not an unbounded retry loop.

AGY may provide a review when available, authorized and appropriate for the payload. Existing permission to use a tool is not permission to bypass automatic approval review or export secrets/unapproved private material. Prefer public pinned artifacts, or local/native review for material that cannot be exported. A native reviewer does not need to be replaced solely to satisfy a provider preference.

## 6. Rendered and behavior scope

Declare the product's actual minimum width, relevant wide width and states. For generic responsive web fixtures with no narrower product contract, 320, 390 and 1440 CSS px are useful proposed inspection points, not a complete device matrix. Record viewport, browser, zoom/device scale where material, language, state and artifact hash.

Use natural viewport inspection for critical controls and reading. Full-page images supplement it. A hidden overflowing element, clipped required text or unreachable action must not be accepted because a bounding-box check passes. A legitimate two-dimensional region is evaluated under its actual accessibility requirement and access pattern.

Behavior checks focus on the decision: invalid input, retained values, selected options, filter reset, retry or return as relevant. Do not broaden every copy correction into a full product test suite. Never relabel an automation failure as a design defect without locating its cause. Use `not-applicable`, `unassessed`, `infra-failure`, `artifact-defect` and `passed` distinctly, with reasons.

## 7. Optional fresh comparison

Enter E4 only after naming what existing material cannot answer and why the answer changes a decision. A reasonable small future pilot proposal is two new task-family briefs and four matched outputs, with two independent AI reviews if that protocol is adopted. Those counts are scoped feasibility choices, not statistical evidence of general improvement.

Predeclare baseline/candidate revisions, brief facts, assets, tools, generation model/host within each pair, effort, selection, correction allowance, state checks and stop rules. Keep generation and review costs separate. Freeze review inputs and judgments before unblinding; retain failures, ties and losses. Never turn an edited historical fixture into a supposedly fresh output. Reusing a brief from prior development limits independence and must be disclosed.

If the target comparison cannot be matched because a host/model is unavailable, stop, rescope explicitly or record a non-matched exploratory observation. Do not silently substitute and keep the matched claim.

## 8. Optional human research

E5 is for an important question about actual users, such as error recovery comprehension, when existing user research is unsuitable. Search available relevant research first. Existing public opinions can inform the study question; they are not observations of people using TasteForge's product.

Define the participant/task need, consent, data handling, outcomes and limits before recruitment. Avoid default conversion-optimization A/B infrastructure or a permanent panel at this stage. If recruitment is unavailable, keep the user claim unknown and continue independent specification, source and regression work. LON-93/LON-96 remain deferred unless separately completed or explicitly rescoped.

## 9. Acceptance record

Every completed evaluation names its question, lane, source revision, evidence paths, selection/budget, results, defects, unknowns, claims allowed and next decision. Historical protocol 07 remains authoritative for the pilots executed under it. Adoption of this prospective policy changes new defaults only; it does not rewrite that history or release gates.
