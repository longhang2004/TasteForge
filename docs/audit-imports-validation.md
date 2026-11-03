# Bounded CSS import audit — acceptance evidence

Date: 2026-11-03. Issue: [LON-98](https://linear.app/long-hang/issue/LON-98/extend-audit-with-bounded-cross-file-tokenimport-resolution). Baseline: `98e1ebb18c9eb7f14887b095c86c66e3009b130f` (merged beta.2 source). Candidate branch: `codex/audit-cross-file-tokens`. This enhancement has no new release/version, npm publication or main merge.

## Result and reproduction

`audit --resolve-imports` follows the [bounded CSS subset](audit-imports-rfc.md) with entry contexts and source provenance. The default audit and strict legacy finding schema remain unchanged. The pure core accepts source strings; the CLI performs bounded local reads without loading application code or fetching stylesheets. Generator/DNA contracts are unchanged.

After `pnpm install --frozen-lockfile && pnpm build`, run the three commands in the [fixture README](../examples/audit-imports/README.md). Captured JSON reports:

- [Complete entry](evidence/audit-imports/complete-report.json): imports tokens and a component, reports the declared low-contrast pair and missing generic font fallback at the consumer's original locations, with definition provenance in `tokens.css`.
- [Partial entry](evidence/audit-imports/partial-report.json): conditional import stays unresolved; variable/fallback use stays review rather than yielding a verified pair.
- [Default audit](evidence/audit-imports/default-report.json): follows no imports, audits only the selected entry and adds no resolution metadata.

“Complete” refers to supported static resolution, not the effective browser cascade. Supplied DNA tokens are explicit context, not proof that a page loaded them. Directory selection treats every selected CSS file as a separate entry; select an entry file when that is the intended application context.

## Automated checks

Validation ran in Ubuntu WSL2, Node `v24.22.0`, pnpm `10.13.1`, using a sparse Linux checkout plus an explicit overlay of the changed files. [Input hashes](evidence/audit-imports/inputs.sha256) identify the source, tests and scripts tested. Historical frozen evaluations were not modified. The sparse checkout includes packages, tests, scripts, docs, skill source and generator/source examples; unchanged UI galleries and historical captures were not revalidated.

- `pnpm check`: build, typecheck, lint, format and **70 tests passed** across six test files. [Full log](evidence/audit-imports/check.log). The test phase took 54.84 seconds; that is not the duration of the whole development/acceptance cycle.
- New coverage: **19 core groups + 7 CLI groups**, alongside the previous 44 tests. Core coverage includes entry/shared contexts, aliases, fallback/provided/source provenance, conflicts, scoped/conditional/registered definitions, escaped constructs, incomplete graphs, cycles (including unused definition fallbacks), token adjacency, case handling, deterministic output and resource bounds. CLI coverage includes imported files outside the selected path but inside the project, generated-token imports, default JSON/exit compatibility, unchanged JSX behavior, remote/missing/conditional/excluded/escaping imports, linked selected paths and imports, FIFO rejection before open, and narrow-path budget errors. FIFO coverage is Unix-specific and skipped on Windows.
- `pnpm pack:smoke`: packed knowledge/core/CLI archives were installed in an isolated offline installation; existing commands and the new entry → imported consumer → token provenance path passed. [Log](evidence/audit-imports/pack-smoke.log). This proves local package behavior, not native agent-host discovery.

No dependency was added. Native Windows filesystem behavior and other Node versions were not rerun locally for this enhancement; branch CI uses the repository's Node 20/22/24/26 matrix.

## Review and corrections

One independent agent authored core tests and reviewed the resolver. Review found escaped-binding fallback, token concatenation, uppercase variable-function handling, dependency cycles/invalid grammar in unused definition fallbacks, case-sensitive excluded-directory checks and selected symlinks hidden by early canonicalization. These were corrected and covered by tests. The final bounded review found no remaining concrete false verified result in those fixes; this is not proof of complete CSS semantics.

[Development failure excerpts](evidence/audit-imports/development-failures.txt) retain the compile and escaped-at-keyword failures plus correction context. [Initial full-check failure](evidence/audit-imports/initial-check-failure.log) retains two lint errors subsequently fixed (control-character regex and missing explicit Buffer import). The [earlier targeted pass](evidence/audit-imports/targeted-tests.log) records 25 groups before the final FIFO test. These records are not rewritten as first-attempt success. No reviewer disagreement or tie was recorded in this bounded source review; no human/manual test was performed.

The first remote CI run also failed formatting after raw JSON reports were captured, because those reports were added after the sparse checkout's full check. The evidence directory is now excluded from Prettier, consistent with the repository's other raw-evidence directories; reports/timings and log whitespace are retained byte-for-byte. This correction changes formatting scope only. Remote run [41586021706](https://github.com/longhang2004/TasteForge/actions/runs/41586021706) preserves the failed attempt; later CI results belong to the corrected commit.

## Observed resources and limits

Run `node scripts/measure-audit-imports.mjs` after building. The [raw performance record](evidence/audit-imports/performance.json) contains eight actual calls, environment and graph counts: 128 files, 127 imports, one entry, 13,443 UTF-8 input bytes and 252 findings. Core parsing/resolution/report creation took **208.860 ms** on the first invocation after module loading; seven later calls ranged **58.467–113.392 ms** on this machine. Timings are observations, not a portable performance guarantee or acceptance threshold.

The measurement excludes module/process startup, CLI reads, agent generation, review, corrections and human acceptance. Total token usage, billing and end-to-end resource cost are **unknown**. No savings claim follows from these timings. Resource bounds are explicit in the RFC and result; over-budget inputs fail with narrower-path guidance rather than silently producing a complete report.

This increment adds source-audit utility. It includes no fresh UI generation or product-specificity study, and makes no new claim about visual quality, distinctiveness, usability or accessibility conformance. Full cascade, inheritance, selector matching, application-entry ordering, JavaScript/bundler graphs, Sass/Tailwind, CSS Modules and runtime rendering remain outside this resolver. Human/manual evaluation remains deferred.
