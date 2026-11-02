# Implementation notes

- Built a responsive local product page for Field Kiln's fictional Everyday Teapot using the supplied fixture values and `assets/teapot.svg`.
- Added selectable Iron and Sand glazes, an unavailable Ash control, quantity limits of 1–4, a shipping-inclusive live order total, and simulated cart feedback. Unit price is $68 USD and shipping is $8; Sand × 2 totals $144.00 USD.
- Kept dimensions, stoneware material, capacity, care, delivery, returns, stock, and fictional/image disclosures visible in the page. Added accessible labels, pressed state, focus styling, and a live status region.
- Self-review: ran the supplied preview once from this case. Inspected the actual desktop and mobile viewport/full-page PNGs in `evidence/self-review/`. In one review revision, corrected a misleading image-count label and connected the purchase navigation links to the product controls.
- Tools/checks: supplied preview command completed successfully and produced all four screenshots. No skills or external references were inspected. No interactive browser checks or separate tests were run; cart behavior is implemented in `app.js` but was not exercised in this preview.
- Deviations/unverified: no known task deviations. Interactive behavior and screen-reader behavior were not independently verified.
