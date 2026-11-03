# Implementation Notes — Case C09 (Northline Transfer Flow)

## 1. Actual Implementation Decisions
- **Source of Truth**: All parameters, labels, amounts, and scenarios derive directly from `fixture.json`:
  - Brand: "Northline Transfer" (fictional simulation)
  - Sender / Account: Alex Morgan, Everyday USD ••1042
  - Recipient: Nguyễn Thị Minh Anh Trường (Việt Nam)
  - Currency pair: USD to VND
  - Financials: Initial amount $250.00 USD, flat fee $2.50 USD, exchange rate 25,000 VND per 1 USD
  - Boundaries: Minimum $1.00 USD, maximum $1,000.00 USD
  - Delivery estimate: "By 3 November 2026, illustrative estimate"
- **Stepped Architecture**:
  - Step 1 (Entry): Accessible form pre-filled with supplied recipient and $250.00 amount. Visible cost and conversion breakdown displayed upfront before review.
  - Step 2 (Review): Summary card clearly displaying recipient, sent amount, fee, total debited, amount received, and delivery estimate.
- **Error Handling & Retention**:
  - Validation prevents advancing if amount < 1 or > 1000 or invalid, while strictly preserving entered recipient and amount values.
- **Simulated Lifecycle (Recoverable Failure & Retry)**:
  - First confirmation click triggers simulated connection failure with `role="alert"`, visible status banner (`data-testid="transfer-status"`), and retry action (`data-testid="retry-transfer"`).
  - Clicking retry succeeds, displaying clear success confirmation (`role="status"`, `data-testid="transfer-status"`), noting that no real money was debited.
- **Edit Flow**:
  - Real "Edit details" button (`data-testid="edit-transfer"`) on review screen returns to the entry view with both inputs retained, recalculating amounts upon re-submission to review.
- **Simulation Transparency & Vietnamese Diacritics**:
  - Prominent simulation banners and disclosures state that no real accounts or funds are touched.
  - System font stack and responsive layout natively support long Vietnamese names with diacritics (`Nguyễn Thị Minh Anh Trường`) without clipping or overflow.
- **Test Hooks**:
  - `data-testid="recipient"` on recipient input
  - `data-testid="amount"` on amount input
  - `data-testid="review-transfer"` on review button
  - `data-testid="confirm-transfer"` on initial confirmation button
  - `data-testid="retry-transfer"` on retry action
  - `data-testid="transfer-status"` on visible status feedback banners
  - `data-testid="edit-transfer"` on review screen edit action

## 2. Inspected Skill & Reference Files
- **None**: Strictly observed the prompt directive: "Do not read or apply any skill files... no browsing, delegation, other cases, previous studies, repository docs/tests/examples or evaluation harness reads." No skills or external references were loaded or inspected.

## 3. Tools and Checks Executed
- Read `task.md` and `fixture.json` via `read_file`.
- Listed case directory contents via WSL2 bash command tool.
- Authored `index.html`, `styles.css`, and `app.js` via `write_file`.
- Executed the preview tool once via WSL2:
  `node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-current-skill-automation/tools/preview.mjs c09`
- Directly inspected the 4 rendered PNG outputs in `evidence/self-review/` (`desktop-viewport.png`, `desktop-full.png`, `mobile-viewport.png`, `mobile-full.png`) using `read_file`.
- Completed at most one review iteration:
  - Enhanced `app.js` with redundant click listener for headless environments and state reset when transitioning back from edit to review.
  - Enhanced `styles.css` with flexbox spacing constraints on the breakdown list for narrow mobile viewports.

## 4. Deviations
- None. All functional, behavioral, and architectural requirements in `task.md` were preserved.

## 5. Unverified Requirements & Unavailable Tools
- End-to-end browser automation suites (e.g., automated test harnesses) were not executed directly, adhering to the instruction not to inspect or run operator tests or browser experiments outside the single shared preview render.
