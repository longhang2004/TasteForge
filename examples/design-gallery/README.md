# Annotated design decisions

Three actual repairs and one structural tradeoff, built from the preserved [inventory example](../inventory-workbench/README.md). The gallery explains task-specific evidence and retained choices rather than declaring a font, colour or card shape intrinsically wrong.

From the repository root:

```bash
node examples/design-gallery/tools/serve.mjs
```

Open <http://127.0.0.1:4175>. Choose a case, toggle annotations or activate a numbered outline to read its note. Each image links to the original PNG and recorded trace. The application needs only Node 20.19+ and a browser, with no build, external asset or runtime dependency. Its visitor purpose is reading/inspecting evidence; it is not an inventory product screen.

## Cases and evidence boundaries

| Case                         | Evidence                                                                                   | Decision / exception retained                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stock column meaning         | Actual 327px document at a 320px viewport, then separate labels without overflow           | Retain the table and explicit units for comparison                                                                                                                             |
| Visible recovery             | Retry was focused below the viewport; the later actual viewport exposes it after scrolling | Retain stock/quantity/consequence and the labelled coloured error indicator; scrolling itself is not a defect                                                                  |
| Return context               | Back to stock becomes Back to filtered stock                                               | Retain the single compact control and actual filter/search behaviour; avoid repeating a whole context panel                                                                    |
| Overview/detail relationship | Two working neutral prototypes with the same fixture                                       | The continuous option retains simultaneous overview; focused detail is selected for the example's mobile task. These are alternatives, not chronological before/after versions |

The annotations are agent-authored explanations, not output from an installed detector. Full-page and viewport captures are labelled separately; a full-page image does not prove an action was initially visible. `cases.json` records the image dimensions, viewport, scroll position and image/trace hashes. No screenshots, original UI sources, benchmark scores or trace files are modified or copied into this gallery.

The separate [inventory design review](../inventory-workbench/DESIGN_REVIEW.md) contains the actual execution checks and independent review/follow-up. These illustrative annotations do not establish user comprehension, speed, full accessibility or a general reduction in generic design. Human/user validation remains pending.

## Maintain and verify

```bash
node examples/design-gallery/tools/verify.mjs
```

This verifies all eight image/trace hashes, screenshot scope/dimensions and region bounds. If intentionally adding another evidence case, author the metadata, inspect the actual capture and run `tools/sync-evidence.mjs` to record its dimensions/hashes; inspect that change before accepting it. The helper reads evidence and updates only gallery metadata.

Optional browser checks reuse the pinned inventory QA dependencies:

```bash
pnpm --dir examples/inventory-workbench/tools install --frozen-lockfile
pnpm --dir examples/inventory-workbench/tools exec playwright install chromium
node examples/design-gallery/tools/check.mjs evidence/my-pass
```

Use a new output directory to preserve earlier captures. See [implementation/source notes](../../docs/impeccable-informed-workflow.md) for the skill changes and provenance. The conceptual teaching approach was informed by [Impeccable's Slop page](https://impeccable.style/slop/); no upstream images, annotations, code, skills or detector were imported.

The [recorded viewer check](evidence/pass-01/browser.json) contains 108 checks across 1280, 390 and 320px: all case deep links, image loading, scope labels, keyboard case/note navigation, annotation toggles, overflow and selected axe rules. No violations were reported in those viewer states; incomplete checks are retained. This tests the gallery, not accessibility/usability of text inside its screenshot images.
