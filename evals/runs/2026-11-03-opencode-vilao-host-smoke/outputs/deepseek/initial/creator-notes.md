# Kiln Notes pouring cup — creator notes

## Structure

Product decision rail. At 900px and wider, the supplied schematic and product record sit on the left, with care/returns/shipping below; the glaze, quantity, receipt-style totals and action sit in a right-hand rail. At 320px and 390px the order is media → product record → decision rail → care/returns/shipping. Nothing is sticky, so vertical scrolling stays natural and no panel hides content or focus.

## Art direction

1. **Studio sample card.** Warm unbleached paper, a restrained serif product title, the supplied SVG matted like a catalog plate, and ruled metadata that reads like a kiln record. The exact caption sits directly under the plate. This treatment comes from the physical object and the schematic, not generic commerce cards.
2. **Material ledger.** Glazes are full-width rows with fixture color chips and stock counts; Ash keeps a visible "Sold out" label and a disabled native radio. Totals use aligned, tabular figures like a receipt stub beside the add action. No extra photography, texture claims or product properties were invented.

## Behavior implemented

- Starts with Sand selected, quantity 1, subtotal USD 42.00, shipping USD 6.00, total USD 48.00.
- Sand stock 4, Iron stock 2, Ash stock 0. Quantity accepts whole values 1–4 within stock; empty, zero, negative, fractional, non-numeric and excessive values receive specific validation and cannot submit.
- Switching from a higher quantity to a lower-stock glaze clamps to that stock and announces the change in a live status region.
- The first valid add fails deterministically with a recoverable message; the same control then succeeds, preserving glaze and quantity. Success names the glaze, quantity and total. Any later edit clears stale success. No payment or real order is implied anywhere.

## Sources and rights

Only the provided `fixture.json` and `assets/pouring-cup.svg` were used. The task identifies the brand as fictional and the SVG caption identifies it as an original schematic. No remote images, fonts, scripts or requests were added; fonts are system stacks. No asset reuse outside this study is claimed.

## Tradeoffs

- On narrow screens the action follows the image and product record, so it is not above the fold; this preserves product evidence before commitment.
- Invalid quantities show dashes for item subtotal and total rather than a potentially misleading number; shipping stays visible.
- Stepper buttons use `aria-disabled` rather than native `disabled` so keyboard focus is not dropped when a bound is reached; the action is a no-op at the bound.
- The intentional first-attempt failure is a requested simulation, not an implied service failure.

## Unassessed checks

No browser, screenshot, device, keyboard, screen-reader or automated accessibility run was available in this creator lane. The 320px, 390px and 1440px layouts, natural-scroll behavior, visible focus rings, live-region announcements, contrast and horizontal-overflow behavior are unverified in rendering. Source-level checks only: fixture text and prices were transcribed, IDs referenced by ARIA exist, controls use native semantics, and no external requests are present. Parent browser acceptance remains necessary.

## Created files

- `index.html`
- `creator-notes.md`
