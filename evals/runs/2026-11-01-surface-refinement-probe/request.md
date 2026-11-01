# Request from the product owner

Use TasteForge to review the proposed refund screen below before we implement it. Give a concise edit plan and improved copy for the affected controls/help text. This is a source/content planning request; there is no running UI and no permission to install tools, browse, change product behaviour or edit production files.

Northline sells household goods. The same project contains a public purchase guide and an internal support workspace. The purchase guide explains shipping and returns to prospective customers. The requested target is the support refund screen only; mention any difference in its priorities if useful, without redesigning the purchase guide.

Existing project brief: support operators compare order lines, decide what should be refunded and submit a local review record for approval. This prototype never sends money. Keep the existing blue accent and prescribed system-font stack. The amount appears both beside the selected order line and in the final review area. Keep the review/edit path and the first-save failure/retry with retained values.

Proposed source/content structure:

```text
Refund review — order NL-480
Selected item: Everyday Teapot — Sand
Returned quantity: 1 of 2 pieces
Original line total: USD 960.00
Requested refund: USD 480.00

[heading] Choose the refund amount
[help] Enter the amount you want to refund.
[help] Use the field below to enter the refund amount.
[label] Amount (USD)
[input] 480.00
[button] Continue

[review region]
Order NL-480 / Everyday Teapot — Sand
Refund amount: USD 480.00
Recording submits this decision for approval; no money is sent.
[button] Process now
[button] Edit amount

[recoverable outcome]
The review record could not be saved. Your item and amount are retained.
[button] Retry
```

Provide your recommendation in REVIEW.md in this scratch directory. Identify scope, what you would change/retain, actual evidence limits, and checks to perform once a UI exists. Do not manufacture browser inspection or user testing. Do not read any prior TasteForge evaluations, other examples or review conclusions.
