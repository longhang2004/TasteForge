# Implementation notes

Built a restrained craft storefront using warm paper tones, dark glaze green, system Georgia headings, and the supplied product illustration. Practical details are permanently visible; the layout stacks on narrow screens.

Accessible native radio controls select Iron or Sand, with Ash disabled and visibly unavailable. Quantity accepts 1–4. Totals include $8 per-order shipping and update immediately. The cart is explicitly simulated, with a live confirmation naming glaze, quantity, and total. Fictional data and illustration disclosures are visible.

## Actual self-review
- Node syntax check passed for app.js.
- Python HTML parser accepted index.html; supplied SVG exists.
- Node VM behavior check passed: initial Iron quantity 1 total $76; Sand quantity 2 total $144 and matching cart confirmation; Ash submission rejected.
- Read implementation against supplied fixture for price, stock, material, dimensions, care, dispatch, transit, returns and disclosures.
- Chromium and Playwright are unavailable in the WSL environment. No rendered inspection or browser automation was performed.

## Known gaps
The single supplied illustration remains Iron when Sand is selected; its caption explicitly identifies Iron. No checkout or persistent cart is provided, consistent with the simulation requirement.
