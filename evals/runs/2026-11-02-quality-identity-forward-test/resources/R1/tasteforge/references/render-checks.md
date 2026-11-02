# Render only the states needed

Use existing project browser tests first. The optional `scripts/check-ui.mjs` helper reuses an installed Playwright; it never installs packages or browsers. Its initial-page runner checks document width, navigation HTTP errors and uncaught JavaScript errors, not a working task or accessibility conformance.

## Quick initial check

Start the project's local fixture/dev server, then run:

```bash
node /path/to/tasteforge/scripts/check-ui.mjs \
  --url http://127.0.0.1:4173 \
  --project /project/with/playwright \
  --out /new/evidence-directory \
  --widths 320,390,1440
```

The script path above is relative to the installed skill folder; the standalone skill keeps it in `scripts/`. Match widths to the product's supported minimum and relevant wide view; defaults are a starting point, not a universal support promise. Add `--full-page` only when below-fold material helps. `--axe` uses an existing `@axe-core/playwright` installation and records violations/incomplete findings separately.

Read compact stdout first. Exit0 means the requested initial checks found no reported issue, exit1 means findings, exit2 means unassessed/configuration/dependency failure. Reports and PNGs stay in the new output directory; existing output is refused. Missing tools and failed scans stay unassessed; axe incomplete findings remain review items even when executed checks pass. The runner accepts only loopback HTTP(S) start URLs and does not isolate application network requests.

## Capture actual task states

From an existing Playwright test, call the export after the real interaction and its readiness assertion:

```js
import { captureCheckpoint } from '/path/to/tasteforge/scripts/check-ui.mjs';

await page.getByTestId('retry').click();
await page.getByRole('status').waitFor({ state: 'visible' });
const { report } = await captureCheckpoint(page, {
  outputDir: '/new/task-evidence',
  label: 'after-retry-mobile',
  feedbackSelectors: ['[role="status"]'],
});
```

It captures the current natural viewport first, including scroll/focus metadata and feedback geometry, without moving the page to the top. Optional full-page capture has a separate scope. Labels are simple names; repeated labels and traversal paths are rejected. Partial failure artifacts remain available.

The report does not extract input values or body text. Geometry-based visibility does not prove absence of occlusion or good focus order. Assert the actual task, expected data, edit/error/retry and relevant keyboard behavior in the project test; a checkpoint only records the reached state. Use meaningful text/labels to assess cost, consequence and source-grounded copy. Open full evidence only for failed gates or a concrete design question.
