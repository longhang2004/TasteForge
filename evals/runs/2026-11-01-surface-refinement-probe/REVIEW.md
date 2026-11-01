# Refund screen review

## Scope and purpose

Refine the supplied support refund screen copy only. Operators need to compare the order facts, choose an amount, review it, and save a local review record for approval. This is a work surface: prioritize scanability, units, consequences and recovery. The public purchase guide supports reading and a prospective purchase decision; it is outside this review.

Retain the blue accent, prescribed system-font stack, existing structure and behavior. Keep order/item identity, returned quantity, original line total and requested amount available during entry. Keep the amount beside the selected line **and** in final review: that repetition supports comparison and confirmation. Preserve review/edit and the first-save failure/retry path with retained values. No new refund rules, calculations or payment behavior are proposed.

## Concise edit plan

| Target / state | Evidence in supplied text | Operator consequence / proposed edit |
| --- | --- | --- |
| Amount entry | Two help lines both instruct entry into the same field. | Consolidate to one useful instruction; retain the visible currency label and order context. |
| Continue to review | "Continue" leaves the destination unstated. | Use "Review refund" to identify the existing next step. |
| Final review | "Process now" conflicts with the explicit explanation that this records a decision for approval and sends no money. | Use "Save review for approval"; keep the consequence text beside this action. |
| Edit / save failure | The edit path and retained item/amount are explicitly provided. | Retain both; make the edit and retry labels specific to their existing actions. |

These are content findings. A risk of confusion is a reason to test, not an observed operator error. Keep the established grouping; this scope does not justify a new layout or style direction.

## Recommended affected copy

```text
[heading] Choose the refund amount
[help] Enter the refund amount to include in the review record.
[label] Refund amount (USD)
[input] 480.00
[button] Review refund

[review region - retain the order/item summary]
Refund amount: USD 480.00
Saving records this decision for approval. No money is sent.
[button] Save review for approval
[button] Edit refund amount

[recoverable outcome]
The review record could not be saved. Your selected item and refund amount are retained.
[button] Retry saving review
```

Keep the supplied USD 480.00 at both required locations. Do not infer amount limits, eligibility or automatic proration from the quantity and line total; none is specified. The revised copy changes labels and explanation, not the state path or save semantics.

## Evidence limits and checks after implementation

Reviewed only the supplied proposed text and brief using the references listed below. No production source, rendered UI, browser, CLI audit, user testing or reference research was inspected or run. Contrast, spacing, accessibility, responsive behavior and task performance remain unverified. This bounded content recommendation does not establish universal UX improvement.

Once a UI exists:

- Follow amount entry -> review -> edit -> review. Confirm item identity and the current amount stay consistent in both summaries and that the save consequence is visible before activation.
- Exercise the first-save failure and retry. Confirm values remain available, retry saves the intended local record for approval, and no payment is initiated.
- At narrow and wide widths, with long item names and zoom, check context, currency, controls and the review consequence remain readable and reachable in a sensible order.
- Check keyboard order and visible focus; associate the amount label/help and any existing validation error with the field. Ensure save failure is announced accessibly and recovery remains reachable. Verify rendered text/control contrast using the retained blue system.
- Ask representative operators to explain what "Save review for approval" does and recover from the failed save; record actual observations before claiming better task performance.

## Files actually consulted

- `.tmp/surface-refinement-probe/request.md`
- `skills/tasteforge/SKILL.md`
- `skills/tasteforge/workflows/audit-ui.md`
- `skills/tasteforge/workflows/targeted-refinement.md`
- `skills/tasteforge/references/surface-purpose.md`
- `skills/tasteforge/references/accessibility.md`
- `skills/tasteforge/references/interaction-motion.md`
