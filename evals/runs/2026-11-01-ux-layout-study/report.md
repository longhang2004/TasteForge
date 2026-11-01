# UX/layout comparison: findings and limits

Twelve fresh UIs were built for three fictional tasks by two requested creator models, with/without the frozen current TasteForge skill. Two independent AI reviewers inspected neutralized layouts before seeing authored visual treatments. This is a small exploratory comparison: one generation per model/task/condition, six heterogeneous paired blocks, no representative users or population-level improvement estimate.

**There is evidence of localized improvement in decision grouping and task flow, but no reliable demonstration that layout has escaped generic composition.** Both reviewers favored decision context in multiple pairs even before authored visuals. Mobile evidence is mixed, including one regression and a real 320px overflow. Familiar product/form/list-detail shells remain common. Conventional patterns can serve the task well; novelty or resemblance alone does not establish UX quality or AI authorship. No overall taste score is calculated.

The strongest concrete difference is Sol inventory u07: mobile replaces the list with focused detail/review and shows retained filter/search context; baseline u01 keeps the list above the decision, requiring a longer route down the page. Both remain conventional list/detail structures and pass the same scripted task. Sol transfer u11 keeps cost/consequence information near review, but still overflows at 320px. Luna inventory requires special caution: the neutralizer hid a visible baseline row, inflating an apparent benefit; that block is excluded from the sensitivity interpretation below.

Open the [paired gallery](index.html), [frozen protocol](protocol.md), [raw ratings](reviews/ratings.csv), [machine-readable results](results.json), and [harness corrections](harness-notes.md). Gallery defaults to neutralized layouts with condition labels hidden; reveal authored renders and conditions deliberately.

## Paired neutral-layout judgments

Entries are **current skill minus no skill**, kept separately for each reviewer. Positive means a higher score on that dimension in that one block. These ordinal differences are descriptive, not calibrated effect sizes or statistical significance.

| Model | Task | Reviewer | Entry priority | Decision context | Narrow context | Recovery flow | Composition purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gpt-6.1-sol | commerce-craft | r1 | +0 | +1 | +1 | +0 | +0 |
| gpt-6.1-sol | commerce-craft | r2 | +0 | +1 | +0 | +0 | +1 |
| gpt-6.1-sol | fintech-transfer | r1 | +0 | +1 | +1 | +0 | +1 |
| gpt-6.1-sol | fintech-transfer | r2 | +0 | +1 | -1 | +0 | +0 |
| gpt-6.1-sol | inventory-triage | r1 | +0 | +0 | +1 | +0 | +0 |
| gpt-6.1-sol | inventory-triage | r2 | +1 | +0 | +0 | +0 | +1 |
| gpt-6-luna | commerce-craft | r1 | +0 | +1 | +0 | +1 | +1 |
| gpt-6-luna | commerce-craft | r2 | +0 | +1 | +0 | +1 | +0 |
| gpt-6-luna | fintech-transfer | r1 | +1 | +0 | +1 | +2 | +0 |
| gpt-6-luna | fintech-transfer | r2 | +1 | +1 | +1 | +1 | +1 |
| gpt-6-luna | inventory-triage | r1 | +2 | +0 | +1 | -1 | +1 |
| gpt-6-luna | inventory-triage | r2 | +2 | +1 | +2 | +0 | +1 |

Direction counts across six blocks, with each dimension/reviewer retained:

| Reviewer | Dimension | Higher | Tied | Lower | Unassessed |
| --- | --- | --- | --- | --- | --- |
| r1 | entryPriority | 2 | 4 | 0 | 0 |
| r1 | decisionContext | 3 | 3 | 0 | 0 |
| r1 | narrowContext | 5 | 1 | 0 | 0 |
| r1 | recoveryFlow | 2 | 3 | 1 | 0 |
| r1 | compositionPurpose | 3 | 3 | 0 | 0 |
| r2 | entryPriority | 3 | 3 | 0 | 0 |
| r2 | decisionContext | 5 | 1 | 0 | 0 |
| r2 | narrowContext | 2 | 3 | 1 | 0 |
| r2 | recoveryFlow | 2 | 4 | 0 | 0 |
| r2 | compositionPurpose | 4 | 2 | 0 | 0 |

Reviewers differed on **17 of 60 case/dimension cells**. Original scores and explanations remain unchanged. Authored-stage notes are appended separately; no retroactive neutral-score adjustment or silent reconciliation was performed. Concrete judgments and caveats are below; full evidence is in each reviewer JSON.

### Neutralization artifact and sensitivity check

Both reviewers found the LIN-115 row blank in neutral view-01 (u10). **It is visible in the authored UI.** The generic neutral CSS made a previously transparent positioning span white, obscuring the row. Both authored-stage notes identify this distortion. The original neutral scores are retained, but that apparent blocker is not an authored app failure and cannot support a treatment benefit.

As a clearly labeled **post-hoc sensitivity check**, omit the entire Luna/inventory block rather than selectively changing scores. The remaining five blocks still show decision-context improvements for r1 in 3/5 and r2 in 4/5, with the rest tied. Narrow-layout judgments differ: r1 higher in 4/5, tied in 1; r2 higher in 1/5, tied in 3, lower in 1. That disagreement rules out a blanket mobile-layout claim. Composition-purpose improvements are 2/5 for r1 and 3/5 for r2, with remaining blocks tied: limited evidence of purposeful grouping, not a wholesale structural transformation.

| Reviewer | Dimension | Higher | Tied | Lower |
| --- | --- | --- | --- | --- |
| r1 | entryPriority | 1 | 4 | 0 |
| r1 | decisionContext | 3 | 2 | 0 |
| r1 | narrowContext | 4 | 1 | 0 |
| r1 | recoveryFlow | 2 | 3 | 0 |
| r1 | compositionPurpose | 2 | 3 | 0 |
| r2 | entryPriority | 2 | 3 | 0 |
| r2 | decisionContext | 4 | 1 | 0 |
| r2 | narrowContext | 1 | 3 | 1 |
| r2 | recoveryFlow | 2 | 3 | 0 |
| r2 | compositionPurpose | 3 | 2 | 0 |

This omission was not preregistered and is not a new controlled estimate. It prevents a known rendering artifact from being advertised as a UX gain. The bad neutral packet, raw scores and authored corrections remain available for audit.

## Actual scripted task and accessibility evidence

Contract/execution counts exclude diagnostics; the commerce shipping-inclusive total is a contract check in this study. Columns show desktop / mobile. An axe count is the number of initial violating rules, not affected nodes, task failures or a complete accessibility judgment. Incomplete axe checks require review too.

| Case | Model | Task | Condition | Task checks, wide / narrow | Initial axe rules, wide / narrow | Initial document width at 320px | Failed technical diagnostic |
| --- | --- | --- | --- | --- | --- | --- | --- |
| u01 | gpt-6.1-sol | inventory-triage | no-skill | 19/19 / 19/19 | 1 / 1 | 320 | — |
| u02 | gpt-6.1-sol | commerce-craft | no-skill | 7/7 / 7/7 | 1 / 1 | 320 | — |
| u03 | gpt-6.1-sol | commerce-craft | current-skill | 7/7 / 7/7 | 0 / 0 | 320 | — |
| u04 | gpt-6-luna | commerce-craft | current-skill | 7/7 / 7/7 | 0 / 0 | 320 | — |
| u05 | gpt-6-luna | commerce-craft | no-skill | 7/7 / 7/7 | 1 / 1 | 320 | — |
| u06 | gpt-6-luna | fintech-transfer | current-skill | 18/18 / 18/18 | 1 / 1 | 320 | — |
| u07 | gpt-6.1-sol | inventory-triage | current-skill | 19/19 / 19/19 | 0 / 0 | 320 | — |
| u08 | gpt-6.1-sol | fintech-transfer | no-skill | 18/18 / 18/18 | 1 / 1 | 320 | — |
| u09 | gpt-6-luna | fintech-transfer | no-skill | 18/18 / 18/18 | 2 / 2 | 320 | — |
| u10 | gpt-6-luna | inventory-triage | no-skill | 19/19 / 19/19 | 1 / 1 | 320 | — |
| u11 | gpt-6.1-sol | fintech-transfer | current-skill | 18/18 / 18/18 | 0 / 0 | 342 | — |
| u12 | gpt-6-luna | inventory-triage | current-skill | 19/19 / 19/19 | 1 / 1 | 320 | Required item selection hook exists, Required item selection hook exists |

The shared scripts exercise explicit costs and quantities, prohibited selections/bounds, review, edit/data retention, simulated first failure, retry and clear outcome. Inventory includes no-results recovery and preserving search/filter context. This verifies those interactions under scripted actions; it does not measure comprehension, confidence, task time, repeated expert work or screen-reader use. The 320px check is initial-page supporting evidence only, not a full 320px task flow or zoom study.

All initial 390px pages fit the document width. u11 still overflows at the supporting 320px width (342px document); passing at 390px is insufficient. u12 omitted the dedicated item-selection hook; its row-based user task was exercised with a documented fallback, while the diagnostic remains failed. Several cases retain contrast and, in u09, label findings. No accessibility conformance claim is made. Reviewers' aesthetic preference cannot override these implementation issues.

## What reviewers actually observed

### commerce-craft

**u02 — gpt-6.1-sol, no-skill.**
- r1: Conventional image-and-purchase layout is useful here, with meaningful stock and cost detail; restrained familiarity is not itself a defect. Authored effect: helps. Strong selected option border plus check, named colored swatches and faded unavailable Ash clarify the glaze state. A dark full-width Add visibly completes the subtotal/shipping/total sequence. Serif title changes presentation without changing the task hierarchy; small returns/care text and long mobile route remain essentially the same.
- r2: The familiar product split supports the task; the specific stock, shipping and care details matter more than novelty. Authored effect: helps. A border and pale fill identify the selected glaze, with labeled colored swatches and a dark add button; item total remains above delivery and returns, which still follow the action.

**u03 — gpt-6.1-sol, current-skill.**
- r1: This conventional product layout earns its clarity through the ordering of terms, explicit selected state and factual detail, not through stylistic novelty. Authored effect: helps. Selected glaze now combines radio, heavy border and tinted background with named colored swatches; Ash is visibly unavailable. Filled Add is a clear endpoint after delivery, returns and bold shipping-inclusive total. Serif headline retains the same readable product/price relationship on mobile. The long image-first page and lower material/care position remain unchanged.
- r2: The familiar product split serves comparison and purchasing well; its usefulness comes from the specific stock and policy information. Authored effect: helps. Selected glaze has a dark border, tinted background and radio indicator; the dark cart button clearly follows the delivery, returns and total. Mobile retains the same long image-first ordering.

**u04 — gpt-6-luna, current-skill.**
- r1: Familiar product-page structure serves this task; specific stock, shipping total, care and returns carry the usefulness rather than novelty. Authored effect: helps. Named colored glaze swatches, a dark selected border/background and hatched unavailable Ash make variant selection easier to interpret. Dark filled Add clearly follows the visible shipping-inclusive total. Serif headings change the craft character without reducing practical detail readability; mobile purchase controls remain far down the image-first page. The teapot illustration remains Iron-looking when Sand is selected, so swatch state is the useful cue rather than a product preview.
- r2: A conventional product page is appropriate; the object illustration and concrete care facts give it task relevance. Authored effect: helps. The chosen glaze has a distinct border, unavailable Ash has hatching and text, and the filled selection button is conspicuous. Returns remain in the lower details section after the action.

**u05 — gpt-6-luna, no-skill.**
- r1: Familiar product composition is suitable, but craft-like labels do not substitute for readily readable delivery, care and returns. Neutralization may obscure selected styling. Authored effect: mixed. Dark selected glaze border and colored named swatches resolve the weak neutral selected-option appearance, and filled Add becomes easy to identify. However small uppercase glaze/selected-name labels and stock details are pale; delivery/care remain collapsed and their disclosure glyphs still look like tiny unresolved marks. Visual craft character changes more than purchase-condition discoverability.
- r2: A standard product-image and purchase-panel layout fits the task; illustration and factual dimensions tie it to the object. Authored effect: mixed. A dark outlined selected glaze and filled add button improve action and selection recognition, while small muted labels, stock and disclosure are harder to read. Delivery and returns remain collapsed below add.

### fintech-transfer

**u06 — gpt-6-luna, current-skill.**
- r1: Conventional panels and edit/review flow work well; implementation-oriented demo explanation is less useful than the actual recipient and cost summary. Authored effect: helps. Filled navy Review/Confirm actions clearly separate commitment from the underlined Edit link. Tinted recipient and blue received-amount panels aid scan order while total debit stays distinct. Mobile name and monetary values remain legible; currency-prefix spacing and the nonessential demo-mechanics sidebar remain as observed structurally. No authored failure image is provided.
- r2: Conventional form and summary panels are appropriate to a transfer; task-specific values make their purpose clear. Authored effect: helps. Filled navy review and confirm buttons stand out from the form; shaded recipient and received-amount blocks help scan the desktop review. The mobile estimate remains below the form.

**u08 — gpt-6.1-sol, no-skill.**
- r1: A standard form-and-summary layout fits transfer review, but needs deliberate mobile ordering rather than simply stacking its desktop columns. Authored effect: mixed. Filled green Review/Confirm actions are more clearly actionable than neutral text, and pale green summary with a white received-amount inset separates cost context from editing. Recipient, debit and received values remain legible. Mobile still stacks the summary after Review, so styling does not resolve verification order. Small muted delivery qualifier and simulation/helper text lose reading strength.
- r2: A familiar form and summary split is suitable; the mobile order weakens the intended cost check. Authored effect: mixed. A filled green confirm button and tinted cost panel distinguish action from summary; on mobile the summary still follows the first-step action and the captured desktop review separates cost from confirmation. Some supporting text is faint.

**u09 — gpt-6-luna, no-skill.**
- r1: A familiar stepper and review card would fit well, but the observed Complete/error contradiction and data layout matter more than the generic reassurance styling. Authored effect: mixed. Filled green actions and tinted fee/received-value regions make the next step and monetary sections easier to find. Serif confidence text changes tone but does not reduce the large headline/sidebar footprint. Small pale hints, summary labels and simulation footer become harder to read. No authored failure screenshot is supplied to establish whether the neutral Complete/error contradiction or concatenated retained details looks different with styling.
- r2: A familiar stepper and review form are suitable; the generic reassurance is less useful than the transaction details. Authored effect: mixed. Green filled review and confirm actions are easier to identify and tint separates recipient and received amount. Small pale helper and summary labels are visually subdued, while the large slogan still precedes the task.

**u11 — gpt-6.1-sol, current-skill.**
- r1: Common form-and-breakdown composition is particularly well aligned to checking recipient and total; no novelty is needed for that benefit. Authored effect: helps. Dark filled Review/Confirm actions and outlined Edit establish an unambiguous action hierarchy. The VND amount sits in a green-tinted inset, giving the received value a stronger separate reading target while total debit remains bold above. Recipient text and mobile cost-before-action order remain clear; authored styling does not remove long scrolling or establish 320px success.
- r2: Standard transfer panels are justified by the distinct identity and cost checks, regardless of visual novelty. Authored effect: helps. Green action buttons and a tinted received amount establish a clearer action and calculation hierarchy; the mobile stack still places review below the breakdown.

### inventory-triage

**u01 — gpt-6.1-sol, no-skill.**
- r1: Standard master-detail structure fits the warehouse task; explicit units and incoming values justify the row design, while mobile length is its main tradeoff. Authored effect: mixed. Orange/green status badges and a green edge/tint on the selected row improve rapid scanning without replacing labels. Review quantity is isolated in a tinted panel and dark Record is primary beside Edit. Muted explanatory text and operational metadata are lighter than neutral; mobile retains the same long list-before-review structure.
- r2: A conventional list-detail workspace fits the operator's task and provides meaningful stock evidence rather than decorative dashboard metrics. Authored effect: mixed. Orange shortage badges and a tinted selected row make triage and selection easier to scan, with text labels reinforcing status. Muted helper and stock metadata appear light.

**u07 — gpt-6.1-sol, current-skill.**
- r1: Conventional master-detail composition is well matched to inventory inspection, with a purposeful mobile replacement and retained list context. Authored effect: helps. The selected LIN-115 row gains a blue edge and pale fill, shortage quantities use orange text while retaining explicit labels, and blue Save is clearly primary beside outlined Edit. Text and original mobile wrapping remain readable. The unexplained '3 items' beside the filter still competes with the list count; styling does not settle that meaning.
- r2: Conventional list-detail navigation is task-fit; the retained filter summary makes the narrow transition meaningful. Authored effect: helps. Blue selected-row tint and filled save button clarify the active item and primary action; orange shortage text supplements explicit numeric labels. The mobile list retains its compact ratios.

**u10 — gpt-6-luna, no-skill.**
- r1: Conventional master-detail inventory is appropriate; the concern is the observed missing row content, not familiarity. Neutralization may have removed its state contrast. Authored effect: mixed. Authored screenshots restore the visible LIN-115 row, materially improving target discovery versus the blank neutral row. Orange Short badges and green Healthy badges supplement text, the selected row has a green edge/tint, and the filled Record decision button separates commit from return. However small pale item names, units, headings and simulation notes are harder to read than in neutral. Mobile truncates the long item name in the list; full review name is readable.
- r2: The standard list-detail composition suits the job, but the captured blank row prevents judging it as a fully usable list. Authored effect: mixed. The LIN-115 row is visible in both authored full images and selected desktop review, with SKU, available 2 and Short 8; selection tint and filled record action help. On mobile the long item name is truncated and secondary text is very small and pale.

**u12 — gpt-6-luna, current-skill.**
- r1: A familiar inventory table is appropriate. Small typography and the failure phase transition, rather than generic appearance, are the practical weaknesses. Authored effect: mixed. Green selected-row edge/fill, orange short badges and dark filled Record improve state and action scanning. The no-order notice has a distinct pale panel. Against these gains, small SKU/bin/unit text and column headings become faint, especially on mobile, where density and wrapped brand header remain. Authored screenshots do not show the failure phase transition separately.
- r2: The standard inventory table and detail panel are appropriate for comparing items and keeping work context. Authored effect: mixed. Colored shortage pills, selected row tint and a filled record button improve scanning and action hierarchy, but the already small table headings and metadata are pale.


## Fairness, resource use and remaining uncertainty

- Same task/fixture/starter/asset bytes within task; same static HTML/CSS/JS environment, system-font/no-network constraints, offline CLI/catalog access and two-viewport self-preview helper. No previous outputs or design feedback were given to creators. Current-skill instruction is the assigned treatment; CLI/reference use was optional under equal access. Actual tool use is retained in case notes/files and must not be assumed equal merely because tools were available.
- Models were requested as gpt-6.1-sol and gpt-6-luna. Sampling seed 42 belongs to TasteForge, not model generation. Exact backend snapshots, inference seeds, token counts, costs and matched compute were not exposed. Twelve-minute creation target was soft. Scheduling was shuffled before creation. These limits prevent strong causal attribution.
- Review r1 used gpt-6.1-sol in packet order; r2 used gpt-6.1-terra in reverse order, both fresh contexts. Each inspected 48 neutral and 36 authored images. Stage files were hashed before authored release and remain frozen. Condition blindness is best effort; layout choices can hint at treatment. Reviewers are AI agents, not end users; cross-model consistency does not replace user testing.
- Neutral CSS is diagnostic: removing color/shadow/radius and replacing font family can alter wrapping or obscure color-only cues. Original geometry measurements and task checks were collected before injection. Authored-stage caveats qualify neutral observations. No source implementation or plans were shown to reviewers.
- Original pilot/reference-follow-up/catalog-probe records were not modified or reused as controls. This task contract is stronger than the old pilot, so pass rates and scores are not comparable across runs. The current 642-record library is a reference source, not a guarantee of structural improvement.
- Operator corrected harness assumptions uniformly before review and retained stopped traces. No submitted UI was repaired, filtered out or renamed to hide defects. See [harness notes](harness-notes.md).
- OpenCode 1.19.3 listed both requested free models. Tiny no-tools calls to DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free both reached the provider and received “Free usage limit reached”; no supplemental UI was produced or scored. The CLI then stayed open until the 90-second timeout. Isolated logs and call records are retained in [OpenCode availability evidence](evidence/opencode-availability/). No paid fallback or existing credential access was used.

Further evidence requires repeated generations per block and representative users completing the task, including narrow/zoom states, correction/recovery and comprehension of consequences. This run can show specific strengths/regressions; it cannot establish that the skill reliably eliminates generic AI composition.
