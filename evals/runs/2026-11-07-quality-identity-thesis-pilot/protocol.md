# Bounded product-specificity pilot — protocol amendment

Predeclaration written before creator dispatch on 2026-11-07. Follows [Spec07](https://linear.app/long-hang/document/07-quality-distinctiveness-and-resource-evaluation-protocol-b493c668b8a3). Two held-out matched prompts, four fresh outputs. No expansion unless a named uncertainty is recorded before dispatch.

## Why a new run instead of re-scoring the old one

The 2026-11-02 run (`evals/runs/2026-11-02-quality-identity-forward-test/`) is frozen historical evidence and is not edited. Its delivered candidate `1f5b808` is byte-identical in `skills/` to the shipped `78aab58`, so re-running that comparison would duplicate evidence.

That run's recorded gap is specific: the candidate improved several task-context/narrow-access decisions, but **both reviewers preferred the lean condition on coherent media/caption/type direction and on supplied artifacts shaping composition**. The candidate skill therefore lacked a step that turns supplied product content into a visual thesis. Candidate `f41fc25` adds exactly that on-demand step (`references/art-direction.md`, "Choose a direction that the content can carry"). This run tests only that increment against the same lean baseline.

## Inputs and availability

- Baseline `R1`: exact lean skill tree at `4c24a590974046c342de89f092da63fb419749a7`.
- Candidate `R2`: exact skill tree at the frozen candidate revision recorded in `manifest.json` (commit `f41fc25`, after the art-direction thesis step and stable example links).
- Both trees are copied into `resources/` and hash-frozen before dispatch. No creator sees the treatment identity.
- Same prompts, operator instructions, atom of facts, asset rules, widths and correction budget in every pair.
- Provider/host: OpenCode subagents on the inherited configured model. Exact resolved provider model version, token/cache/thinking/billing telemetry remain **unknown** and are `null`, not estimated. One model at a time; quota or unavailability is recorded as availability loss, never scored as a quality failure, and never replaced by a paid fallback.

## Prompts and pair order

Two new fictional products, different in domain and fixtures from the teaching pairs (inventory, ceramics, chair joints, paper collection) and from the 2026-11-02 prompts (pressroom booking, listening room).

- `freight`: **Harbor Cold Chain** — consequential consignment release decision with numeric evidence, edit, failure and recovery.
- `archive`: **Lantern Slide Lecture Archive** — content/exploration surface with archival metadata, filter, detail and retained return.

Declared family overlap: `freight` overlaps operational decision work; `archive` overlaps collection exploration. These are not claimed as wholly unseen domains.

Counterbalanced dispatch order: `freight-R1`, `archive-R2`, `freight-R2`, `archive-R1`.

## Budget and stopping

Per cell: soft creator budget 8 minutes, hard 15 minutes. One targeted operator correction pass up to 10 minutes after automated checks. Hard full observable cycle 30 minutes per cell, excluding shared evaluator queue time. Named functional, factual or access blockers prevent acceptance; a budget stop is reported as a stop. Do not repeatedly restyle a passing result.

## Execute and retain

Preserve each creator's first runnable source as `initial/versions/00.html`; later disclosed self-corrections are numbered versions. `initial/index.html` is the submitted creator result. Root acceptance checks run separately and are hash-bound. Raw failures, harness errors, incomplete axe results and any operator correction are retained.

Checks per cell: entry/decision/edit/error/retry states where applicable, keyboard activation and focus, natural post-action scroll/focus, overflow and applicable axe findings at 320/390/1440. Capture natural viewport before any optional full-page image.

## Review

Two independent AI reviewers who authored none of the outputs receive one randomized-label packet per prompt with identical task facts, normal-render state scope, raw checks and anonymized source. They freeze task-quality and product-specificity judgments before unblinding. Ties and disagreements are retained; no aggregate score.

## Reporting boundary

Report task quality separately from product specificity. Authored studies stay separate evidence. No human/manual testing, accessibility-conformance claim, model ranking, uniqueness measure or end-to-end savings claim. Word counts are words, not billed tokens. LON-109, LON-99 and LON-95 remain separate broader work.
