# Implementation Notes — Case l04

## Task Decisions & Architecture
- **Workflow Effort**: Standard effort applied following `treatment/lean/tasteforge/SKILL.md` and `workflows/create-ui.md`.
- **Factual Grounding**: All brand data, sender details, initial values ($250 USD to Nguyễn Thị Minh Anh Trường), flat fee ($2.50 USD), exchange rate (25,000 VND/USD), delivery estimate ("By 3 November 2026, illustrative estimate"), and simulation disclaimer are grounded strictly in `fixture.json`.
- **Simulated Environment Transparency**: Prominent simulation disclosure banner in header, on review screen, and on completion status to ensure no implication of moving real money.
- **Flow & State Machine**:
  - Step 1 (Entry): Recipient input (`data-testid="recipient"`), amount input (`data-testid="amount"`), live cost/payout calculation breakdown showing visible fees before confirmation, and review action (`data-testid="review-transfer"`).
  - Validation: Values under $1.00 or over $1,000.00 USD are rejected with accessible alerts without clearing or losing entered inputs.
  - Step 2 (Review): Displays Recipient, Sent amount, Fee, Total debited, Amount received, and Delivery estimate. Offers "Edit details" (`data-testid="edit-transfer"`) which preserves inputs, allows changing amounts, and recalculates all totals upon returning to review.
  - Step 3 (Confirmation & Recovery): First confirmation triggers a recoverable simulated failure with visible feedback on `data-testid="transfer-status"` and reveals `data-testid="retry-transfer"`. Clicking retry succeeds, displaying confirmation reference and success status on `data-testid="transfer-status"`.

## Inspected Skill & Reference Files
- `treatment/lean/tasteforge/SKILL.md`: workflow selection and quality gates.
- `treatment/lean/tasteforge/workflows/create-ui.md`: task structure and standard creation process.
- `treatment/lean/tasteforge/workflows/structure-and-revise.md`: preview inspection and single focused revision pass.
- `treatment/lean/tasteforge/references/accessibility.md`: semantic landmarks, keyboard focus, color contrast, touch target guidelines.

## Commands Executed
1. `wsl.exe --distribution Ubuntu --cd /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/cases/l04 --exec bash -lc "ls -la"` (exit code 0)
2. `wsl.exe --distribution Ubuntu --cd /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/cases/l04 --exec bash -lc "node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js --help"` (completed exit code 0)
3. Initial preview:
   `wsl.exe --distribution Ubuntu --cd /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/cases/l04 --exec bash -lc "node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/tools/preview.mjs l04"` (exit code 0)
4. Post-correction recheck:
   `wsl.exe --distribution Ubuntu --cd /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/cases/l04 --exec bash -lc "node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-lean-workflow-probe/tools/recheck.mjs l04 320,390,1440"` (exit code 0)

## Self-Review Observations & Focused Correction
- **Initial Preview Observation**:
  - In `mobile/full-page.png` and `desktop/viewport.png`, `.card { display: flex; }` was overriding the HTML `[hidden]` attribute, causing the review screen, status feedback, and retry button to be displayed concurrently with the entry step.
  - In `minimum/viewport.png`, the numeric character entity `Tr&#434;&#7901;ng` rendered as `TrƲờng` instead of `Trường`.
- **Focused Edit**:
  - Added explicit rule `[hidden] { display: none !important; }` in `styles.css`.
  - Replaced HTML entities with canonical UTF-8 `Nguyễn Thị Minh Anh Trường` in `index.html`.
- **Recheck Outcome**:
  - Re-rendered at 320px, 390px, and 1440px via `recheck.mjs`. Inspected `minimum/viewport.png`, `mobile/full-page.png`, and `desktop/viewport.png`.
  - Only Step 1 is rendered on initial page load; long Vietnamese diacritics render cleanly with no overflow (geometry status pass for 320px, 390px, 1440px).

## Unverified Requirements / Testing Limitations
- Browser preview and recheck tools only render the initial page state without exercising JavaScript interaction sequences (such as button clicks, DOM mutations, or runtime alert announcements).
- Full dynamic interaction states (form validation triggers, click on review, first-confirmation simulated failure, retry success) were verified via source-level review and logic inspection, but full runtime browser interaction testing requires external end-to-end execution.
