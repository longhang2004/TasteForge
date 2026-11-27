# 08 — Evidence-led UI quality: programme design

Date: 2026-11-10. Status: draft specification for review. Scope: future design and evaluation work; implementation is not authorized by this document alone.

## 1. Direction and decision boundary

The owner asked to prioritize existing reviews and public information, reduce dependence on recruiting people for manual A/B tests, and write substantial specifications for later work. This is the approved planning direction. Detailed thresholds, record formats and work packages below are proposed design decisions, not claims of an implemented system or measured improvement.

TasteForge should turn a small amount of relevant evidence into better decisions about a particular task. It should not require a fresh experiment before every useful change. Existing community criticism, counterexamples, standards, source inspection and retained product artifacts can answer many questions. Each answers a different kind of question; their labels must survive into the final claim.

**Programme requirement EL-01:** source curation, specification work, retrospective inspection and scoped regression work can finish without recruiting new participants. Lack of human study data limits claims about users; it does not automatically block those activities.

**EL-02:** a demonstrated functional, factual or accessibility defect still matters within the affected acceptance scope. Removing mandatory recruitment must not turn an unchecked interaction into a passing one.

## 2. Baseline and preserved contracts

The source baseline is commit `6e1a91621176be699c3b41c19da6574b91e701f2`, delivered in [draft PR #4](https://github.com/longhang2004/TasteForge/pull/4). The last checked main commit is `98e1ebb18c9eb7f14887b095c86c66e3009b130f`. These are planning anchors, not an instruction to merge either branch. Reconfirm refs at implementation time.

The [composition pilot report](../../../evals/runs/2026-11-06-composition-randomizer-pilot/report.md) recorded 306 assertions over 96 states passing; 84 axe incomplete records remained unassessed. Those results do not demonstrate overall accessibility conformance or a universal visual-quality gain. Mixed and tied judgments remain part of the record.

The following existing contracts remain requirements:

- The six CLI commands are `init`, `suggest`, `generate`, `audit`, `catalog` and `inspire`. Normal runtime remains offline, deterministic within its documented inputs, and free of API-key requirements.
- Research metadata does not extend strict brief/config/DNA inputs. DNA schema version `1.0` is distinct from package, engine, knowledge and future research-record versions.
- Core has no filesystem, network or CLI dependency. Reference material is data, never executable instructions.
- Existing system constraints, fixed fonts/palettes, language, delivery, density, contrast and task requirements retain priority over novelty.
- Fast remains a bounded correction workflow. Standard and Explore remain proportional choices, not research prerequisites. One creator remains the normal starting point.
- Frozen historical runs, judgments, unblinding records and source bindings are immutable. Corrections use an identified addendum or a new run.

## 3. Approaches considered

| Approach                                                          | Value                                                                             | Cost or limitation                                                                             | Decision                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Add more anti-pattern instructions                                | Small immediate change                                                            | Easily repeats existing advice; poor provenance; can create another default style              | Use only when a named gap needs concise guidance |
| Source-led cases, counterexamples and reuse of existing artifacts | Fits the owner's preference; makes reasoning reviewable; permits small increments | Requires honest scope labels and curation                                                      | Recommended programme                            |
| Recruit a panel and run fresh A/B tests for each increment        | Can answer targeted user questions                                                | Coordination and repeated generation; unnecessary for many documentary or regression questions | Optional escalation for a named uncertainty      |
| Build an automatic slop detector or ingest a large corpus         | Attractive single number or coverage claim                                        | Ambiguous labels, licensing burden, cost and score gaming; does not establish task success     | Outside this programme                           |

## 4. Evidence model

**EL-03:** every conclusion names its evidence kind and material scope. Public complaints identify hypotheses and recurring language. Standards explain applicable requirements. Repository documents expose an author's method and chosen style. Rendered artifacts expose particular states. Behavior checks establish particular outcomes. AI reviewers provide judgments. Human studies establish only what their design and participants support.

No automatic conversion connects these levels. Three articles repeating one Reddit thread are one origin lineage. A second AI pass over the same screenshot adds another judgment, not another product sample. A mechanically clean screen can retain vague copy. A disliked font is not evidence of task failure or AI authorship.

Primary useful gaps from the initial reading are information-bearing copy, continuity across loading/empty/error/return states, and content-supported identity. Existing conditional anti-pattern and art-direction guidance should be extended selectively, rather than replaced by blanket prohibitions.

## 5. Specification map

| Spec                                                                                           | Decision it enables                         | Initial deliverable                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| [09 — Source evidence](2026-11-10-evidence-led-quality/09-source-evidence.md)                  | What to read, retain and believe            | Small source ledger with retrieval and rights limits    |
| [10 — Case bank](2026-11-10-evidence-led-quality/10-case-bank.md)                              | How a complaint becomes contextual guidance | Paired problems and legitimate counterexamples          |
| [11 — Copy and states](2026-11-10-evidence-led-quality/11-copy-state-coherence.md)             | What to inspect and preserve                | On-demand reference design and refinement contract      |
| [12 — Evaluation policy](2026-11-10-evidence-led-quality/12-evaluation-policy.md)              | When existing evidence is enough            | Reuse-first lanes with optional escalation              |
| [13 — Tooling contracts](2026-11-10-evidence-led-quality/13-tooling-contracts.md)              | How later helpers can remain bounded        | Separate research records and optional local helpers    |
| [14 — Resources and claims](2026-11-10-evidence-led-quality/14-resource-claims-maintenance.md) | What results and costs can honestly claim   | Claim ledger, resource accounting and maintenance rules |
| [15 — Future RFCs](2026-11-10-evidence-led-quality/15-future-rfcs.md)                          | What to build later and when to stop        | Dependency-aware work packages for existing issues      |

These eight documents form one design. Spec 12 governs evaluation selection; Spec 13 must not make its optional tooling a prerequisite. Spec 14 governs reported claims. Where an example differs from a requirement, the requirement wins and the example must be corrected before implementation.

## 6. Phases and readiness

| Phase                                | Work                                                                                 | Exit evidence                                                             | Not required for this exit                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| P0: specifications and curation      | Review this bundle; curate source-linked observations and disagreements              | Reviewable design, source limitations, selected questions                 | New UI generation, human participants, a CLI change          |
| P1: guidance and retrospective use   | Implement a separately approved small reference; inspect relevant existing artifacts | Traceable cases, scoped regression results, honest unknowns               | Fresh A/B outputs or proof of population-wide benefit        |
| P2: optional local tooling           | Add only helpers whose manual burden is demonstrated                                 | Boundary tests, validation and packaging checks appropriate to the change | Hosted services, model API integration, automatic harvesting |
| P3: optional fresh comparison        | Resolve a named uncertainty requiring fresh outputs                                  | Predeclared protocol, matched inputs, frozen review record                | Human recruitment unless the question concerns actual users  |
| P4: optional targeted human research | Resolve an important remaining user question                                         | Appropriate consent, tasks and scoped findings                            | Universal design claims or automatic stable release          |

**EL-04:** P0, P1 and P2 do not imply a later phase must happen. A phase can be stopped when its expected decision value no longer justifies cost. P3 and P4 require an explicit question and a budget recorded before execution. Counts and caps in this bundle are operating proposals, not research-derived optimal sample sizes.

The first candidate implementation is a short copy/state reference plus a small case bank. Neither the proposed source registry helpers nor broad catalog ingestion is a dependency. The builder may choose exact file organization within the stated boundaries after approval.

## 7. Historical and prospective policy

Existing Linear documents 04, 05 and 07 and frozen pilot protocols describe their own historical or release scopes. This bundle proposes the default for **new evidence-led quality work** after adoption. It does not retroactively waive a prior protocol's missing requirement or relabel a deferred manual study as done.

LON-93 and LON-96 remain deferred human/manual work unless their own acceptance conditions are met or explicitly rescoped. LON-95 host coverage, LON-98 bounded CSS-import audit and LON-99 composition/catalog work keep their separate scopes. Stable go/no-go in LON-97 remains an owner decision with supported hosts, unresolved risks and claim limits visible. A spec cannot silently approve publication.

## 8. Acceptance of the specification bundle

The documentation work is complete when all eight documents exist, links and identifiers are coherent, source claims distinguish observation from inference, a fresh builder review has no unresolved planning blocker, and the owner can inspect the next increment without needing an external A/B panel. Completion means **specifications delivered**; implementation and adoption remain separate decisions.

Implementation readiness for P1 requires a chosen gap, selected case scope, proposed files, expected behavior preserved and an evaluation lane. The detailed implementation plan is written after this design is approved. No dependency installation, upstream skill execution, UI regeneration, release or merge follows automatically.

Builder review on 2026-11-10: a fresh native AI reviewer read the complete eight-document bundle, checked for unanswered questions that would materially change an implementation plan, and returned “nothing important left”. This is a design-clarity check, not human usability evidence or owner adoption. Local links, Markdown fences and formatting were also checked.

## 9. Navigation to current contracts

- [Architecture](../../architecture.md)
- [Current skill](../../../skills/tasteforge/SKILL.md)
- [Current anti-pattern reference](../../../skills/tasteforge/references/anti-patterns.md)
- [Surface-purpose lenses](../../../skills/tasteforge/references/surface-purpose.md)
- [Frozen pilot report](../../../evals/runs/2026-11-06-composition-randomizer-pilot/report.md)
- [Pilot continuation review](../../composition-continuation-review.md)

## 10. Proposed next decision

Review and adopt this design first. The recommended first implementation is P1: curate a small set of source-linked cases, add one concise on-demand copy/state reference, and inspect selected existing artifacts. Record any fresh-comparison question that survives that work; do not schedule a new A/B exercise merely because the previous pilot used one.
