# Product request

Create a money-transfer review flow for occasional customers, including recipient, amount, fees, delivery estimate, confirmation, and recoverable failure. Prioritize clarity and confidence. Support long Vietnamese names and keyboard access. Do not imply that the sample app moves real money.

Primary task: Verify the total cost and recipient before confirming a simulated transfer.

Constraints:
- Visible fees before confirmation
- Retain input after errors
- Vietnamese diacritics

# Shared fixture and behavior contract

Use the fictional content in `fixture.json` as the source of truth. Do not invent testimonials, certifications, impact metrics, or real transaction capability.

Build an editable entry step and a review/confirmation step. Initially fill in the supplied recipient and USD 250 amount. The fee is a flat USD 2.50, charged in addition to the amount; the recipient receives amount × 25,000 VND. Reject amounts below USD 1 or above USD 1,000 without losing other input. The first confirmation must return a recoverable simulated failure; a retry succeeds. Show a clear success outcome and never imply real money is moved.

For neutral automated checks, add these invisible test hooks to actual controls: `data-testid="recipient"` on the recipient input; `data-testid="amount"` on the amount input; `data-testid="review-transfer"` on the review action; `data-testid="confirm-transfer"` on confirmation; `data-testid="retry-transfer"` on retry after failure; and `data-testid="transfer-status"` on visible feedback. The review must show recipient, sent amount, fee, total debited, amount received, and delivery estimate. These hooks do not prescribe visual composition or control styling.


Provide a real Edit details action with data-testid="edit-transfer" on the review screen. Editing must retain both inputs, permit changing the amount, then return to review with recalculated values. Keep errors, retry and success clearly distinguishable.

