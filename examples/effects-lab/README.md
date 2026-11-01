# Effect studies

Three original mechanism studies for TasteForge's [effect/composition reference](../../skills/tasteforge/references/effects-and-composition.md). These are bounded examples, not complete product templates, upstream-code imports or measured UX improvements.

From the repository root:

```bash
node examples/effects-lab/tools/serve.mjs
```

Open <http://127.0.0.1:4174>. The application has no package, external font, image service, library runtime or build dependency. Serve over HTTP for the JavaScript module. `study.svg` is an original repo-native illustration under this repository's MIT license, reused to compare frames and treatments.

## What to try

1. **Text:** replay a 420ms highlight on real Vietnamese text. Only the highlight moves; the words remain present and a static highlight remains afterwards.
2. **Layout:** switch grid/list. The same item nodes, names, order and control focus remain. Optional 280ms position transitions use the native Web Animations API; size changes apply immediately, avoiding scaled text. Unsupported animation or reduced motion still applies the view change.
3. **Image:** move a native range to compare colour/greyscale clipping of the same illustration. Keyboard and touch update the image, percentage and alternative text. The direct comparison still works when decorative previews are static.

“Static previews” cancels active decorative animation. An OS reduced-motion preference cannot be overridden by this demo. Preference changes and hidden-document changes cancel the lab's own animations. With JavaScript disabled, text/images/captions remain and optional controls are disabled. No effect autoplays or loops.

The marker concept was studied through [Colorion](https://text-effects.colorion.co/effects/highlighter-text-effect/); layout continuity through [Motion](https://motion.dev/docs/react-layout-animations), [GSAP Flip](https://gsap.com/docs/v3/Plugins/Flip/) and [Codrops](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/); image masking through [MDN clipping](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path). All implementation here is original. No source snippets, AI prompts, fonts or third-party media are bundled. The [research record](../../docs/effects-research.md) distinguishes documentation, source and actual rendering evidence.

## Actual verification

[Browser evidence](evidence/pass-01/browser.json) records 95 checks across 1280, 390 and 320px, with normal/reduced motion at each width, plus a 320px JavaScript-disabled capture. The 390px contexts have touch enabled and exercise the native range with a real touch tap.

Checks cover no autoplay, preserved text, overflow, keyboard activation/focus, stable item order, repeated view changes, bounded replay, interruption/preference changes, slider keyboard endpoints/touch, and no external requests/page errors. Selected axe rules reported no violations in the inspected settled states; incomplete checks remain in the JSON. This does not establish full accessibility, cross-browser compatibility, performance on target hardware or user comprehension. No user study or performance trace was performed.

The browser tools reuse the repository's existing pinned inventory QA dependencies. To reproduce in a fresh checkout:

```bash
pnpm --dir examples/inventory-workbench/tools install --frozen-lockfile
pnpm --dir examples/inventory-workbench/tools exec playwright install chromium
node examples/effects-lab/tools/check.mjs evidence/my-pass
```

Use a new evidence directory to preserve previous captures. The browser record contains source hashes. The [desktop](evidence/pass-01/1280-no-preference-initial.png), [narrow static](evidence/pass-01/320-reduce-settled.png) and [no-JS](evidence/pass-01/320-no-js.png) captures are real renders. Static screenshots cannot demonstrate animation quality or frame rate; use the running example for that inspection.
