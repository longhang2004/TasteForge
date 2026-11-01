# UX plan — Everyday Teapot

## Task and success

The fictional Field Kiln shopper chooses an available glaze, sets quantity, verifies the shipping-inclusive total and practical terms, then adds the selection to a simulated cart. Success means a visible confirmation names the glaze, quantity, and total; no real checkout is implied.

## Source observations and provenance

- Fixture and task: fictional product facts, all copy and constraints are taken from `task.md` and `fixture.json`; the supplied SVG is the sole product visual.
- No external references were browsed (study constraint).
- TasteForge offline catalog `2026.11.01.2`, queried 2026-11-01 with `catalog --kind template --task commerce --limit 3 --format json`. Selected record read: `template-adminlte-pages-examples-e-commerce`, source observation at [ColorlibHQ/AdminLTE, pinned revision](https://github.com/ColorlibHQ/AdminLTE/blob/bd4d9c72931f1dd28601b6bfb387554a381ad540/pages/examples/e-commerce.html). It is a structure-only extraction: navigation/form/aside/sections, one form and 11 inputs; no rendered or responsive behavior was inspected. Used only as evidence that product pages can group choices in a form; rejected its unrelated review/navigation content and did not reuse code or assets.
- A commerce `inspire --seed 42` attempt stopped because the starter has no `.tasteforge/brief.json`; no style suggestion or generated DNA was produced. No candidate was inferred from this failure.

## Structural alternatives

1. **Product decision rail (selected):** product image and identity beside glaze/quantity, full total and action; fit/care/policies below. First useful action is inspecting the object and choosing a glaze. Consequences remain adjacent to the action. On narrow screens image comes first, then the complete purchase decision, then practical details. Best for a single product; it keeps related choices and costs close.
2. **Attribute comparison sheet:** align glaze choices against stock/color and put all specs and policies in a comparison table. It foregrounds comparison but duplicates most product facts across options when only three glazes and one unavailable state exist; narrow-screen table navigation would add work.
3. **Details-first editorial page:** full-width product image and material/care narrative before a separate purchase block. It supports slower browsing but delays the requested glaze and cost decision; poor fit for shoppers arriving ready to choose.

## Selected hierarchy and states

Masthead and breadcrumb → illustrated object with truthful image caption → name, price and stock → accessible glaze controls → quantity → shipping-inclusive live total → simulated add action and live confirmation → delivery summary → material, capacity, dimensions, care and returns. Ash is disabled with visible unavailable text and an accessible label. Iron begins selected at quantity one. Changing either input updates total; adding confirms current values; subsequent edits clear stale confirmation.

## Visual and responsive decisions

Use paper/ink/stoneware greens with a restrained kiln-rust accent, Georgia for product display and system Arial for interface text. Warm neutral backgrounds and compact technical captions support the supplied illustration without presenting it as photography. The desktop two-column composition collapses to image then decision rail then details; below 440px policy content and specs become single-column. Focus outlines are explicit; unavailable is conveyed by label, pattern and disabled semantics, not color alone. Vietnamese phrase `Gốm thủ công` is retained in the shop identity note.

## Observable checks

- Iron and quantity 1 are initially selected; Ash cannot be selected.
- Quantity 1–4 updates the visible total including the fixed $8 shipping.
- Sand × 2 displays $144.00 and the confirmation names Sand and quantity 2.
- Image description, stock, delivery, shipping, returns, dimensions, material and care are present in the page before purchase.
- Check supplied desktop/mobile renders; the separate operator will exercise behavior.
