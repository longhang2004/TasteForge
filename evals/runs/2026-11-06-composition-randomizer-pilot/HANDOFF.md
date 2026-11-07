# Cross-agent handoff — 7 November 2026

User requested moving unfinished work to Linear because weekly Codex quota is nearly exhausted. Stop implementation here. This branch is a **WIP checkpoint**, not an accepted pilot, merge or release. Canonical project/issue: TasteForge P-LON-8 / LON-99. Read the Linear handoff document linked from LON-99 for the current continuation queue.

## Source and scope

- Repository: https://github.com/longhang2004/TasteForge
- Branch: `codex/composition-aware-randomizer`, from main `98e1ebb18c9eb7f14887b095c86c66e3009b130f`.
- Windows workspace: `C:\Users\hi\src\personal_repos\TasteForge`; WSL: `/mnt/c/Users/hi/src/personal_repos/TasteForge`.
- Plan: `docs/superpowers/plans/2026-11-06-composition-aware-randomizer.md`; it still contains unchecked historical progress, so this handoff/evidence takes precedence over its stale checkboxes.
- No release/npm publication/main merge/global settings changes. Keep PR2 audit-import work (LON-98) and PR3 OpenCode host smoke (LON-95) separate.

## Implemented and previously verified

Twelve original composition cards/13 inspected inputs from three independent non-Bootstrap repository families, static gallery, six licensed local font specimens, knowledge0.1.1/38 font pairs (20 profiles unchanged), composition-first `inspire` output with task/density/complexity filters and soft title-family repeat penalty, relevant on-demand skill references and package smoke coverage. Imported MIT catalog remains642 records/18 sources, version2026.11.01.2. Skill entry remains unchanged.

Previous complete check passed57/57 tests plus build/typecheck/lint/format; packed offline smoke and skill validation passed. Raw records: `docs/evidence/composition-randomizer/`. Gallery final pass has25 checks/zero failures at320/390/1440 (`examples/composition-library/evidence/pass-03/report.json`). Font bytes/glyph/loading evidence and caveats live in `examples/composition-library/fonts/` and `docs/typography-expansion.md`. These results predate this handoff snapshot and do not mean final pilot acceptance.

Independent bounded source review found no demonstrated blocker; retained in `docs/evidence/composition-randomizer/source-review.txt`. It did not approve the fresh pilot. Known title classifier overlap: a future “Newspaper” title can match the earlier paper/tactile rule; no current catalog entry demonstrated that regression. Do not silently turn this into a measured visual-similarity guarantee.

## Frozen pilot — do not regenerate

`protocol.md`, `protocol.sha256`, `freeze.json`, `inputs/`, `conditions/` preserve exact baseline/candidate resources and two new fictional fixtures. Four initial UI outputs already exist under `outputs/<cell>/initial/`, with first-write sources and notes. All initial input-drift checks were empty. Baseline released ZIP hash: `c6d37cb585e6b02b4c9eb7c4eb36651b71422e404809a11c843c65ad76f94337`. Baseline release candidate6383a0b has the main98e1ebb tree. Candidate is bound by exact source/resource hashes, not by an inferred branch HEAD.

Creators were four fresh `gpt-6.1-sol` high Codex subagents. Order counterbalanced: proof baseline/cabinet candidate first, then proof candidate/cabinet baseline. Each initial creator had soft12/hard20 minutes, max35 tool calls; one parent correction allowance per cell soft5/hard8 minutes. Quota interruption is availability loss, not UI-quality failure. Continue an interrupted correction rather than rerunning initial generation; disclose a changed correction host/model. No OpenCode model concurrency or paid fallback.

### Last archived matched-v2 initial checks

| Cell | Pass/fail | Flow stops | Verified issues and limits |
| --- | --- | --- | --- |
| proofdesk-baseline |81/6|0|Queue heading/visible-label mismatch; stale live success after edit. Correction completed and archived under `corrected/`, but no final-v3 recheck yet.|
| proofdesk-candidate |69/9|3|Visible Open label mismatch; stale live success; Back-to-queue accessible name contains decorative arrow, stopping return/keyboard check. One image assertion was a harness false finding. Correction agent hit quota; working source changed, completion/verification unknown.|
| cabinet-candidate |57/9|0|Visible Open/Unpin label mismatch; active compare-button contrast1.53:1. Correction creator reported completion, but corrected archive and final recheck never ran.|
| cabinet-baseline |51/15|0|Visible Open/Unpin mismatch; active detail/error/comparison lack h1. Working source changed after correction dispatch; completion/verification unknown.|

These counts include repeated geometry/axe checkpoints, not distinct defect totals or human-usability scores. Initial reports retain actual failures. None had page errors, remote requests or measured horizontal overflow. See `evidence/harness-corrections.md`: first harness was premature on async outcomes and selected hidden media; v2 corrected most assumptions; final `tools/check.mjs` v3 also scopes the proof image to visible media. `check-first.mjs` and `check-v2.mjs` are preserved. Do not score obsolete harness assumptions as UI failures. The new v3 script was edited but **has not run**.

## Recover interrupted work without ignored scratch

`handoff-snapshot/2026-11-07/manifest.json` binds the actual working source/assets/notes from all four ignored `.tmp` cell directories. These are deliberately separate from immutable archived initial/corrected outputs. Snapshot source is **not certified complete or correct**. Preserve it before touching anything. Compare each working source with its initial/corrected archive and `corrections/<cell>.md`; only finish the already scoped correction. No new style direction or broader polish.

On the original machine, `.tmp/composition-pilot/cells/<cell>` may still contain the same source. On a fresh checkout, restore each working snapshot to that cell path, then add its frozen `tasteforge/` from `conditions/<condition>/tasteforge` and its reference files from `conditions/<condition>/<task>`. Use `inputs/<task>` for any missing unchanged brief/prompt/assets; verify hashes against `freeze.json`. The snapshot manifest records source and input drift.

Routine terminal must run Ubuntu WSL2 Bash; Windows shell is only launcher for `wsl.exe --distribution Ubuntu --cd <Linux-cwd> --exec bash -lc '<command>'`. Do not silently fall back to native PowerShell. Native tooling needs a concrete reason. Read AGENTS.md/status/branch first; preserve user changes.

## Exact continuation order

1. Confirm checkpoint/source manifests and actual correction state. Do not overwrite any archived output or report.
2. Keep proof baseline's existing corrected archive. Finish/check the other three scoped corrections from the working snapshots; append truthful correction notes. Provider quota/host changes must be recorded.
3. `python3 evals/runs/2026-11-06-composition-randomizer-pilot/tools/archive.py <cell> corrected` only if that corrected archive does not already exist. Archive helper expects the recovered `.tmp` cell path and checks frozen input drift. If another attempt is necessary, extend the helper with a new explicit stage/path rather than deleting prior output.
4. Run `node evals/runs/2026-11-06-composition-randomizer-pilot/tools/check.mjs <cell> corrected` for all four. It defaults to unique `matched-v3` report directories and refuses report replacement. Existing Playwright/axe come from `examples/inventory-workbench/tools/node_modules`; use its package lock/setup if absent. Record unresolved stops/axe findings honestly; don't promise manual accessibility certification.
5. Prepare randomized-label A/B packets from final same-harness outputs. Two independent reviewers have **not been dispatched**. Exclude treatment names/creator notes; provide identical facts/normal captures and separate task-quality/product-specificity judgments. Freeze reviews before unblinding; retain ties/disagreements and limits. Follow Spec07; no new model matrix.
6. Finish report/resources/gallery/index for this new run. Provider input/output/cache/thinking/billing and operator/reviewer tokens are unknown; `resources.json` currently has dispatch/archive timestamps, not full accepted-cycle cost. Quota pause spans must be explicit. No savings or model winner claim.
7. Finish docs/CHANGELOG/version wording, local links and full relevant check/package smoke. README's overview table still says32 font pairs and needs38; CHANGELOG Unreleased is empty; CLI wording and knowledge-version migration note need final consistency review. Existing maintained `examples/generated` was regenerated from the same context/direction/seed because knowledge0.1.0 DNA correctly fails against0.1.1; historical frozen evals were untouched.
8. Final independent branch/evidence review; commit/push follow-up; update LON-99 with actual results. LON-109 retains broader replication; LON-95 and LON-98 remain separate. Merge/release stays outside scope.

## Operational notes

Previous validation checkout: `/var/tmp/tasteforge-composition-20261106`; baseline engine: `/var/tmp/tasteforge-beta2-validation-20261103`. These are conveniences, not portable prerequisites. `.tmp/full-composition-check.sh` copies tracked source to Linux validation to avoid slow Windows-mount Node I/O. Rebuild from committed source when absent; do not rerun `freeze.py` after initial generation. Helper `prepare-inputs.py`/`freeze.py` preserve the actual preparation method but use original-machine paths.

Gallery viewing from repo root: `python3 -m http.server 4173 --bind 127.0.0.1`, then `/examples/composition-library/`. New pilot has no final gallery/index yet; use archived output paths over HTTP. Human/manual/native-speaker testing remains deferred. Passing technical checks does not establish human usability or uniqueness. Full previous temporary logs for the first lint/focused failure were lost across a quota pause; summaries explicitly distinguish observed transcript excerpts from retained raw logs in `validation-attempts.md`.
