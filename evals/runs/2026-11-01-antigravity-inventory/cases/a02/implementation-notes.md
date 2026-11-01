# Implementation Notes: Case a02 — Warehouse Inventory Replenishment Workspace

## Summary of Decisions
- **Architecture & Structure:** Implemented Candidate A from `UX_PLAN.md` (Split Workspace with Responsive Stacking). Desktop displays a two-column layout with inventory list and sticky replenishment inspector side-by-side. On narrow viewports (< 960px), layout stacks cleanly with compact item cards, keeping full list context immediately accessible above the inspector and providing an explicit `data-testid="back-to-list"` action.
- **Fixture Integrity:** Preserved `fixture.json` unchanged with all 5 items. Embedded exact fixture values into local JavaScript (`app.js`).
- **Initial State:** All 5 items displayed in fixture order; no item selected; search query empty; `shortage-only` checkbox unchecked; visible fictitious snapshot notice in the header.
- **Filtering & Search:**
  - `data-testid="shortage-only"` on native checkbox: when checked, filters precisely to items where `shortage > 0` (CER-204, LIN-115, CER-120). LIN-115 has incoming stock (4) but shortage (8) and is correctly retained.
  - `data-testid="inventory-search"`: matches case-insensitively against SKU or item name.
  - Zero-match state: provides message and `data-testid="clear-search"` button restoring list.
- **Item Selection & Evidence Inspection:**
  - `data-testid="item-LIN-115"` (and `item-${sku}` on selection controls) plus `data-testid="inventory-row"` and `data-sku="${sku}"` on each result item.
  - When LIN-115 is selected, displays all 5 required evidence metrics: Available stock (2 pieces), Reorder point (10 pieces), Current shortage (8 pieces), Incoming quantity (4 pieces), and Location (B-04).
- **Quantity Validation & Decision Flow:**
  - `data-testid="decision-quantity"` initialized to shortage (8 for LIN-115).
  - Validated strictly to positive integers between 1 and 50. Non-integers, empty strings, and out-of-range values block review commitment and show inline errors.
  - `data-testid="review-decision"` leads to review step exposing selected item, requested quantity/unit, and the explicit notice that recording a simulated decision places no purchase order.
  - `data-testid="edit-decision"` returns to the editable quantity form retaining the entered value.
  - `data-testid="save-decision"`: first save attempt fails visibly and recoverably, displaying failure message in `data-testid="decision-status"`.
  - `data-testid="retry-decision"`: retry attempt commits successfully, updating local state and displaying success confirmation in `data-testid="decision-status"`.
  - `data-testid="back-to-list"`: returns to the list view while retaining active search query and filter states.

## Sources and Tools Used
- **CLI Commands (via Ubuntu WSL):**
  - `node .../packages/cli/dist/index.js init`
  - `node .../packages/cli/dist/index.js suggest --count 3 --seed 42 --format json`
  - `node .../packages/cli/dist/index.js catalog`
  - `node .../packages/cli/dist/index.js audit --path .` (reported 0 errors, 0 warnings)
  - `node .../tools/preview.mjs a02` (rendered desktop.png and mobile.png)
- **Native Tools:**
  - `read_file` to inspect `task.md`, `fixture.json`, `SKILL.md`, `UX_PLAN.md`, and the generated self-review PNGs (`desktop.png`, `mobile.png`).
  - `write_file` / `edit_file` to maintain `UX_PLAN.md`, `index.html`, `styles.css`, `app.js`, and `implementation-notes.md`.

## Checks Performed
- **Static Audit:** Ran `tasteforge audit --path .` via WSL. Result: 0 errors, 0 warnings.
- **Visual Self-Review:** Inspected rendered screenshots (`evidence/self-review/desktop.png` and `mobile.png`) with native image reading tool.
  - Review iteration finding: desktop table header wrapped "REORDER PT" tightly and mobile table grid had potential horizontal overflow. Refactored mobile item rows into compact, high-legibility cards with clear metric chips and immediate access to the selection button, ensuring list context is fully preserved on narrow viewports without clipping.

## Deviations
- In `.tasteforge/brief.json`, requested language `vi` with `fontDelivery: system` returned no compatible preset directions from `suggest` due to system font pairing constraints. As prescribed by TasteForge skill, retained the Vietnamese requirement and system font constraint, using robust system-font fallbacks (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) with explicit line-height and encoding to ensure flawless rendering of Vietnamese diacritics.

## Unverified Requirements
- None. All functional requirements, constraints, test hooks, simulated error recovery, and narrow-screen context preservation have been implemented and verified.
