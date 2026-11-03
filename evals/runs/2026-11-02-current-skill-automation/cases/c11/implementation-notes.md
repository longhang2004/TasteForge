# Implementation Notes: Case c11 (Everyday Teapot)

## 1. Actual Decisions & Architectural Choices
- **Design & Craft Identity**:
  - Structured an editorial, craft-first product page reflecting a functional stoneware studio ("Field Kiln") rather than a generic tech/SaaS template.
  - Employed a tactile, warm neutral ceramic palette (linen paper background `#faf8f5`, stoneware dark slate `#2d3a33`, terracotta/clay highlights).
  - Embedded vector artwork (`assets/teapot.svg`) with clear disclosures stating that images are fictional vector illustrations rather than photographs.
- **Fixture Sourcing & Honesty**:
  - Utilized `fixture.json` as the single source of truth without fabricating reviews, ratings, scarcity counters, or real checkout processing.
  - Disclosed simulation and fictional data visibly in the site header and specifications section.
- **Variant Selection & Availability**:
  - Defaults: Pre-selected **Iron** glaze and **1** quantity on initial render.
  - Ash variant: Handled zero stock (`stock: 0`) with `disabled` attribute, `aria-disabled="true"`, visual sold-out styling, and programmatic guard in `selectGlaze` and `handleAddToCart` ensuring Ash cannot be purchased under any circumstance.
  - Sand variant: Fully selectable with 7 in stock.
- **Dynamic Pricing & Order Calculations**:
  - Unit price: USD 68.00; Flat-rate shipping: USD 8.00.
  - Total calculation: `(quantity × 68) + 8`. At quantity 1: `USD 76.00`. At quantity 2: `USD 144.00`.
  - Visibly displayed before purchase in both the order breakdown summary box and on the Add to Cart button label.
- **Feedback & Confirmation**:
  - Configured `#cart-status` (`data-testid="cart-status"`) as an accessible `aria-live="polite"` region.
  - Upon clicking Add to Cart, renders confirmation specifying selected quantity, glaze finish (e.g., "Sand"), and the shipping-inclusive total (`USD 144.00`).
- **Practical Details Discoverability**:
  - Material ("Glazed stoneware"), dimensions ("16 cm wide × 12 cm high"), volume ("650 ml"), care instructions ("Hand wash. Avoid sudden temperature changes. Not for stovetop use."), dispatch ("Dispatch in 2 business days; illustrative domestic transit 3–5 business days."), shipping ("USD 8.00 flat rate"), and returns ("Unused pieces accepted within 30 days. Customer pays return shipping; original shipping is nonrefundable.") are directly visible prior to purchase.
- **Zero Hover Dependency**:
  - All critical specifications, pricing breakdowns, and stock indicators are permanently visible without hover interactions.

## 2. Test Hooks Verified
- `data-testid="glaze-iron"`: Present on Iron glaze button control.
- `data-testid="glaze-ash"`: Present on Ash glaze button control (`disabled`).
- `data-testid="glaze-sand"`: Present on Sand glaze button control.
- `data-testid="quantity"`: Present on quantity select dropdown (values 1–4).
- `data-testid="add-to-cart"`: Present on main purchase button.
- `data-testid="cart-status"`: Present on cart feedback live region.

## 3. Inspected Skills & References
- **Skills**: No skill files were opened or applied, in strict adherence to user instruction ("Do not read or apply any skill files").
- **Case Files**: Inspected `task.md`, `fixture.json`, and `assets/teapot.svg` in case `c11`.
- **TasteForge CLI**: Executed `tasteforge --help`, `tasteforge suggest --help`, `tasteforge catalog`, and `tasteforge audit`.

## 4. Tools & Verification Executed
- **Static Audit**: Executed `node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js audit --path .` via Ubuntu WSL2 Bash; verified 0 errors, 0 warnings.
- **Self-Render Preview**: Executed single preview command:
  `node /mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-current-skill-automation/tools/preview.mjs c11`
- **Image Inspection**: Inspected generated screenshots via `read_file`:
  - `evidence/self-review/desktop-viewport.png`
  - `evidence/self-review/desktop-full.png`
  - `evidence/self-review/mobile-viewport.png`
  - `evidence/self-review/mobile-full.png`
- **Single Self-Review Revision**:
  - Identified tight spacing in `<legend>` for the glaze label (`Glaze Finish:Iron` -> `Glaze Finish: Iron`).
  - Refined stock label wrapping on the disabled Ash button (`0 in stock (Sold out)`).
  - Added `white-space: nowrap` to the order total value to prevent awkward line breaks on narrow mobile viewports.

## 5. Deviations & Unverified Requirements
- **Deviations**: None. All constraints from `task.md` and `fixture.json` were followed.
- **Unverified Requirements**:
  - Did not execute operator test suite or inspect preview tool implementation, per task constraints.
  - Headless browser automated interactions (e.g. running Playwright/Puppeteer script directly) were not run, as only the single preview tool was permitted. All DOM hooks and logic were statically and visually validated.
