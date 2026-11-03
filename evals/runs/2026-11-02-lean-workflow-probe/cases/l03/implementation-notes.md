# Implementation Notes: Case l03 (Northline Transfer)

## 1. Actual Decisions & Architecture

- **Flow & UX Structure:** Implemented a two-step transfer review flow (Details Entry -> Review & Confirm -> Recoverable Failure -> Retry -> Success outcome).
- **Fixture Integration (`fixture.json`):**
  - Brand: Northline Transfer (simulation only; prominent disclaimer stating no real money is moved and no real account is connected).
  - Sender: Alex Morgan, Everyday USD ••1042.
  - Recipient: Nguyễn Thị Minh Anh Trường (Việt Nam).
  - Initial amount: $250.00 USD.
  - Fees & Calculations: Upfront flat fee of $2.50 USD; total debited = amount + $2.50; recipient receives amount × 25,000 VND.
  - Delivery estimate: "By 3 November 2026, illustrative estimate".
  - Validation: Strictly rejects amounts < $1.00 or > $1,000.00 USD while preserving entered data.
  - Recoverable failure scenario: First confirmation triggers a recoverable simulated timeout error without debiting funds; retry succeeds.
- **Required Automated Test Hooks:**
  - `data-testid="recipient"` on recipient text `<input>`
  - `data-testid="amount"` on amount number `<input>`
  - `data-testid="review-transfer"` on review action `<button>`
  - `data-testid="edit-transfer"` on "Edit details" action `<button>` on review screen
  - `data-testid="confirm-transfer"` on initial confirmation `<button>`
  - `data-testid="retry-transfer"` on retry `<button>` after simulated failure
  - `data-testid="transfer-status"` on visible feedback elements (recoverable error banner and completion banner)
- **Visual System & Direction:**
  - Selected TasteForge `modern-institutional` direction (seed 42) with slate-blue palette.
  - System font stack prioritizing Vietnamese diacritics support (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) with system fallbacks only.

## 2. Inspected Skill & Reference Files

- `treatment/old/tasteforge/SKILL.md`
- `treatment/old/tasteforge/workflows/create-ui.md`
- `treatment/old/tasteforge/references/ux-plan-template.md`
- `task.md` and `fixture.json`

## 3. Terminal Commands Executed

All commands executed in WSL2 Ubuntu bash environment:

1. `ls -la` (exit code 0)
2. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js --help` (exit code 0)
3. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js init --dry-run` (exit code 0)
4. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js init` (exit code 0)
5. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js suggest --count 3 --seed 42 --format json` (exit code 0)
6. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js generate --direction modern-institutional --seed 42` (exit code 0)
7. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js audit --path . --format json` (exit code 0)
8. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/tools/preview.mjs l03` (exit code 0)
9. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/tools/recheck.mjs l03 320,390` (exit code 0)

## 4. Checks Performed

- **Static Audit:** Ran `tasteforge audit --path . --format json`. Found two high-confidence contrast warnings on `.sim-badge` (`#ffffff` on `#d97706`, 3.19:1) and `.step-circle` completion (`#ffffff` on `#16a34a`, 3.30:1). Resolved both contrast pairs to exceed WCAG AA 4.5:1 before generating previews.
- **Initial Preview:** Executed `preview.mjs l03`. Inspected the four generated PNG files via `read_file`:
  - `evidence/self-review/desktop/viewport.png` (1440x1000)
  - `evidence/self-review/mobile/viewport.png` (390x844)
  - `evidence/self-review/mobile/full-page.png`
  - `evidence/self-review/minimum/viewport.png` (320x740)
  All viewports reported `status: pass` with `horizontalOverflow: 0`.

## 5. Self-Review Change (Single Permitted Review Correction)

- **Observed Issue:** In the initial 320px and 390px previews, the step indicator had redundant numbering ("1. Enter details" next to circle "1"), causing awkward multi-line text wrapping on 320px. In the upfront calculation breakdown, the currency amount risked wrapping awkwardly.
- **Correction Made:**
  - Simplified step indicator labels in `app.js` to "Details" and "Review & Confirm" (as the circle indicators already provide numbers 1 and 2).
  - Added `white-space: nowrap` on `.calc-value` and adjusted mobile font size in `styles.css`.
  - Adjusted container padding on narrow viewports (<= 390px) to maximize readable content area.

## 6. Post-Correction Recheck

- Ran `recheck.mjs l03 320,390` (exit code 0).
- Inspected the newly generated evidence files:
  - `evidence/self-review-recheck/mobile/viewport.png`
  - `evidence/self-review-recheck/mobile/full-page.png`
  - `evidence/self-review-recheck/minimum/viewport.png`
- Verified that stepper text no longer wraps awkwardly, currency values stay together on single lines, and 320px minimum viewport remains free of horizontal overflow.

## 7. Deviations & Unverified Requirements

- **Interactive State Verification:** The supplied `preview.mjs` and `recheck.mjs` blackbox tools only capture the initial rendered page. Dynamic interaction states (form submission, amount edit round-tripping, the first confirmation failure alert, retry click to success) were implemented directly and tested by manual code inspection, but cannot be verified via automated screenshots by the provided tools.
- **Font Rendering:** Used system font stacks with full Vietnamese diacritic support as prescribed. Glyph rendering relies on the host OS font configuration without external web font downloads.
