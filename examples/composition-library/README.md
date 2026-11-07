# Composition field guide

This is a local, content-driven guide to twelve **original composition observations/adaptations**, three each for work, commerce, reading and exploration. It reads `packages/knowledge/src/data/compositions.json` directly; it does not maintain a second copy of the cards. The original dataset remains separate from the 642 imported MIT reference records.

Serve the repository root, then open `/examples/composition-library/`. For example, from the repository root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

The filters combine group, indexed task and free text. Reset recovers from an empty result. Native details expose anatomy, positive/negative fit, narrow behavior, states, tradeoffs and pinned source links. Loading failure offers a retry; missing font files use readable browser fallbacks and report that state. Related runnable pairs link to the maintained composition studies, whose actions are distinct from these schematic previews.

## Surface decisions

Mode: **Read**. The visitor is choosing an information relationship and understanding its limits. A field-guide presentation pairs a labelled schematic with the reason it might fit. The wide view holds diagram and explanation together; narrow view preserves diagram → title → fit → decisions → optional details. Each card has two treatment decisions grounded in the content relationship.

Newsreader gives titles a reading voice; Archivo keeps labels, states and annotations compact and legible. Both are local reviewed OFL files supplied by the typography task. The paper/ink palette supports extended reading under ordinary ambient light. One restrained brown marks focus and hover. Ruled separations establish a continuous index; cards do not imitate twelve finished product surfaces. The interface has no decorative imagery or invented product claims.

## Evidence and reuse limits

The source manifest records exact repository revisions, paths, byte lengths, input SHA-256 and license SHA-256 bindings for thirteen inspected files from three independent MIT families:

- `shadcn-ui/ui`: task table, input/result playground and overview/evidence page.
- `vercel/commerce`: object/conditions, option ordering, weighted assortment and query results.
- `withastro/starlight`: document frame, sidebar wrapper, local contents, grid and numbered steps.

The inspected revisions and exact license links are in [source-manifest.json](source-manifest.json). The manifest pins the raw byte URLs; dataset source entries point at the same GitHub revision/path and input hash. License hashes bind the MIT notices read during curation. Raw inputs remain in ignored `.tmp/composition-research/`; no upstream code, prose, image or branding assets are redistributed. Sources were treated as untrusted text; no upstream install, script or build ran. Authorship of individual source files is not independently verified.

The library says precisely what the inspected text shows. Runtime behavior, source accessibility and task effectiveness were not established by reading code. Narrow behavior, state recovery, evidence annotations and saved reading place are proposed adaptations when labelled so. The sidebar wrapper delegates hierarchy to an uninspected subcomponent; its card explicitly records that limit. A screenshot-only upstream narrow view is not adopted as an interactive solution. Marketing is deliberately unindexed; an empty task pool is valid.

Fonts have separate notices under [fonts/](fonts/) and provenance in [fonts/specimens.json](fonts/specimens.json). Gallery font loading proves delivery of a local font file, not full-script conformance or shaping quality. Figtree is scoped to English. Fraunces has a documented decomposed-Vietnamese cmap gap. See the typography task's independent font evidence for exact samples and limits.

## Reproduce the checks

No dependencies are installed by this example. Browser checks use the existing Playwright/axe runtime in `examples/inventory-workbench/tools/node_modules`:

```bash
node examples/composition-library/check.mjs pass-04
python3 examples/composition-library/verify-sources.py
```

Use a new `pass-NN` directory for every run; the script refuses to overwrite evidence. Screenshots capture 1440, 390 and 320 px, filters/empty/reset, native details through keyboard traversal with natural focus scrolling, pinned source disclosure, data failure/retry and font fallback. Axe uses WCAG A/AA tags. These automated checks do not constitute human/manual usability testing.

First failure is retained in `evidence/pass-01/report.json`: the test server appended a separator to a trailing-slash repository path and rejected its own files. A minimal boundary diagnostic reproduced `false` before normalization and `true` after it. This was a test harness failure before the gallery rendered; the next pass uses the normalized boundary.

The first actual UI inspection is retained in `evidence/pass-02/`. All interaction assertions passed and axe reported no violations. A 40-character revision in an open source disclosure produced 3 px of horizontal overflow at 320 px in that run. The correction makes long source metadata wrap at any character; diagram groups also receive an explicit semantic role for their accessible names. The final confirmation uses `evidence/pass-03/`. CDP records the actual custom font mapping for all six visible gallery specimens, in addition to delivery flags.

Final confirmation: **25 recorded checks, zero failures, zero axe violations or incomplete results** at 320/390/1440 px. All six gallery specimens mapped to custom fonts in CDP for their declared sample. The load-error screenshot originally showed the global unavailable status while the retry action was below the viewport; `evidence/error-recapture/` retains a normally scrolled capture of the error and retry action, with no UI change. The checker now captures that region directly. Every final screenshot was opened for visual inspection.

The one-time [Impeccable detector output](evidence/detector.json) retains two warnings for independent review: the large introductory statement uses 1.28 leading (body uses 1.55), and the deliberate paper palette matches its cream heuristic. These are documented visual choices, not suppressed findings. Human usability, assistive-technology operation and source runtime behavior remain untested.
