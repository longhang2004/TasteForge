# Creator notes — Kiln Notes pouring cup

Standard effort, one creator, Create workflow (`.opencode/skills/tasteforge/workflows/create-ui.md`); one supporting reference read (art-direction worked pairs). No plan file or alternative prototypes, per prompt.

## Compact record

- **Truth/task:** a shopper picks a glaze (Sand/Iron selectable; Ash visibly sold out) and a whole quantity 1–4 within stock, sees subtotal/shipping/total beside the action, and adds to a simulated cart: first valid attempt fails recoverably, retry succeeds; success names glaze, quantity, total. All facts from `fixture.json` only.
- **Constraints:** no remote assets/fonts/packages; system fonts; semantic controls; visible keyboard focus; programmatic announcements; 320/390/1440 widths, natural vertical scroll; no invented claims.
- **Choice:** object-sheet product page — schematic + measured specs left, decision panel right (glaze radiogroup → quantity → cost block beside action). Matches the "commerce option/cost decision" worked pair: one honest object schematic earns an object sheet where specifications and complete purchase conditions sit beside options/cost.
- **Checks:** source-level only in this lane (see Unassessed below).

## Chosen structure

- Masthead (brand + "Fictional demo" tag, from `fixture.json`'s `fictional: true`), `h1` product name, one-sentence fixture description. No hero nav, no unrelated sections.
- Left column: the SVG presented as a framed "plate" with the fixture caption verbatim, a ruled Specifications list (capacity, dimensions, material, care — fixture strings verbatim) and Shipping/returns terms (fixture strings verbatim, including "no delivery date is promised").
- Right column decision panel (`<form novalidate>`): glaze `<fieldset>/<legend>` with radio cards (Sand 4 in stock, Iron 2 in stock, Ash disabled + "Sold out" chip and struck name), quantity `input type=number` (min/max/step, `inputmode`, `aria-describedby` → hint + inline `role=alert` error), failure alert (`role=alert`, focused on failure), cost `<dl>` (item subtotal, flat shipping, total) immediately beside the "Add to simulated cart" button, success `role=status`, and a standing "no real order is placed and no payment is taken" note.
- Behavior: submit validates empty/zero/negative/fractional/excessive input with actionable messages (invalid attempts never consume the failure); switching glaze judges the quantity currently shown — a positive whole quantity above the selected limit (min(4, stock)) clamps to it, announces the change in the status region and re-renders totals, while an empty/zero/negative/fractional entry stays visibly invalid (no clamp, no announcement); the first valid attempt fails with choices preserved, retry succeeds; any edit to glaze/quantity clears stale success and failure feedback; totals re-render from valid input and show em-dash placeholders in a muted cost block while the displayed quantity is invalid.

## Art-direction decisions (2)

1. **Palette and type taken from the schematic itself.** Paper `#eee6d7`, ink `#493c33`, secondary line `#665345` are the SVG's own background/text/stroke colors; the fixture's variant colors are used literally as the glaze swatches (`--swatch`), so the option row compares real product data rather than decorative chips. Georgia serif for display headings over a system-sans body gives a studio catalog-plate feel without remote fonts. Ink/paper contrast ≈ 8.6:1; secondary text ≈ 6.5:1 on the panel; error and success tones were picked to clear 4.5:1 on their tints (computed, not measured on render).
2. **The schematic is staged as a dimensioned plate, not a photo.** Because the only media is a line schematic with a dimension rule, the composition honors its caption's honesty: it sits on a lighter mat with a hairline border, specs are set as a ruled list with tabular numerals echoing the dimension line, and no photographic treatment, texture claim or extra media was invented to fill the composition.

## Source / asset rights

- All product facts come from the in-project `fixture.json`; the image is the provided `assets/pouring-cup.svg` (original schematic, used as-is, referenced relatively). Provenance and hashes are recorded in the project's frozen-input manifest (`input-freeze.json`). No external/remote assets, fonts, packages or requests; alt text is derived only from fixture facts and the asset's self-description.

## Tradeoffs

- Image-first source order means the decision panel sits below the fold at 320px; vertical scrolling is allowed by the brief, and the cost block stays directly attached to the action at every width.
- While the displayed quantity is invalid, subtotal/total show em-dash placeholders in a muted cost block instead of stale numbers; flat shipping stays $6.00 because it does not depend on quantity. The inline error explains what to enter.
- Native `type=number` spinner is kept instead of custom steppers: one semantic control, though spinner chrome varies by platform.
- The sold-out Ash radio is `disabled`, so it is intentionally not keyboard-reachable (it is not actionable); its card keeps full-contrast text, a dashed border, a struck name and a "Sold out" chip so the state is visible.

## Amendment (Fast effort, source-only)

Independent review found, and parent browser testing reproduced, a clamp defect at 1440/390/320: the glaze-change handler compared `lastValidQty` (last accepted quantity) instead of the quantity currently displayed, so Sand ×5 → Iron kept 5 with stale $42/$48 totals, cleared feedback and no announcement. Focused fix in `index.html`: glaze changes now classify the displayed value — a positive whole quantity above the selected limit (including one already above the general 4 limit) clamps, announces and re-renders matching subtotal/total; empty/zero/negative/fractional entries keep an actionable inline error and swap subtotal/total to placeholders so no previous total presents as current. Typing invalid input now also shows the error and placeholders live; valid input restores accurate totals. Ordinary valid clamping, first-valid-attempt failure, retained choices, retry, success details and stale-success clearing are unchanged; layout, facts, asset and styling untouched. Checks here are source-only; the recheck traces — Iron / 2 / $84.00 / $90.00 after Sand ×5 → Iron, and invalid states surviving a glaze switch — are unassessed until the parent's browser recheck.

## Unassessed checks (this lane had no browser tools)

- Rendering at 320px / 390px / 1440px, horizontal-overflow behavior, and natural-scroll captures.
- Actual screen-reader announcements (live regions are wired via `role=alert`/`role=status` but announcement behavior is untested here).
- Automated accessibility runs (axe or similar), measured contrast on final renders, and real focus/keyboard traversal captures.
- The recoverable-failure/retry sequence was implemented in source but not executed in a browser.

## Created files

- `index.html` — the runnable product decision slice (inline CSS/JS, no external requests).
- `creator-notes.md` — this record.
