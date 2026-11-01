# Inventory workbench

A runnable, agent-authored worked composition for TasteForge: compact stock comparison on desktop, focused item/review states on mobile, and retained context during edits and failure. This is an edited example with browser evidence, **not** a new blinded benchmark or a human-approved design.

From the repository root, serve the example with Node 20.19 or later:

```bash
node examples/inventory-workbench/tools/serve.mjs
```

Open <http://127.0.0.1:4173>. No application build, external fonts, images, network API or package installation is needed to run it. Serve over HTTP; opening the HTML as a local file does not support its module/fixture requests.

Development prototypes:

- <http://127.0.0.1:4173/prototype.html?layout=focused>: table beside detail on desktop, separate detail on mobile.
- <http://127.0.0.1:4173/prototype.html?layout=continuous>: comparison table above the decision at both widths.

Both use the same real fixture and interactions in neutral styling. The [UX plan](UX_PLAN.md) records the tradeoff. The [design review](DESIGN_REVIEW.md) connects actual captures, findings and revisions. The [composition record](composition.json) keeps authorship and review status explicit. Human approval and the [user study](usability-guide.md) remain pending.

Try LIN-115 with quantity 8. The first simulated save fails, then retry succeeds. Everything is in memory for the current page session; reloading resets it. No order is placed and the warehouse snapshot is unchanged. The fixture is byte-identical to the preserved Antigravity study; original cases, screenshots and ratings are not modified.

## Reproduce browser checks

The optional check tools have a separate pinned dependency lock. Install them and a supported Playwright Chromium in your development environment:

```bash
pnpm --dir examples/inventory-workbench/tools install --frozen-lockfile
pnpm --dir examples/inventory-workbench/tools exec playwright install chromium
node examples/inventory-workbench/tools/check.mjs evidence/my-pass
```

Verify that the checked-in final evidence still matches its tested source and the preserved fixture:

```bash
node examples/inventory-workbench/tools/verify.mjs
```

Use a new evidence directory for each pass. The check serves the application locally, executes the task at three widths, exercises both prototypes, saves screenshots, reports axe findings and hashes the tested source. Its exit status fails on task errors, overflow and reported axe violations. Automated results cover named states and operations, not complete accessibility or representative-user usability.

The recorded passes used already-cached dependencies and Chromium in Ubuntu WSL; no model call or live warehouse service is required for reproduction.
