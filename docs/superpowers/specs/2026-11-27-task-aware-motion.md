# 17 — Choosing motion for a change of view

Draft for [LON-104](https://linear.app/long-hang/issue/LON-104/rfc-task-aware-effect-selection-without-decoration-first-layouts), 27 November 2026. This is the effects RFC in [roadmap 15](2026-11-10-evidence-led-quality/15-future-rfcs.md).

## Decision

Keep motion selection in the optional skill guidance. For a change between Grid and List, a short position transition is a candidate when the same named items move and a reader might wish to follow one. Ship the immediate view change as the baseline. Both presentations should answer three questions at activation time: which view is selected, which items are present and where keyboard input goes next.

The worked task is to find **Cut lines**, switch to List and locate that same print again. The Effects Lab already has a runnable pair using the same three items, controls, illustration and source. A comparison can therefore hold content and control labels constant. The new browser sample establishes working controls and the local cost of switching. Whether readers find the print faster remains open. [Runnable study](../../../examples/effects-lab/README.md) · [Retained browser checks](../../../examples/effects-lab/evidence/pass-01/browser.json)

## Evidence behind the choice

| Source                                                                                                                                                                                                                                        | What it contributes to this decision                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Community discussion of conventional UI](https://www.reddit.com/r/UI_Design/comments/1w70kqb/question_about_websites_looking_like_ai_slop/) and the [existing source ledger, S02–S03](../../research/2026-11-10-copy-state/source-ledger.md) | People disagree on whether familiar treatments look generic. Reuse the question of purpose when reviewing an effect. Those comments supply no timing threshold or measured preference for transitions.                                        |
| [W3C explanation of SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)                                                                                                                                   | Interaction can trigger movement that a reader needs to disable. For this task the selected control and settled layout convey the complete result, so honor the device preference and the page's static setting. This criterion is Level AAA. |
| [Motion layout documentation](https://motion.dev/docs/react-layout-animations) and [animation rendering guidance](https://web.dev/articles/animations-guide)                                                                                  | Position transforms can show the relationship between two layouts. Measure the work around the switch as well as the nominal animation duration. The local example uses native browser APIs.                                                  |
| [Local mechanism and rights record](../../effects-research.md)                                                                                                                                                                                | The illustration and implementation are original project assets. The reference material informed the mechanism. No third-party animation code, media or font is needed to reproduce the pair.                                                 |

## How to choose and record a treatment

Start with the action verb, the information a reader needs afterwards and the identities present on both sides. Record the trigger, input devices, reduced-motion preference, available static cue, interruption behavior and observable cost. These are fields in a design note. A second reviewer should be able to reproduce the decision by performing the action once in each mode.

| Situation                                                                            | Decision                                                            | Evidence to inspect                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| The same named works move after a deliberate switch                                  | Offer one optional translation on displaced items                   | Exact same nodes and order, immediate selected-state update and a working second switch                                |
| A work is replaced, removed or reordered by a different action                       | Use the immediate update until the changed identities are explained | Names, counts, current sort and focus destination                                                                      |
| A filter has no results or a save fails                                              | Show the reason and recovery action as persistent text              | The current query or unsaved values survive, the recovery action remains reachable and the resulting state is truthful |
| Either motion preference requests a static view, or the animation API is unavailable | Apply the layout and pressed state immediately                      | Both buttons, names and resulting layout still make sense                                                              |
| A brief only asks for a more distinctive look                                        | Retain the existing view and controls                               | Seek a specific tracking or feedback problem before adding an effect                                                   |

For example, an editor could record: “When the reader selects List, keep Cut lines in the same sequence and keep focus on List. Translate its previous position to the new one once if the reader permits motion. Remove the translation if another switch arrives.” The same pattern would be a poor choice for a failed save. The user then needs to know which data survived and how to retry.

## Behavior and acceptance

1. **Activation.** Use named native buttons. Mouse, touch, Enter and Space should select the requested view. At return from the activation handler the selected button exposes `aria-pressed=true`, its peer exposes false and the list already has the target layout. Re-selecting the current view does no work.
2. **Continuity.** Reuse the same list nodes, accessible names and order. Apply final sizes immediately. The lab translates only displaced items using the previous and next positions. It uses 280 ms and one iteration. This value belongs to these three prints.
3. **Interruption.** During a switch back, cancel obsolete transforms and settle in the latest requested view. Keep both controls usable throughout. Recheck keyboard focus, selected state and item identity after a quick reversal. Disabling motion during a switch or hiding the page should cancel owned animation and preserve the layout.
4. **Fallback.** With reduced motion or static previews, create zero item animations. With JavaScript disabled, the three works and captions remain readable in the default layout, and unavailable controls are disabled. With JavaScript enabled and animation unsupported, switching still works.
5. **Cost.** For this fixture the budget is zero added dependencies, zero requests per switch, one transition per displaced item, at most three simultaneous item transitions and zero time waiting for animation before another action is accepted. For follow-up profiling, investigate a synchronous switch exceeding 16.7 ms on a named target device. This is a proposed investigation threshold for a 60 Hz display. A dispatch under that threshold still leaves style, paint and presentation work to assess.

The existing reduced-motion path still takes before/after geometry readings. A larger collection could make even the static path expensive. If a trace on a target device identifies that work as material, measure a static fast path that skips geometry reads before changing shared guidance. [Implementation](../../../examples/effects-lab/app.mjs)

## What was checked

The retained lab report covers 320, 390 and 1280 CSS pixels. It records keyboard focus, ordered item IDs, rapid changes settling on Grid, reduced motion, the no-JavaScript state and a touch-operated image slider. Its mid-animation device-preference check targets the text marker. An interruption of the grid transition by a device-preference change remains a separate check.

The new Chromium 156.0.8078.4 comparison used a 390 × 900 touch context and a 1280 × 900 desktop context. Each of the four combinations of width and motion preference started with a native List activation by tap or Enter. It then ran eight alternating programmatic switches, allowing each animation to settle between samples. It checked the requested view, the activated button's pressed state and the identity and order of the three original nodes synchronously after every switch.

| Width and preference | Correct switches | Item animations per switch | Median synchronous click dispatch |
| -------------------- | ---------------: | -------------------------: | --------------------------------: |
| 390, motion allowed  |              8/8 |                 2 × 280 ms |                           2.50 ms |
| 390, reduced motion  |              8/8 |                          0 |                           0.90 ms |
| 1280, motion allowed |              8/8 |                 2 × 280 ms |                           2.05 ms |
| 1280, reduced motion |              8/8 |                          0 |                           0.70 ms |

Timing spans the call to `button.click()` through its synchronous return in one headless browser run. Mode order was fixed. These timings describe this fixture on the test host. Device input latency, paint and frame pacing, physical touch ergonomics, assistive-technology use and human comprehension require other observations. [Raw observations](../../../evals/runs/2026-11-27-task-aware-motion/results.json) · [Replay script](../../../evals/runs/2026-11-27-task-aware-motion/compare.mjs)

From the repository root, with the [lab's existing browser dependencies](../../../examples/effects-lab/README.md#actual-verification) available:

```sh
node evals/runs/2026-11-27-task-aware-motion/compare.mjs
```

The script prints a new JSON sample to stdout. An optional argument selects an existing inventory QA `package.json` when its Playwright installation lives in a second checkout.

## Adoption and follow-up

Retain both presentations as authored examples. The immediate switch satisfies the task contract. The optional translation is a candidate for retaining orientation when individual items actually move. Keep the decision in the existing [effects reference](../../../skills/tasteforge/references/effects-and-composition.md). The evidence covers one layout choice and does not justify a catalog, randomized effects or a public API.

When the interaction next changes, check Space activation, the unselected peer, an immediate double switch by touch, a device-preference change during a grid transition, and the missing-animation-API path. Record which were exercised in a browser. Extend performance work only if a target collection or device has an observed problem. Escalate to a small task study if a product decision depends on whether people can relocate an item faster, using the same print names and a static comparison.
