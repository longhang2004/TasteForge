# Explained task compositions

Four original teaching pairs, eight runnable task slices. Open [the gallery](index.html) through the local server. Both conditions in each pair use one [frozen fixture](fixtures.json), the same actions/constraints and the same assets. A competent conventional implementation is a valid choice; these studies do not establish an independent treatment effect.

From the repository root in Bash:

```bash
node examples/composition-studies/tools/serve.mjs 4180
# http://127.0.0.1:4180/examples/composition-studies/
```

Each slice is `study.html?case=operational|commerce|editorial|collection&condition=conventional|adapted`. The gallery supplies ordinary links. Only local JavaScript and system fonts are used. Stock, shop conditions, records and dates are explicitly fictional; no remote ordering, repair/safety assessment or real collection is implied.

## Choices and scope

| Case        | Changed relationship / consequence                                                                                                                                            | Where conventional remains useful                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Operational | Selected stock evidence/decision beside overview at wide widths; focused detail on narrow. Query, shortage filter, draft and trigger focus survive review/error/retry/return. | Continuous worksheet supports uninterrupted row scanning; focused narrow detail removes simultaneous comparison.            |
| Commerce    | Object schematic/specifications and purchase conditions form an object sheet with complete subtotal/shipping/total. Unavailable, invalid and retry states preserve choices.   | Familiar product split exposes specs/action earlier in the wide first viewport. Adapted title and visible terms cost space. |
| Editorial   | Numbered artifacts/captions/uncertainty attach to the relevant prose. Local reading place can be saved, replaced, resumed or cleared.                                         | A linear article preserves narrative rhythm; evidence spreads interrupt it. Not all notes fit in one natural viewport.      |
| Collection  | Indexed results expose material/scale before opening detail; search/type/order and trigger focus survive return.                                                              | Grid exposes more thumbnails at once. Metadata rows trade visual breadth for comparison facts.                              |

[Work/commerce notes](work-commerce-notes.md), [reading/collection notes](reading-collection-notes.md) and [independent AI study review](study-review.md) explain product decisions, evidence and limits. The reviewer authored the briefs but none of the UI; this authored-study review is not blinded. It is separate from the fresh pilot's two reviewers.

## Provenance and evidence

[Briefs](briefs.md) record facts, exact local source revisions, inspected primary references, observation vs inference and reuse boundaries. [brief-freeze.json](brief-freeze.json) pins briefs, fixtures and seven original SVGs before implementation. SVGs/code are original agent-authored repository work under MIT; no third-party images, fonts, marks or component code are copied. The operational facts reuse the maintained inventory fixture without rewriting that example or its evidence.

[Evidence gallery](evidence/index.html) links actual natural viewport captures, geometry, focus and raw reports. [acceptance.json](acceptance.json) binds the accepted report and image hashes to tested source hashes. The browser helper uses the existing Playwright/axe installation under `examples/inventory-workbench/tools`; it installs nothing:

```bash
node examples/composition-studies/tools/check.mjs NEW-PASS-NAME
node examples/composition-studies/tools/summarize.mjs ACCEPTED-PASS-NAME
```

Pass directories are exclusive and never overwritten. Early raw failures remain: pass01 server path normalization returned404; pass02 used an axe-incompatible convenience browser context; pass03 completed144 assertions/states but reported28 shared-navigation target-size findings. A subsequent shared-shell repair increases navigation hit areas and prevents the focused skip link covering navigation. Final acceptance is recorded by the hash-bound report, not inferred from these earlier attempts. Author probes are supplementary, with their own narrower scope and failures.

Widths320/390/1440 are provisional stress/representative checks. Keyboard activation, focus, applicable axe findings/incomplete scope, invalid/edit/error/retry and retained-return paths are automated evidence. Viewport screenshots preserve actual post-action scroll/focus before separately labeled optional full-page images. An action below the viewport requires scrolling; document presence does not prove simultaneous visibility. Color-contrast incomplete checks and other limits remain explicit in raw reports. Human/manual tests remain deferred; no usability, accessibility-conformance or uniqueness certification is made.
