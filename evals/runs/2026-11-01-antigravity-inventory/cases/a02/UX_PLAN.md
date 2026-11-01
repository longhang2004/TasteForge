# UX Plan: Warehouse Inventory Replenishment Workspace

## Task and Constraints

- **User and Frequency:** Warehouse operators during daily inventory audits and replenishment review cycles.
- **Primary Action & Successful Outcome:** Find SKU LIN-115, inspect its stock evidence (available stock: 2, reorder point: 10, shortage: 8, incoming: 4, location: B-04), and record a simulated replenishment decision for 8 pieces.
- **Decisions Needed Before Action:** Operator checks actual available stock against reorder point, takes incoming stock into account, inspects bin location, and confirms replenishment piece count (1-50 range).
- **Information That Must Remain Together:** Item identification (SKU, name, location), inventory metrics (available, reorder point, incoming, shortage), and editable decision quantity with explicit units.
- **Consequences of Error & Recovery:** The first simulated save fails visibly; operators must have an immediate, obvious retry path (`data-testid="retry-decision"`) that succeeds without losing entered quantity or context. Editing must allow revising quantities before final save.
- **Context & Disclosures:** Fictional snapshot notice ("Northline Stockroom", snapshot time, simulated local action placing no real purchase order).
- **Language & Fonts:** English interface with full Vietnamese text support ("Khăn bàn Nguyễn Thị Minh Anh — Natural linen") using robust system-font fallbacks and no external web fonts or build tools.

## Structural Alternatives

### Candidate A: Split Workspace (Master-Detail with In-Place Context)
- **Layout:** On wide viewports, side-by-side two-column master/detail. Left column: search, shortage toggle, list of items with stock summaries. Right column: detail inspector with item evidence, quantity input, review step, and action outcomes. On narrow viewports, sticky header with search/filter, stacked list, and inline/collapsible active inspector below the selected row or sticky bottom sheet, with explicit "Back to list" navigation that preserves list context.
- **Decision Order:** Filter/search -> Select item -> Inspect evidence -> Enter quantity -> Review summary (with no-PO notice) -> Save / Retry -> Success confirmation.
- **Selection Rationale:** Best task fit. Keeps list context visible at all times, preventing disorienting full-page jumps while allowing deep inspection and decision review.

### Candidate B: Multi-Step Modal Wizard
- **Layout:** Modal dialog overlay opening on selection for inspect -> review -> save.
- **Drawback:** Conceals the list context on mobile, violates the requirement to work on narrow screens without losing list context, and adds unnecessary modal friction.

### Candidate C: Pure Inline Accordion Expansion
- **Layout:** Each row expands directly inline into an accordion containing evidence and form.
- **Drawback:** Expands rows unevenly, making multi-item scanning awkward when scrolling long lists.

## Selected Structure

- **Chosen:** Candidate A (Split Workspace with Responsive Stacking).
- **Narrow-screen priority:** List remains visible; selected item is visually anchored with an inspector section and explicit `data-testid="back-to-list"` to refocus or return to list scanning. Search and shortage filter state remain persistent.

## Design System & Tokens
- **Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Palette:** High-contrast neutral slate (`#0f172a`, `#334155`, `#64748b`), crisp surface whites (`#ffffff`, `#f8fafc`, `#f1f5f9`), distinct alert/shortage amber/rose (`#b91c1c`, `#fef2f2`, `#dc2626`), and calm verified emerald (`#15803d`, `#f0fdf4`).
- **Contrast:** Exceeds WCAG AA (4.5:1 for normal text, 3:1 for large text and UI components).
- **Touch Targets:** At least 44x44px for primary interactive elements.
