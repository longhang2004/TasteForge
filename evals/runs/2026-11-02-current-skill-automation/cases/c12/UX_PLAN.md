# UX plan: Field Kiln — Everyday Teapot Product Page

## Task and constraints

- User and frequency: Prospective tea enthusiasts and craft buyers purchasing a handmade ceramic teapot (one-off purchase decision).
- Target route/state and visitor success: Decision surface. Visitor success means understanding the teapot's physical attributes (material, dimensions, capacity, care), comparing glazes and stock availability, seeing total purchase conditions (shipping, delivery, returns, total cost), selecting a variant and quantity, and adding to a simulated cart with clear confirmation.
- Existing product-context source, fixed choices and provisional assumptions: `fixture.json` is the sole source of truth (brand: Field Kiln, product: Everyday Teapot, price: $68, shipping: $8, capacity: 650 ml, dimensions: 16 cm wide × 12 cm high, material: Glazed stoneware, variants: Iron [4], Ash [0], Sand [7]). Fictional shop and sample illustrations disclosed prominently.
- Primary action and successful outcome: Select glaze (initially Iron, Ash unavailable, Sand selectable), set quantity (1–4), review shipping-inclusive total, and commit via simulated "Add to cart", yielding visible confirmation with selected glaze, quantity, and total.
- Decisions needed before that action: Confirm glaze appearance and stock; understand volume (650 ml) and dimensions (16 × 12 cm); verify total cost ($68 × qty + $8 shipping); review care instructions and return policy.
- Information that must be compared or remain together: Selected glaze, stock state, quantity input, unit price, flat-rate shipping ($8), and shipping-inclusive total must remain co-located with the commit button.
- Consequences of an error and recovery needs: Attempting to select or purchase out-of-stock variant (Ash) is prevented by disabling the add action and displaying clear out-of-stock messaging; invalid quantities are clamped between 1 and 4.
- Existing system to preserve / authorized redesign scope: Creation task in bare starter repository; no pre-existing styles to preserve. Use TasteForge `gallery-led` direction with system-serif typography.
- Content, language, accessibility, and technical constraints: Plain HTML/CSS/JS without build steps or external dependencies. System font fallbacks only (`Georgia, serif`). Strict contrast >= 4.5:1. Fully usable without hover. No fake scarcity or reviews. Test hooks: `data-testid="glaze-iron"`, `glaze-ash`, `glaze-sand`, `data-testid="quantity"`, `data-testid="add-to-cart"`, `data-testid="cart-status"`.

## Source observations

- Reference 1: `template-sb-shop-item-dist-index` (StartBootstrap Shop Item)
  - Evidence: Extracted HTML structure from catalog.
  - Observation: Standard 2-column e-commerce layout separating hero media and purchase controls.
  - Fit/Adaptation: Useful split-screen archetype, but default template lacks detailed craft specifications, shipping disclosures, and in-place cost breakdown. Adapted to give equal weight to physical craft specs and upfront policy details.
- Reference 2: `promax-styles-minimalist-monochrome` (Catalog reference)
  - Observation: High-contrast, clean typography, minimal ornamentation, letting product imagery and material honesty drive visual interest.
  - Adaptation: Adopted warm neutral backgrounds (`#faf9f5`), rich slate/charcoal foregrounds (`#1c1c1a`), Georgia serif typography, and tactile borders rather than generic SaaS shadows.

## Structural alternatives

### Alternative A: Product Decision Rail with Live Ledger (Selected)
- Region map: Header with fictional disclosure -> Two-column craft workspace:
  - Left column: Illustrated teapot showcase, vector illustration disclosure, physical dimensions/capacity diagram, and care guidance.
  - Right column: Brand/Title, Price ($68), Glaze selector (Iron, Ash, Sand with stock badges), Quantity selector (1–4), Live Order Calculation Ledger (Item subtotal + $8 shipping = Total USD), Add to Cart button, visible Cart Status feedback, and transparent Delivery & Return terms.
  - Footer: Comprehensive fictional disclosures and source attribution.
- Decision order: Inspect craft specs -> Pick glaze -> Adjust quantity -> Check total -> Commit -> View status.
- Narrow-screen priority: Single logical reading column; media leads, followed immediately by title, price, glaze options, live total, add button, and expandable/scannable craft specs. All details accessible without hover.

### Alternative B: Tabbed Accordion Product Sheet
- Region map: Large media banner -> Horizontal tabs (Purchase, Specifications, Care, Shipping & Returns).
- Tradeoff: Hides vital purchasing conditions (dimensions, returns, shipping) behind interaction tabs, increasing friction and violating the requirement that practical details be discoverable before purchase. Rejected in favor of Alternative A.

## Selected structure

- Alternative A selected because it satisfies all constraints: visible practical details, upfront shipping and order total calculation before purchase, and no hover-dependence.
- Essential content visible without scrolling on desktop and in natural reading flow on mobile.
- State sequence: Default (Iron, Qty 1, Total $76.00, Add enabled) -> Ash selected (Stock 0, Add disabled, Total shows unavailable) -> Sand selected (Qty 2, Total USD 144.00, Add enabled) -> Add clicked (Visible cart-status confirmation: Sand, Qty 2, USD 144.00).

## Visual treatment after structure

- Direction: `gallery-led` (seed 42, TasteForge engine 0.1.0).
- Typography: System serif (`Georgia, Cambria, 'Times New Roman', serif`) for headings and body, giving an authentic artisanal workshop editorial feel.
- Colors: Earthy stoneware tones (`#f7f5f0` canvas, `#ffffff` card surface, `#2c3531` primary slate text, `#5a625e` muted secondary text, `#2a3832` deep glaze accent, `#c48b71` warm terracotta highlight, `#8c9184` border).
- Contrast: Checked for minimum 5.5:1 text contrast on all surfaces.
- Motion: Zero or minimal instant transitions, respecting `prefers-reduced-motion`.
