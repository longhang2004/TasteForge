# Reference-led skill follow-up — 1 November 2026

This is one independent forward-test of the revised skill on the original fictional transfer task. It checks whether task/structure planning is actually used and preserves the resulting UI, source observations, plan, and browser evidence. It is **not a controlled benchmark** or a new rating of the original pilot.

The requested creator model is `gpt-6.1-sol`, matching original assisted case c02. The task, fixture, plain HTML/CSS/JS starter, and test hooks are copied unchanged. The revised skill and bounded read-only reference research are the new treatment. The creator receives no previous outputs or design feedback. Broader context/tool availability and a new stochastic generation prevent a causal improvement claim.

The original [eight-case pilot](../2026-11-01-ui-pilot/README.md), its skill snapshot, source, screenshots, and ratings remain unchanged. This run has its own frozen skill files and hashes in [manifest.json](manifest.json).

## Inspect

Serve the parent run directory so both the original and follow-up are reachable:

```bash
cd /path/to/TasteForge/evals/runs
python3 -m http.server 8766 --bind 127.0.0.1
# Open http://127.0.0.1:8766/2026-11-01-reference-followup/
```

Open the [comparison viewer](index.html), [observations and limitations](report.md), or submitted [UX plan](cases/r01/UX_PLAN.md). The operator did not repair the submitted UI or relabel the original ratings. Capture tooling is the same revised browser harness used for the pilot, at 1440 × 1000 and 390 × 844 with the same locale, time zone, light scheme, reduced-motion setting, and fictional data.

## Evidence boundaries

- `cases/r01/`: submitted source, `UX_PLAN.md`, implementation notes, and any retained CLI artifacts.
- `treatment/tasteforge/`: exact revised skill snapshot given to the creator.
- `evidence/r01/`: actual browser checks, screenshots, and submitted source hashes.
- `tools/`: pinned browser tools and the preserved capture harness.
- `manifest.json`: provenance, input/skill hashes, creator ID, versions, and known limitations.
- `comparison/`: unmodified copies of the original c02 screenshots, with their source and hashes recorded in `results.json`.
- `evidence/artifact-hashes.json`: hashes of submitted, captured, and published comparison artifacts; run `node tools/verify.mjs` to check them.

The CLI returned no compatible direction for Vietnamese plus system-only font delivery. The creator retained those constraints and used a documented manual visual treatment. Only `brief.json` and `config.json` exist in `.tasteforge`; no Design DNA or tokens were generated. The submitted `suggestions.json` is an empty failed-command output, not valid suggestion data. See the operator's separate CLI reproduction in `evidence/cli-suggestion-check.json`.

To reproduce browser evidence, install the isolated tools with `pnpm --dir tools install --frozen-lockfile`, ensure the pinned Playwright Chromium is available, and run `node tools/capture.mjs`. Regenerate the comparison using `node tools/build-comparison.mjs`, then validate it with `node tools/check-comparison.mjs` and `node tools/verify.mjs`. Browser screenshots may differ across operating-system font installations; do not overwrite preserved evidence without explicitly creating a new run.

Read source observations as docs/code/rendered evidence only as recorded by the creator. A plan, a different layout silhouette, or passing task/contrast checks does not prove better UX. Further independent human evaluation and repeated runs are still needed.
