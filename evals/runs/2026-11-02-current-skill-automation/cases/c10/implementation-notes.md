# Implementation Notes: Case C10 (Northline Transfer)

## 1. Actual Design and Implementation Decisions
- **Product & Task Fit:** Created a money-transfer review flow for occasional senders moving funds from Everyday USD ••1042 (Alex Morgan) to Việt Nam. Focused on clarity, cost transparency, and user confidence.
- **Visual System & Archetype:** Applied a calm, high-contrast financial design language adapted from the offline catalog style reference `volt-wise` and promax form principles.
  - Palette: Slate canvas (`#f8fafc`), pure white card surfaces (`#ffffff`), deep slate ink (`#0f172a`), forest green brand primary (`#15803d` / `#166534`), and clear semantic states for errors (`#b91c1c` / `#fef2f2`) and successes (`#14532d` / `#f0fdf4`).
  - Typography: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) providing comprehensive, native support for Vietnamese diacritics without external font assets.
- **Workflow & State Machine:**
  - **Editable Entry Step:** Initialized with recipient `Nguyễn Thị Minh Anh Trường` and amount `250` USD. Displays live transfer summary showing flat fee ($2.50 USD), total debited ($252.50 USD), and recipient payout (6,250,000 VND at 25,000 VND/USD).
  - **Validation:** Enforced bounds ($1.00 minimum, $1,000.00 maximum) and non-empty recipient. Invalid submissions display an accessible inline alert banner while retaining both inputs.
  - **Review Step:** Summarizes recipient, destination, funding account, sent amount, flat fee, total debited, amount received in VND, exchange rate, and delivery estimate ("By 3 November 2026, illustrative estimate").
  - **Edit Details Action:** Real edit control (`data-testid="edit-transfer"`) allows navigating back from review to the entry step, retaining both fields, allowing amount edits, and recalculating values upon return.
  - **Recoverable Failure & Retry:** First confirmation attempt produces a simulated recoverable network timeout error banner (`data-testid="transfer-status"`). Clicking `data-testid="retry-transfer"` advances to a complete success outcome with a simulated receipt.
  - **Honest Simulation Disclosures:** Persistent top banner, card badges, and receipt notes clearly state that the flow is a fictional simulation moving no real funds.

## 2. Inspected Skill & Reference Files
- `treatment/tasteforge/SKILL.md`: Core guidance on task-driven design, handling constraints, and CLI fallback workflows.
- `treatment/tasteforge/workflows/create-ui.md`: Step-by-step procedure for new UI creation.
- Offline TasteForge catalog references:
  - `promax-ui-reasoning-118` (File Manager & Transfer guidelines: clarity focus, minimal shadows, touch targets).
  - `volt-wise` (Wise-inspired financial UI patterns: calm neutrals, high contrast display, transparent fee summaries).

## 3. Executed Tools & Validation Checks
- **TasteForge CLI:**
  - `init`: Successfully generated initial `.tasteforge/brief.json` and config.
  - `suggest`: Executed with seed 42. Reported exit code 1 because no built-in generator direction satisfied `languages: ["vi"]` with `fontDelivery: "system"`. Followed SKILL.md lines 54-55 and 77-79 to retain the required language constraint and proceed with a coherent manual system without fabricating CLI DNA.
  - `catalog`: Queried offline dataset for transfer and banking references (`volt-wise`, `promax-ui-reasoning-118`).
  - `audit`: Ran `tasteforge audit --path . --format json`.
    - First run found 1 warning: contrast pair `#64748b` on `#f1f5f9` (4.34:1, slightly below 4.5:1 normal text target).
    - Remediated by darkening text to `#475569` (5.6:1 contrast ratio, meeting WCAG AA).
    - Rerun confirmed 0 errors, 0 warnings.
- **Self-Render Preview & Visual Inspection:**
  - Executed single preview command: `node .../tools/preview.mjs c10`.
  - Inspected generated image files via `read_file`:
    - `evidence/self-review/desktop-viewport.png`
    - `evidence/self-review/desktop-full.png`
    - `evidence/self-review/mobile-viewport.png`
    - `evidence/self-review/mobile-full.png`
  - Observed clean layout, flawless diacritics rendering for `Nguyễn Thị Minh Anh Trường`, proper contrast, and responsive single-column mobile adaptation.
- **Single Self-Review Revision:**
  - Added CSS rule to eliminate native number input spinners on the amount field for a polished financial UI.
  - Added semantic `data-field` attributes on review summary rows.
  - Re-audited with `tasteforge audit` confirming 0 errors, 0 warnings.
- **Contract Verification:**
  - Verified `task.md` and `fixture.json` remained unmodified via `git diff`.

## 4. Deviations and Unverified Requirements
- TasteForge CLI suggestion engine did not support Vietnamese system-font combinations; manually defined design tokens matching the documented `volt-wise` catalog reference.
- No live banking integration exists (as contracted, this is a local simulation).
- No external browser test harness or operator feedback was consulted during implementation.
