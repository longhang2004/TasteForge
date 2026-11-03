# Implementation Notes: Case c12 (Field Kiln — Everyday Teapot)

## Overview & Scope
- Assigned Case: `cases/c12` (`/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-current-skill-automation/cases/c12`)
- Applied Skill: Frozen TasteForge skill at `treatment/tasteforge/SKILL.md`
- Target Surface: E-commerce physical craft product decision surface.
- Technology: Plain HTML5, CSS3, and ES6 JavaScript (`index.html`, `styles.css`, `app.js`). Zero external dependencies, builds, packages, or CDN resources. System font fallbacks only (`Georgia, serif`).

## TasteForge References Inspected
- `SKILL.md` (overall workflow and CLI invocation contract)
- `workflows/create-ui.md` (greenfield creation workflow)
- `references/surface-purpose.md` (decision surface framing)
- `references/layout-archetypes.md` (product decision rail archetype)
- `references/catalog-use.md` (offline reference catalog search and adaptation)
- `references/ux-plan-template.md` (structure and criteria for `UX_PLAN.md`)

## CLI Commands Executed
All commands executed in Ubuntu WSL2 Bash from the `cases/c12` directory:
1. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js --version` (CLI v0.2.0-beta.1 confirmed)
2. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js init` (Generated starting `.tasteforge/brief.json` and `.tasteforge/config.json`)
3. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js suggest --count 3 --seed 42 --format json` (Explored style suggestions)
4. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js inspire --task commerce --count 3 --seed 42` (Retrieved structural references and 10 review gates)
5. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js catalog template-sb-shop-item-dist-index --format json` (Inspected e-commerce template structure)
6. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js generate --direction gallery-led --seed 42` (Generated Design DNA, `.tasteforge/tokens.css`, and `.tasteforge/DESIGN.md`)
7. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js audit --path . --format json` (Ran static source checks, identified contrast issue and off-scale values, resolved contrast)
8. `node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-current-skill-automation/tools/preview.mjs c12` (Executed the single permitted self-render preview)

## Key Design & Implementation Decisions
1. **Source of Truth & Fixture Fidelity:**
   - Fixture values from `fixture.json` were strictly preserved: Brand "Field Kiln", Product "Everyday Teapot", Price $68.00, Shipping $8.00, Capacity 650 ml, Dimensions "16 cm wide × 12 cm high", Material "Glazed stoneware".
   - Variants: Iron (stock 4), Ash (stock 0), Sand (stock 7).
   - Clear disclosure of fictional demonstration store and non-photographic sample illustration in both header banner and page footer.
2. **Behavioral Contract & Test Hooks:**
   - `data-testid="glaze-iron"`, `glaze-ash`, and `glaze-sand` placed on interactive variant buttons.
   - Initial selection: Iron selected, quantity 1, total USD 76.00 ($68 + $8 shipping).
   - `glaze-ash` is unavailable: selecting Ash updates the UI to show out of stock, sets `data-testid="add-to-cart"` to `disabled="true"` with text "Unavailable — Out of stock", and prevents simulated purchase.
   - `data-testid="quantity"` placed on number input accepting values 1–4.
   - `data-testid="add-to-cart"` on primary commitment action button.
   - `data-testid="cart-status"` on visible feedback region with `role="status"` and `aria-live="polite"`.
   - Selecting Sand and setting quantity to 2 updates order total to `USD 144.00` ($68 × 2 + $8 = $144.00). Clicking "Add to cart" produces visible confirmation in `cart-status` detailing selected glaze (Sand) and quantity (2).
3. **No-Hover Requirement & Practical Detail Discoverability:**
   - All physical dimensions, material, capacity, care instructions, shipping rates, delivery timelines, and return policies are permanently visible on screen without requiring hover or interactive tabs.

## Single Self-Review & Iteration Pass
- Rendered images inspected using `read_file`:
  - `evidence/self-review/desktop-viewport.png`
  - `evidence/self-review/mobile-viewport.png`
  - `evidence/self-review/mobile-full.png`
- Observations:
  - On mobile, the 440px image pushed the primary title and purchase controls down.
  - Glaze variant button for Ash had multiline text wrap because of 2-column wrapping on mobile.
  - Order total price in the ledger wrapped across two lines on narrow viewports ("USD" on top, "76.00" below).
- Iteration Revisions Applied:
  - Reduced mobile image max-height to 280px to improve above-the-fold task visibility.
  - Updated glaze button layout: `grid-template-columns: 1fr` on mobile (clean full-width tactile cards) and `repeat(3, 1fr)` on viewports >= 520px (equal, un-cramped cards).
  - Added `white-space: nowrap` to ledger price values so currency strings never awkwardly break.

## Deviations, Tool Limitations & Unverified Items
- Web browsing: Not used or available per constraints.
- External fonts: Excluded per constraints; system-font fallbacks only (`Georgia, serif`).
- Human user testing: Not conducted; verification performed solely via local CLI audit, single preview rendering inspection, and DOM state verification.
- No files outside assigned case `c12` were modified or inspected.
