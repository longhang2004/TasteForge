# TasteForge UI comparison pilot — 1 November 2026

This folder preserves an eight-UI pilot: two models × two product prompts × without/with TasteForge. Open the comparison gallery after serving the folder over HTTP; no UI build step or API key is needed.

```bash
cd /path/to/TasteForge/evals/runs/2026-11-01-ui-pilot
python3 -m http.server 8765 --bind 127.0.0.1
# Open http://127.0.0.1:8765/
```

The implementations, screenshots, source hashes, browser checks, anonymized reviews, and limitations are retained here so later visitors can inspect the actual evidence. This is an exploratory pilot, with one sample per condition for each model/prompt, not a statistical benchmark or guaranteed improvement claim.

- [Protocol](protocol.md): matched inputs, allowed treatment, rendering, review, and deviations.
- [Results and limitations](report.md), [per-dimension data](results.json), and [screenshot comparison](screenshots.md).
- [Manifest](manifest.json): model/condition mapping, input hashes, provenance, and tool versions.
- `cases/`: unmodified submitted UIs, implementation notes, and treatment artifacts.
- `evidence/`: screenshots, browser/task observations, accessibility checks, and source hashes.
- `reviews/`: independent anonymized reviewer inputs and outputs.
- `shared/` and `prompts/`: identical starters, fixtures, original product prompts, and common behavior contracts.
- `tools/`: isolated Playwright/axe capture tooling; not a core TasteForge dependency.
- `treatment/tasteforge/`: the frozen skill used for this run.

All shop, product, account, recipient, price, stock, and transfer details are fictional examples. No payment, message, or network API is invoked by the generated interfaces.

## Tooling and integrity

The UIs and gallery need only a static server. For optional browser recapture, the isolated tooling uses pinned Playwright and axe dependencies:

```bash
cd tools
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
node verify.mjs
```

`verify.mjs` checks matched task/fixture hashes, unmodified submissions and skill snapshot, screenshot packets, complete reviewer files, and gallery-state coverage. Captures and reviews in this folder are the preserved pilot evidence. Copy to a new run directory before regenerating screenshots or changing implementations; do not overwrite these examples and describe the result as the original run.

`capture.mjs`, `build-report.py`, `build-gallery.mjs`, and `check-gallery.mjs` record how the operator generated the evidence and viewer. Raw submitted cases and the frozen snapshot are excluded from root auto-format/lint to preserve their original bytes.
