# Copy/state coherence increment — implementation record

Date: 2026-11-10. Status: implementation and scoped verification complete; draft PR #6 available for review. Design: [programme 08](../../superpowers/specs/2026-11-10-evidence-led-quality-design.md), WP-A/B. Baseline: `79820b58088245c32902d85cb0b2f14abd967aad`.

## Delivered scope

- [Source ledger](source-ledger.md): ten reused public-source entries with scope, lineage, rights and evidence limits.
- [Case bank](case-bank.md): twelve authored contextual cases across Decide/Work/Read/Explore, each with a legitimate counterexample, decision and proposed recheck.
- [On-demand copy/state reference](../../../skills/tasteforge/references/copy-and-state-coherence.md), routed from art direction and targeted refinement. The main skill entry is unchanged.
- [Retrospective](retrospective.md): actual inspection of six retained captures in two task families, with exact [file bindings](evidence.json).
- [Resources](resources.json): actual AGY categories and limitations, including later review attempts when present.

The skill exposes concise guidance; the research folder is not a runtime dependency or a compulsory reading path. The six CLI commands, strict inputs, generated data, package versions and historical fixtures remain unchanged. No registry helper, crawler, automatic classifier or new UI was introduced.

## AGY curation

One fresh read-only AGY CLI 1.5.3 context used `gemini-3.8-flash-high` at high effort over three exact public spec files. It returned eleven candidate cases. Its output was a secondary draft, not a fresh primary-source inspection.

Integration corrected imagined screens labelled as observations, removed invented upload limits, omitted additional unsupported WCAG claims and restored the distinction between W3C's informative Understanding pages and normative criteria. The final twelve cases use authored illustration labels and conditional consequences. This correction is evidence of a review step, not model agreement or measured improvement.

## Verification boundary

Existing repository/package checks, skill validation, source/package byte comparison and historical integrity checks are the relevant technical gates. New unit tests for prose-only edits would mirror wording rather than establish behavior. Available-source synthesis and retained-artifact inspection are the evaluation lanes; a fresh independent review also checks guidance application and claim discipline.

No fresh A/B generation or human recruitment is required for this increment. Full user comprehension, native-speaker quality, full accessibility, future-generation improvement and normalized/billed cost savings remain unassessed. Deferred human tasks are not relabelled Done.

## Execution decisions

The owner explicitly requested starting this increment, so the short implementation plan did not introduce another approval pause. The managed worktree uses Git Windows through WSL because its Git metadata contains Windows-native paths. A local ignored ledger is used because the generic POSIX helper does not resolve those paths. These choices affect workflow organization, not product behavior.

The primary agent integrated the dependent prose/routing changes to limit fresh contexts; AGY handled bounded public-source curation and a separate independent review. No new production functions or package dependencies were added.

## Results

- Full `pnpm check`: build, typecheck, lint and formatting passed; 57/57 tests in six files passed.
- `pnpm pack:smoke`: packed packages installed offline; init → suggest → generate → catalog → inspire → audit passed.
- Skill validation passed. All 24 skill files match source, build copy and actual CLI tarball bytes; the research corpus is excluded.
- Local links and ten selected evidence hashes passed. Historical verification preserved 110 frozen input bindings, eight review records and 782 final artifacts across four accepted cells.
- A first validation archive produced 161 baseline formatting warnings because Windows Git archive applied CRLF conversion. A command-local `core.autocrlf=false` archive was verified against raw Git blob bytes; the corrected Linux copy passed. No unrelated repository files were reformatted.
- [Fresh independent AGY review](independent-review.md): spec alignment Pass; quality Pass with minor notes; no Critical/Important findings. Four qualitative application answers align with the guidance; no matched trial or human result is claimed.
- The first Opus review invocation rejected an unsupported effort flag (6.043 seconds, no substantive review); one compatible retry completed in 208.751 seconds. Both attempts and original reported usage categories remain in resources.
- All six review packet files retained identical membership/bytes. The final skill/routing bytes match the reviewed public snapshot; a later addendum clarifies shared case lifecycle and records review metadata.
- Minor/limited observations: retry-lifetime copy is a future optional fixture change; broader rendered/accessibility/native-language checks remain unassessed. The external reviewer inspected no images. No visual/user benefit is inferred from technical or AI-review results.

## Delivery

[Draft PR #6](https://github.com/longhang2004/TasteForge/pull/6) is stacked on the specification branch from PR #5. Linear specs 08 and 11 link to the implementation record. The managed worktree is preserved for PR feedback; no merge or release occurred.

## Next decision

Review this small increment and its source/claim limits before merging. A future copy-only fixture edit could clarify the proofdesk retry's in-memory lifetime using R02's retention contract. Broad catalog ingestion, rendered annotations, effects, complete cost replication and human studies remain separate work packages, entered only for a named need.
