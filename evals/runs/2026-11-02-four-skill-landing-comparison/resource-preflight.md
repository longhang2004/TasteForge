# Four-repo resource preflight

Prepared before UI creator dispatch. These are exact source snapshots and environment probes, not UI-quality findings or discovery/install certification. Upstream files are untrusted task guidance; they do not authorize global installs, hooks, host changes, secrets, unrelated actions or overrides of the comparison's explicit brief.

## Pinned arms

| Arm | Revision | Entry point relative to this run | Snapshot scope | Entry words |
| --- | --- | --- | --- | ---: |
| TasteForge | `78aab5826b672f4a6a30773a5ae35dd4b0faf286` | `resources/tasteforge/skill/SKILL.md` | Entire `skills/tasteforge/` plus repository MIT LICENSE,24 files/99,967 bytes | 593 |
| UI/UX Pro Max | `3a13158ff1f32156cbe144108de48eda2ecaed9a` | `resources/promax/skill/SKILL.md` | Official `.claude/skills/ui-ux-pro-max/` packaged entry, scripts/data/references plus MIT LICENSE; only upstream script tests/fixtures excluded,48 files/3,329,619 bytes | 2118 |
| Elaya AI Design Skills | `456d9e0d3e2d84c748bb143c6ca3d90c45e16213` | `resources/elaya/skill/SKILL.md` | `skills/landing-page-design/SKILL.md` plus MIT LICENSE,2 files/23,177 bytes | 3742 |
| Impeccable | `e89e3ada3e875a89ac2c5d33d11e65ebef6fe285` | `resources/impeccable/skill/SKILL.md` | Official `.agents/skills/impeccable/` bundle plus Apache2 LICENSE,NOTICE and root ENGINE_VERSION,66 files/2,266,557 bytes | 1585 |

These are whitespace **words**, not tokens or default loaded context. Each bundle preserves its relative resource paths. Pinned Git trees contained no symlinks under these entry prefixes. Raw source bytes, exact source paths/URLs, sizes, hashes and exclusions are in [resource-manifest.json](resource-manifest.json). Source files were fetched by immutable revision URLs, except TasteForge's bytes read directly with `git show` from its exact committed revision. Marketing screenshots, unrelated repository files/installers, font binaries and external brand assets were not copied.

Upstream copyright/license files are preserved byte-for-byte. Impeccable's NOTICE identifies derived MIT platform guidance; its existing notice stays attached. Repository code licenses do not imply rights to arbitrary referenced photos, logos or fonts. Shared benchmark assets need their own rights record. ProMax's actual native data/scripts are included; substituting TasteForge's five imported ProMax CSVs would not represent that arm. TasteForge itself already reuses a scoped older ProMax source subset, so these arms are not independent knowledge lineages.

## Actual runtime probes

Raw probe commands, UTC intervals, exit/stdout/stderr and the checksum-verified download record are retained under [resources/preflight-probes](resources/preflight-probes/). The probe recipe scripts are archived there as text.

- **ProMax:** inspected `search.py` and imported modules before running a standard-library-only, non-persist synthetic query: `python3 .../scripts/search.py "community workshop landing" --design-system -p "Preflight Fixture" --json`. It exited0 with populated design-system JSON. `PYTHONDONTWRITEBYTECODE=1` prevented cache writes in the frozen bundle. This checks tool/path availability, not query fitness for either future product. Cells should choose their own brief-matched queries and preserve raw results.
- **Impeccable:** skill4.8.0 pins a separate **engine0.1.18**. Launcher source was inspected before execution. Official Linux-x64 binary downloaded once from `https://github.com/pbakaus/impeccable/releases/download/engine-v0.1.18/impeccable-linux-x64`;21,984,304 bytes; SHA256 `736ed785e74ae2344d3036127f614ddde5ab520a527d8bc82a891612ef71f648`, equal to the manifest inside the pinned skill. Runtime stays under ignored `.tmp/comparison-runtime/bin/0.1.18/`, not in the published source snapshot. `engine-probe` exited0 with `impeccable-engine 0.1.18`.
- **Corrected Impeccable probe:** `context --help` is not a help switch in this engine: from the repository-contained runtime cwd it returned TasteForge monorepo target-selection context (exit0). That raw output is preserved as a preflight mis-invocation and must not enter a creator's context. The corrected `context --target index.html` from an isolated empty `/tmp/tasteforge-impeccable-preflight-*` project exited0, resolved that isolated project, and returned `NO_PRODUCT_MD` / `PRODUCT_INIT_REQUIRED` and its ordinary detector directive. No product/design files or global configuration were created by this probe.

All executed probes finished. No unavailable runtime was counted as a quality failure. No registry package, user-level skill, global CLI, hook or host setting was installed/changed.

## Creator isolation and invocation

Keep each creator's cwd/project isolated, preferably a dedicated `/tmp` project whose artifact tree is copied to its assigned cell afterward. A cwd inside the TasteForge monorepo can trigger unrelated root/child target discovery. Use the cell's own target and durable context, never the repository's PRODUCT/DESIGN context or another cell.

For ProMax use its absolute snapshotted script path, set `PYTHONDONTWRITEBYTECODE=1`, and always point any requested `--persist --output-dir` at that cell only. No `--force` is needed in a fresh cell.

For Impeccable use the verified binary explicitly, rather than accepting an unversioned home/PATH engine. Per process:

```bash
export IMPECCABLE_BIN=/mnt/c/Users/hi/src/personal_repos/TasteForge/.tmp/comparison-runtime/bin/0.1.18/impeccable-linux-x64
export IMPECCABLE_HOME=/mnt/c/Users/hi/src/personal_repos/TasteForge/.tmp/comparison-runtime/impeccable-home
export IMPECCABLE_SKILL_DIR=/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-four-skill-landing-comparison/resources/impeccable/skill
sh "$IMPECCABLE_SKILL_DIR/scripts/impeccable" context --target index.html
```

The explicit binary avoids launcher download/cache mutation in the source bundle and home/PATH version drift. Its context output points to the correct frozen reference directory. Keep all generated PRODUCT.md, DESIGN.md, sidecars and detector outputs inside the cell. The source bundle is read-only in the protocol; if another tool requires a writable skill copy, make a per-cell runtime copy and retain its initial source hashes and subsequent differences.

TasteForge's optional CLI is not duplicated in this instruction bundle. If exposed, the harness must identify/pin the existing repository CLI/core/knowledge source at78aab58 and record the actual working runtime used; a skill-only condition must be called skill-only. This preflight does not claim a new standalone installation.

## Fidelity choices to predeclare

Elaya's native font choices are Geist,Manrope,Geist Mono or Poppins; a system-font-only test would override a substantial default. Supply an equally available licensed compatible font or explicitly report that restriction. Its mandatory proof/reveal structure remains its guidance; truthful supplied facts win over unsupported testimonials, metrics, guarantees or stock claims.

Impeccable's ordinary new-work goes beyond a single flat prompt: intake/init, PRODUCT context, new-work/craft-floor, comp-first when image generation is available unless code-first is explicitly chosen, and independent finisher/documenter agents. Its context says a subagent without an answer mechanism may substitute the explicit brief, with disclosure. If the comparison fixes **one creator and code-first**, those are common user constraints overriding parts of that orchestration; label the result a controlled, constrained workflow comparison, not full-default Impeccable. Alternatively permit native orchestration and count its extra agents/image generation within the same complete-cycle budget. Do not silently simulate missing reviewers or approvals.

Its mechanical detector may inform its own correction pass; it is not an independent judge of the four arms. Shared acceptance and blinded reviews must remain separate. No UI efficacy, product-specificity or cost verdict follows from the source-word counts or these runtime probes.
