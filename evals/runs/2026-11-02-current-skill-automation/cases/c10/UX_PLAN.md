# UX Plan: Money-Transfer Review Flow (Northline Transfer)

## 1. Primary Task
Verify the total cost, fees, exchange rate, and recipient before confirming a simulated remittance transfer to Việt Nam.

## 2. Key Requirements & Constraints
- Source of truth: `fixture.json` (Northline Transfer, sender Alex Morgan, recipient Nguyễn Thị Minh Anh Trường, 250 USD, flat fee $2.50, rate 25,000 VND/USD, range $1–$1,000).
- Visible fees before confirmation; transparent cost breakdown (send amount + fee = total debited; recipient receives VND).
- Retain input after errors and during edit round-trips.
- Support long Vietnamese names with proper diacritics and overflow wrapping (`Nguyễn Thị Minh Anh Trường`).
- First confirmation must trigger a recoverable simulated failure; retry succeeds.
- Honest simulation disclosure throughout: never imply real money is moved.
- Accessibility: Full keyboard navigation, visible focus rings, ARIA live announcements, WCAG AA contrast (>= 4.5:1), system fonts.
- Required test hooks:
  - `data-testid="recipient"`
  - `data-testid="amount"`
  - `data-testid="review-transfer"`
  - `data-testid="edit-transfer"`
  - `data-testid="confirm-transfer"`
  - `data-testid="retry-transfer"`
  - `data-testid="transfer-status"`

## 3. Reference Observations
- Adapted from catalog reference `volt-wise` and promax form rules:
  - Crisp, reassuring financial layout: deep ink `#0f172a`, clear neutral card surfaces `#ffffff` over soft slate-tinted canvas `#f8fafc` / `#f1f5f9`.
  - Strong, legible typography hierarchy using system sans font stack with full diacritics support.
  - Transparent calculation callout: Send Amount + Transfer Fee = Total Debited, with explicit conversion to VND.
  - Generous touch targets (min 44px) and clear state transitions.

## 4. State Machine Flow
1. **Entry Step (`state = 'entry'`):**
   - Source account card (Alex Morgan, Everyday USD ••1042).
   - Recipient input (`data-testid="recipient"`).
   - Amount input (`data-testid="amount"`).
   - Live summary pill showing flat fee ($2.50), exchange rate (25,000 VND), and recipient calculation.
   - Validation on amount ($1 - $1,000) and recipient presence.
   - Primary button: "Review transfer" (`data-testid="review-transfer"`).
2. **Review Step (`state = 'review'`):**
   - High-contrast verification card:
     - Recipient & destination
     - Amount to send (USD)
     - Flat transfer fee (USD 2.50)
     - Total debited (USD)
     - Recipient gets (VND)
     - Exchange rate & delivery estimate
   - Action row:
     - Secondary "Edit details" (`data-testid="edit-transfer"`) -> returns to Entry Step with inputs preserved.
     - Primary "Confirm transfer" (`data-testid="confirm-transfer"`).
3. **Failure State (`state = 'failure'`):**
   - Recoverable error alert banner with `data-testid="transfer-status"`.
   - Explains simulated failure (e.g. simulated network timeout).
   - Re-displays review card for peace of mind.
   - Action row:
     - Retry button (`data-testid="retry-transfer"`).
     - Edit details button (`data-testid="edit-transfer"`).
4. **Success State (`state = 'success'`):**
   - Confirmatory celebration badge and status with `data-testid="transfer-status"`.
   - Complete transfer receipt with simulated transaction reference.
   - Reassurance: "Simulation complete. No real money moved."
   - "Send another transfer" button to reset flow.

## 5. Responsive & Accessibility Strategy
- Max container width: 620px, centered with comfortable margins.
- Clean single-column form flow that adapts seamlessly to 375px mobile viewports.
- Explicit `label` associations for all inputs.
- Keyboard accessible: Enter triggers primary action in inputs; Tab order is logical; focus outlines are high-contrast.
- Long diacritic names will use `word-break: break-word` and generous line-height to avoid glyph clipping.
