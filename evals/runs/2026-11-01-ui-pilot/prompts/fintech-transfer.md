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

# Common implementation environment

Create a working, responsive interface in `index.html`, `styles.css`, and `app.js` using plain HTML/CSS/JavaScript. The identical starter has no established design system. No build step, third-party scripts, external fonts, remote assets, network APIs, or package installation. Use installed system-font fallbacks. All UI behavior must run locally from a static HTTP server. You may create additional local files inside your assigned case directory.

Work only in your assigned case. Read this task, fixture, starter, and shared assets; do not inspect other cases, evaluation metadata, repository documentation, or unrelated skills. Do not delegate. Routine terminal commands must use Ubuntu WSL2 Bash: `wsl.exe --distribution Ubuntu --cd <Linux-directory> --exec bash -lc <command>` when the tool is hosted on Windows. Do not use PowerShell for actual file operations.

Use one implementation pass and one self-review, aiming to finish within eight minutes. Both conditions receive this same budget; there is no enforced model-token or generation-seed API. Do not alter the fixture or testing contract. Save `implementation-notes.md` documenting your decisions, actual checks, known gaps, and any unavailable tools. Do not claim rendered inspection unless you performed it. Return a concise completion summary with file paths. A separate operator will capture screenshots and test the primary task after you finish.
