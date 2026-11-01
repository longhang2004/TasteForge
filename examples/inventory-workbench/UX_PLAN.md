# Inventory: compare stock, then record one decision

## Task and constraints

Surface purpose: **Work**. The visitor's success is comparing stock evidence and recording/recovering a decision. The existing fictional fixture, contract and system-font constraint are the durable context; this page does not inherit a marketing introduction merely because it belongs to the same brand.

An operator finds a shortage, inspects the stock evidence and records a simulated replenishment quantity. Use the unchanged fictional inventory fixture from the Antigravity study. LIN-115 has 2 available, reorder point 10, shortage 8, incoming 4, location B-04. Incoming does not erase its shortage. No forecasting, supplier actions, live stock or real ordering is implied.

The representative path is filter/search → item → quantity → review → recoverable first-save failure → retry/success → return. Quantity must be a whole number from 1 to 50. Search, shortage filter and draft quantity survive navigation. The long Vietnamese item name is real fixture content, not a decorative heading.

## Inspected evidence and provenance

- Local [Antigravity report](../../evals/runs/2026-11-01-antigravity-inventory/report.md), inspected 2026-11-01: the compact baseline desktop table supports comparison; both submissions repeat evidence and have long mobile paths. These are agent/browser observations, not warehouse-user findings. Original submissions and ratings remain unchanged.
- [PatternFly primary-detail](https://www.patternfly.org/patterns/primary-detail/design-guidelines/), documentation inspected 2026-11-01: overview/detail relationships inform candidate A. No PatternFly code, assets or rendered application were copied or tested. This example's breakpoint and density are local decisions, not certified PatternFly behavior.
- [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/), documentation inspected 2026-11-01: explicit review and editable retained answers inform the commitment state. No GOV.UK markup/assets or visual identity were reused. The flow remains a local warehouse simulation.

All implementation code and styling here are agent-authored in this repository under its MIT license. The fixture is copied byte-for-byte from the preserved study. This is a candidate worked composition; human design approval and representative-user validation are pending.

## Two executable structures

Both use the same application, fixture, controls and neutral styling. They are exposed only through the development prototype page, not through product settings.

| Candidate               | Runnable path                      | Wide relationship                                                            | Narrow relationship                                              | Main tradeoff                                                                                     |
| ----------------------- | ---------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A: focused detail       | `prototype.html?layout=focused`    | Compact comparison table alongside the selected item's evidence and decision | List is replaced by detail/review; Back restores context         | Loses simultaneous comparison on mobile; avoids repeating the list above every decision           |
| B: continuous worksheet | `prototype.html?layout=continuous` | Full comparison table above the selected item's evidence and decision        | The same continuous document retains the list above the decision | Supports overview scanning without switching views; longer travel between overview and commitment |

Both support review, edit, simulated failure and retry. A third candidate was not built: these two test the specific unresolved overview/detail relationship without inventing another interaction model. The selected main interface uses A. Selection is a task-based hypothesis supported by inspecting the actual candidate renders and execution traces; it is not a measured user preference.

## Region jobs and content editing

- Header: product and warehouse orientation; no speculative navigation.
- One compact snapshot disclosure: establishes fictional data and its date. Repeat the no-purchase-order consequence at commitment because it answers a different decision question.
- Stock rows: compare item, location, available and shortage. Keep units explicit; put reorder point and incoming in item evidence rather than adding four metric cards per row.
- Detail: one stock ledger, short explanation of incoming policy, then editable quantity. No empty detail panel before selection.
- Review/recovery: replace the input with the actual requested quantity and consequence; retain the same ledger once. Errors preserve the quantity and offer retry/edit.

The mobile DOM contains one selected-detail region, one quantity control and one Back action. CSS hides the overview while detail is active; desktop keeps the overview available for comparison. This is a bounded five-item example, not a proven high-volume warehouse system.

## Visual decisions

Use system fonts, restrained green for actions/selection, warm neutral surfaces and tabular quantities. Table rows use compact spacing for comparison; detail uses more space between evidence and commitment. Group stock evidence with rules and alignment rather than separate cards. Styling is manual, not CLI-generated Design DNA, and no font files are bundled. Actual long-name rendering is inspected; comprehensive font/platform coverage remains unverified.

## Acceptance and review

Execute the fixture's search/filter, invalid quantity, edited review, failure/retry and retained-return path at 1440, 390 and 320px. Check real rendered states for overflow and automated accessibility findings. Exercise keyboard opening, focus on item entry, retained edit focus and return focus. Candidate traces must reach recovery too.

See [DESIGN_REVIEW.md](DESIGN_REVIEW.md) for actual observations and edits, [evidence](evidence/) for immutable capture passes, and [the user-study guide](usability-guide.md) for the still-pending human check. Passing automation and shorter pages do not establish comprehension or a generally better UX.
