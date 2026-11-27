# 14 — Resources, allowed claims and maintenance

Date: 2026-11-10. Status: proposed; part of [programme design 08](../2026-11-10-evidence-led-quality-design.md). Budgets in this bundle are proposals; savings have not been measured for the new workflow.

## 1. Resource accounting

The owner prefers using available information and AGY where appropriate to conserve quota. Measure the actual costs of a chosen lane before claiming efficiency. Avoid repeating full source ingestion or generating a fresh UI merely to produce a new result row.

**RES-01:** keep generation, correction, check execution, review and evidence archival as separate activities. For each attempt, retain actual start/end where known, active execution time, wall time, quota/rate-limit delay, model/provider/host, attempt outcome and reason. Unknown fields stay unknown; a missing timestamp is not zero seconds.

Keep provider-reported input, output, reasoning/thinking and cache categories in their original named units. Store a normalized comparison only with an explicit mapping. Do not infer billable tokens from words, file size or a model's prose estimate. An absent billing field must not become a zero-cost claim. A CLI's successful exit is not proof that every submitted model attempt succeeded.

Record failed and invalid attempts as well as successful ones, including retries and incomplete generations. Resource summaries must include or explicitly exclude each segment. The prior host-matrix review identified a summary omission of an initial invalid segment; preserve the original evidence and correct future summaries with an addendum, not a retroactive silent edit.

**RES-02:** wall time includes waiting and coordination; active model time is a different metric. Archive completion time is not generation time. Tool/provider quota usage and a priced invoice are different observations. Never derive a claimed percentage saving from incomparable runs.

## 2. Reuse and caching

Reuse can mean citing an already inspected source, reusing a verified screenshot or reading an existing frozen report. Name what was reused, its revision and why it still applies. A stored public URL without inspected content does not count as a retained review.

Invalidate reuse when a material input changes: source revision, source availability/rights, product facts, target task, host rendering contract or the criterion being applied. A color-only change may not invalidate an unchanged behavior record, but the scope of reuse must be explicit. Do not rerun every unrelated check by default; rerun those whose evidence no longer applies.

Keep public research and private project context separately scoped. Do not share private snippets or personalized data through a global cache. No background synchronization, scheduled refresh or paid service is part of this phase.

## 3. Claim ledger

**CLAIM-01:** a result names the proposition, evidence kind, inspected scope and limitation. The allowed claim cannot be stronger than its evidence. Unknowns stay alongside results rather than buried in an appendix.

| Available evidence                | Allowed wording pattern                                            | Unsupported leap                                                |
| --------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Public review synthesis           | “Selected reviewers raise this concern in these contexts”          | “Most users dislike this” or “this proves AI authorship”        |
| Repository source inspection      | “This revision prescribes this policy”                             | “This skill improves output quality”                            |
| Retrospective rendered inspection | “This named state shows this issue at this width”                  | “The new guidance caused better generations”                    |
| Automated behavior checks         | “These named assertions passed on this revision/environment”       | “The whole product is usable and accessible”                    |
| AI judgments                      | “These reviewers preferred/tied these artifacts for these reasons” | “Users completed the task better”                               |
| Small matched fresh pilot         | “Under these inputs and model/host, these outcomes occurred”       | “General improvement across products/models”                    |
| Targeted human study              | “These participants had these task outcomes”                       | “Universal preference or causality beyond the study design”     |
| Resource records                  | “This attempt used these reported units and durations”             | “Cheaper/faster overall” without comparable complete accounting |

The composition pilot's 306 assertion passes and 96 states are retained observations. Its mixed/tied quality judgments and 84 unassessed axe incomplete records remain visible. None is erased by a new source-led evaluation policy.

## 4. Completion, defects and release scope

Specifications can be complete while proposed features remain unimplemented. A source review can finish with a contested recommendation. An evaluation can finish with a regression. Use separate statuses for task completion, artifact acceptance and claim readiness.

**CLAIM-02:** a demonstrated critical functional/factual/accessibility defect blocks acceptance of the affected quality claim or release scope until fixed or explicitly excluded with a defensible supported boundary. A lack of human participants does not block unrelated spec authoring, research or scoped automated checks. Do not equate these conditions.

LON-93 and LON-96 remain deferred human/manual work. This programme does not mark them done. LON-95 remains host-matrix work within its documented tested hosts. LON-97 stable go/no-go requires an owner decision based on actual supported scope and unresolved risk; this bundle neither publishes nor grants stable certification. If a historical release requirement is changed, record an explicit scope decision rather than silently waiving it through this policy.

LON-109 is the natural home for future complete resource replication/accounting. A narrower guidance increment may proceed without resolving every provider billing unknown, provided it makes no unsupported savings claim. LON-105's future rendered audit and LON-104's task-effect RFC are not dependencies of P1.

## 5. Adoption and documentation precedence

The owner approved the planning direction, not every implementation detail in this bundle. After design adoption, new evidence-led tasks use Spec 12's reuse-first default. Existing historical documents retain their original content with a prospective navigation banner where useful. Frozen runs are never rewritten to look compliant with a newer policy.

If a future implementation contradicts the approved design, record an amendment and rationale before relying on the changed contract. Small implementation choices left to the builder do not require a new design round. Changes to evidence strength, privacy/export scope, mandatory evaluation gates or public schemas do.

## 6. Maintenance without a new service

Review sources when they are used for a decision, when a material change is reported, or when a relevant upstream revision is deliberately selected. Do not promise that a mutable source is always current. Record access/revision scope and distinguish a stale candidate from a withdrawn source.

Use append-only revisions or identified supersession records for adopted decisions. A source tombstone links dependent cases. Reassess active recommendations and retain historical uses with their original scope. Prefer retiring redundant guidance over adding layers of contradictory exceptions.

Refresh responsibilities are roles, not a new staffing requirement: the implementing agent curates, a useful independent reviewer checks consequential ambiguities, and the owner chooses adoption/release scope. Routine low-impact fixes remain within normal task authorization.

## 7. Tool/provider constraints

AGY is an optional execution/review provider, not an architectural dependency. Use pinned public material when that answers the question. New local/private material must follow the actual export authorization and approval result. A previous approval rejection cannot be bypassed through another channel, tool or repackaged payload. Local/native review remains available.

Do not expose secrets, unrelated workspace files, raw private logs or personal data to improve a review packet. A budget-saving preference does not reduce these boundaries. A model/provider outage is an infrastructure result, not evidence that an artifact has passed or failed UX review.

## 8. Acceptance checklist for a future report

The report identifies all included attempts, distinguishes observed and unknown costs, binds artifact versions, names its lane and allowed claims, retains losses/ties, and makes unresolved defects and manual gaps visible. It states which decision can now be made. It need not include a new A/B table when no new comparison was run.
