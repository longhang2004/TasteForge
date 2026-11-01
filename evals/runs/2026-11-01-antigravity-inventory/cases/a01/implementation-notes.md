# Implementation Notes — Case a01

## 1. Actual Decisions & Architecture
- **Tech Stack**: Plain standards-compliant HTML5, CSS3, and ES6 JavaScript (`index.html`, `styles.css`, `app.js`). No external dependencies, build tools, CDNs, or network APIs.
- **Embedded Fixture**: Embedded exact `fixture.json` payload directly in `app.js` to ensure immediate, offline execution regardless of whether loaded via `file://` or HTTP. `fixture.json` and `task.md` left completely untouched.
- **Master-Detail Workspace**:
  - Desktop: 2-column layout with left pane holding the searchable, filterable inventory table and right pane holding the sticky detail/decision workspace.
  - Mobile / Narrow Viewport: Stacked layout with responsive card transformation on table rows, ensuring the operator never loses list context while inspecting items or recording decisions.
- **Stock Quantity Presentation**: Real fields only (`available`, `reorderPoint`, `shortage`, `incoming`, `location`). Strictly avoided inventing any scores, predictions, artificial urgency rankings, or unbacked operational metrics.
- **State Preservation**:
  - Filter state (`searchQuery` and `shortageOnly` checkbox) is preserved across item selection, review, error, retry, and "Back to list" navigation.
  - Entered quantity for each item is preserved in a local map so editing or returning preserves user input.
- **Validation**: Strict integer validation `1 <= quantity <= 50`. Blocks progression to review and gives actionable inline feedback if invalid.
- **Simulated Save Lifecycle**:
  - First simulated save attempt fails recoverably with a visible error banner (`data-testid="decision-status"`).
  - Displays `data-testid="retry-decision"` action alongside edit and return options.
  - Retry attempt succeeds and updates `data-testid="decision-status"` with a confirmation message.
  - Non-PO disclosure explicitly displayed before saving and in outcome states.

## 2. Test Hooks Verified
- `data-testid="inventory-search"`: on `<input type="search">`
- `data-testid="shortage-only"`: on native `<input type="checkbox">`
- `data-testid="clear-search"`: on clear action button (guaranteed unique in DOM)
- `data-testid="inventory-row"`: on every rendered row element
- `data-sku="THE-SKU"`: on every rendered row element matching its item SKU
- `data-testid="item-${sku}"` (including `item-LIN-115`): on inspect selection button
- `data-testid="decision-quantity"`: on quantity input
- `data-testid="review-decision"`: on review action button
- `data-testid="save-decision"`: on initial save button
- `data-testid="retry-decision"`: on retry save button after failure
- `data-testid="edit-decision"`: on edit button in review/outcome view
- `data-testid="back-to-list"`: on return to list button
- `data-testid="decision-status"`: on outcome feedback banner

## 3. Sources & Tools Used
- `task.md` specification and `fixture.json` data contract.
- Ubuntu WSL bash runner for `preview.mjs` execution.
- Native `read_file` tool to inspect rendered PNG outputs in `evidence/self-review/` (`desktop.png` and `mobile.png`).
- Native `write_file` tool to author `index.html`, `styles.css`, `app.js`, and `implementation-notes.md`.

## 4. Checks & Self-Review Observations
- **Initial Pass Review**:
  - Desktop render showed the 8th table column (`Action`) extending past the container edge because of wide column padding and sidebar width.
  - Mobile render truncated columns horizontally behind a table scroll wrapper.
- **Review Iteration**:
  - Tuned desktop table column widths and cell padding, widening the list column so all 8 columns fit cleanly on 1024px+ viewports without horizontal scrolling.
  - Applied CSS card-layout transformation on narrow screens (<900px), transforming `tr` rows into compact cards displaying SKU, Location, Name, metric chips, and an easily clickable `Inspect` button without requiring horizontal scroll.
  - Re-rendered with `preview.mjs` and verified both `desktop.png` and `mobile.png` with `read_file`. Confirmed layout integrity and crisp rendering of Vietnamese diacritics ("Khăn bàn Nguyễn Thị Minh Anh — Natural linen").

## 5. Deviations & Unverified Requirements
- None. All functional requirements, constraints, and test hooks adhere strictly to `task.md`.
