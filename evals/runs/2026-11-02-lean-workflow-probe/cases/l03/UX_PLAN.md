# UX plan: Money-transfer review flow (Northline Transfer)

## Task and constraints

- User and frequency: Occasional customers sending funds to Việt Nam.
- Target route/state and visitor success: Task-oriented / decision workflow. Primary success is verifying the exact recipient and total cost breakdown before simulated confirmation.
- Existing product-context source: Fictional contract from `fixture.json`. Simulation with fictional data; no real money moved.
- Primary action and successful outcome: Verify transfer details on review screen, confirm simulated transfer, handle recoverable failure, and successfully complete on retry.
- Decisions needed before that action: Enter recipient name, enter transfer amount (between $1 and $1,000 USD), review upfront flat fee ($2.50 USD), total debit ($252.50 USD), received VND amount (6,250,000 VND), and delivery estimate.
- Information that must remain together: Recipient name, transfer amount, fee, exchange rate, total debited, amount received in VND, delivery estimate.
- Consequences of an error and recovery needs: Invalid amounts (<$1 or >$1,000) show clear validation feedback without wiping input. Network/simulated transfer failure retains entered data, provides an explicit retry button (`data-testid="retry-transfer"`), and allows editing details (`data-testid="edit-transfer"`).
- Existing system to preserve / authorized redesign scope: Greenfield flow in starter, using TasteForge modern-institutional direction (seed 42), slate-blue palette, system fonts.
- Content, language, accessibility, and technical constraints: Plain HTML/CSS/JS, no external fonts or assets, long Vietnamese names with diacritics ("Nguyễn Thị Minh Anh Trường"), keyboard accessible, responsive down to 320px viewport, test hooks required.

## Source observations

- No external browsing permitted or used per task constraints.
- Local fixture: `fixture.json` defines sender ("Alex Morgan", Everyday USD ••1042), recipient ("Nguyễn Thị Minh Anh Trường"), destination ("Việt Nam"), rate (25,000 VND/USD), fee ($2.50 USD), delivery estimate ("By 3 November 2026, illustrative estimate"), and simulation disclaimer.

## Structural alternatives

### A: Two-step Linear Flow (Edit -> Review/Confirm with In-place Recovery)
- Information order:
  1. Entry Step: Card with sender account info, recipient input, amount input with live calculation of fee ($2.50) and recipient estimate, "Review Transfer" button.
  2. Review Step: Prominent summary card showing recipient, sent amount, flat fee, total debited, recipient receives (VND), delivery estimate, and source account. Action buttons: "Confirm Transfer" and "Edit details".
  3. Failure State on Review Step: Clear error alert ("Transfer failed: simulated network timeout. No money moved.") with "Retry Transfer" button and "Edit details" button.
  4. Success State: Clear success confirmation card with transaction reference, details, and simulation badge.
- Pros: Focused cognitive load, clean separation between data entry and verification, direct support for required test hooks and edit step.
- Selection: Selected.

### B: Single-page Accordion / Collapsible Flow
- Pros: Keeps everything on one page.
- Cons: Visual clutter on 320px screens; less distinct mental model for confirmation and commitment.
- Rejected in favor of Structure A.

## Selected structure

- Structure A: Two-step linear workflow with dedicated review and recovery states.
- Reading order: Fictional simulation banner -> Brand header -> Main workflow card (Step indicator -> Form / Summary Details -> Actions -> Security & Simulation notice).
- Test hooks:
  - `data-testid="recipient"` on recipient `<input>`
  - `data-testid="amount"` on amount `<input>`
  - `data-testid="review-transfer"` on review button
  - `data-testid="edit-transfer"` on edit button in review
  - `data-testid="confirm-transfer"` on confirm button in review
  - `data-testid="retry-transfer"` on retry button after failure
  - `data-testid="transfer-status"` on visible feedback element

## Visual treatment after structure

- Modern Institutional direction (seed 42), slate-blue palette (`#172033` text, `#f8fafc` background, `#2048a0` primary accent, `#94a3b8` borders).
- Typography: System font fallback stack with complete Vietnamese diacritic support (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
- High-contrast form elements, visible focus indicators, generous touch targets (min 44px height), full responsive wrapping.
