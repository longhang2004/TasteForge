# Composition-aware inspiration implementation plan

> For agentic workers: implement the approved increment in this session, using bounded delegation for independent curation and a final independent review. Preserve raw evidence and update this progress record.

**Goal:** Give TasteForge more useful composition/type choices and explainable seeded inspiration, demonstrated in a gallery and a small fresh paired UI trial.

**Approved scope:** User accepted the preceding proposal on 6 November 2026: learn remaining Impeccable decision practices, roughly twelve composition cards across work/commerce/reading/exploration, review typography gaps, improve conditional randomization, then compare two new matched briefs (four outputs). Existing Linear LON-99 owns this increment; LON-109 retains broader replication. Spec02 and Spec07 remain the provenance/evaluation constraints.

**Architecture:** Add an original, versioned composition library beside the unchanged imported MIT catalog. `inspire` selects task-matched compositions before reference treatments, exposes fit/limits, and reduces repeated visual families. Keep `suggest/generate` schemas and hard filters; expand their font metadata only with reviewed compatible pairs. Gallery previews teach anatomy rather than claiming twelve tested production flows.

**Stack:** Existing TypeScript/Zod/Vitest, Python standard-library curation helpers, static HTML/CSS/JS and existing Playwright/axe. No new runtime dependency or host configuration.

## Constraints and review focus

- Preserve historical runs, main, release and other branches/PRs. Routine terminal work uses Ubuntu WSL2 Bash.
- Treat external source as reference data; record exact paths/revisions/hashes, observations and unknowns. Original summaries do not redistribute upstream text/code/assets. Font files need their own licenses/notices.
- Preserve protected systems, allowed/excluded directions, language/delivery/density/contrast/complexity constraints and all ten baseline gates. An empty composition pool returns null with reasons.
- Imported style references do not become validated token profiles. Composition fit and visual-family labels are editorial heuristics. Seed reproducibility is versioned, not a claim of model determinism.
- Test meaningful behavior: mismatched tasks, constrained/empty pools, reordered inputs, repeated families, language/delivery restrictions and packed offline resources.
- Inspect gallery and fresh UIs at 320/390/1440 with natural focus/scroll, relevant states and keyboard/axe. Preserve failures/corrections. Human/manual tests remain deferred.
- Freeze candidate and both fresh inputs before creators; same available model/host/tools per pair, counterbalanced treatment order, one targeted correction allowance per cell. No paid fallback or OpenCode model concurrency.
- Report task quality and specificity separately; retain ties/disagreement. Provider/operator/reviewer telemetry gaps and full billed costs stay unknown.

## Tasks and interfaces

### 1. Curate composition data and reviewable gallery

Files: `packages/knowledge/src/data/compositions.json`, `packages/knowledge/src/compositions.ts`, `examples/composition-library/`, provenance/coverage notes.

Dataset interface: `{schemaVersion:'1.0',version,reviewedAt,sources,entries}`. Sources carry `id,title,url,pinnedUrl,revision,path,inputSha256,license,licenseUrl,observed,notObserved,rights`; no copied source text. Entries carry `id,title,group` (work/commerce/reading/exploration), `family,tasks,tags,density,complexity,suitableFor,avoid,anatomy,narrow,states,artDirection,tradeoff,sourceIds`. Lists of fit/avoid statements are curator advice, not automatic factual prerequisites. Maintain references for at least three independent source families beyond the existing Bootstrap observations. Use only genuinely inspected sources.

- [ ] Curate approximately twelve distinct information relationships; preserve positive/negative fit and observed versus proposed behavior.
- [ ] Build schematic anatomy previews, filters and source/terms details, linking existing runnable studies. Show typography specimens from Task 2 without blocking if delivery is unavailable.
- [ ] Validate source/hash bindings and gallery accessibility, widths, filters/empty/reset and keyboard paths; capture evidence.

### 2. Review typography gaps

Files: `packages/knowledge/src/data/knowledge.json`, `examples/composition-library/fonts/`, typography evidence/notes. Keep the existing strict font-pair schema. Add only a small reviewed set (target six new families/pairs if justified), associate them with appropriate existing styles, and bump knowledge data version. Do not change the package/release version.

- [ ] Inspect pinned Google Fonts metadata, exact font-file hashes, language coverage and family licenses; retain required notices with gallery-only files.
- [ ] Exercise sample Vietnamese glyphs and actual browser loading/fallback; distinguish metadata/cmap/render checks from full script conformance.
- [ ] Verify added pairs are reachable, system-only/fixed-font constraints remain strict and packed generation uses metadata without fetching fonts.

### 3. Implement explainable composition-first inspiration and skill routing

Files: knowledge composition schema/export; core `references.ts`; focused tests; optional package export; relevant skill references/workflows; catalog docs and package smoke.

`inspire` keeps existing fields and adds `selectionVersion`, `compositionLibraryVersion`, per-pack `composition` (entry or null), visual family and selection explanations/limits. Optional injected composition data enables real empty/reorder/filter tests. Compositions are selected by task, density and complexity; relevance uses brief/query metadata. Avoid repeating a composition while eligible alternatives remain. Style sampling keeps source-size balancing and adds a soft repeat-family penalty; labels/weights are disclosed. Legacy `template` remains separately attributed and may be null.

- [ ] Write/run failing behavior tests for additive composition selection, null pools, task/constraint preservation, deterministic reordered data and diversity behavior.
- [ ] Implement the smallest schema/selector changes; run focused and full checks.
- [ ] Update on-demand references to explain content→relationship→treatment→type roles, preserving proportional workflows and one creator. No mandatory browsing/plan/prototype for Fast.

### 4. Freeze and run two-brief/four-output pilot, review and deliver

Files: new `evals/runs/2026-11-06-composition-randomizer-pilot/`, docs, Linear evidence links.

- [ ] Freeze exact beta.2 baseline and candidate manifests, two new tasks/fixtures/assets, provider/tool budget and matched acceptance checks before creators. Trial must actually expose the compared reference resources; record retrieval usage.
- [ ] Retain four fresh first outputs and any one-pass corrections, browser evidence and observable creator/check/correction resources.
- [ ] Obtain independent randomized-label task/specificity judgments, freeze before unblinding and retain disagreements/limits.
- [ ] Run repository/package/skill/gallery checks and final independent branch review. Fix demonstrated blockers, report remaining limits, update LON-99/LON-109 without closing broader work, commit/push a reviewable branch/PR. No merge/release.

## Progress

- Baseline: fetched origin/main `98e1ebb18c9eb7f14887b095c86c66e3009b130f`; clean original checkout on `codex/opencode-vilao-ui-smoke`. Created independent `codex/composition-aware-randomizer` from main. No AGENTS.md found; user-supplied terminal instructions apply.
- Ruling: use the clean current checkout and a dedicated branch; no extra worktree or global settings are needed.
- Baseline verification: pending.
