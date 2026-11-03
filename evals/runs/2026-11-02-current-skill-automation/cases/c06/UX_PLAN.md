# Transfer review flow · c06

## Purpose and success

- **Surface:** transactional work flow for an occasional customer. Success is checking recipient, fee, total debited, received amount, and delivery estimate before confirming a simulated transfer.
- **Fixed context:** fictional sample, USD 250 initial amount, flat USD 2.50 fee, 25,000 VND per USD, Vietnam, long Vietnamese recipient name, $1–$1,000 amount range, illustrative 3 November 2026 estimate, recoverable first failure.
- **Information that stays together:** recipient identity, entered/sent amount, fee and total, recipient's VND amount, source account, delivery estimate, and the action that commits the simulation.
- **Density/expression:** restrained task UI with a narrow readable form, adjacent receive estimate, and a distinct review ledger. Use system sans-serif fallbacks and a low-saturation green accent; avoid display effects that compete with financial values.

## Structure decision

1. **Focused entry → check answers → confirm** (selected): a recipient and amount form leads to a separate review with all costs and destination details, then an explicit confirm. Editing returns to the form with values retained. On mobile, fields and estimate stack, and the review ledger precedes its confirmation controls. This makes the consequence review unmistakable and satisfies the required editable/review states.
2. **Continuous workbench with live ledger:** inputs and a changing cost summary share one screen, followed by confirmation. It reduces navigation and shows the conversion immediately, but makes the final check less distinct and is not as clear for the specified review/confirmation sequence.

The task fixture and the TasteForge “focused task with check-answers” archetype settle the interaction structure; no separate runnable architecture experiments were needed for this tightly specified flow. The entry screen includes a live receive estimate while retaining the dedicated check step.

## State path and checks

`details → review → first-confirmation failure → retry success`. Details can be edited from review or failure. Invalid amounts show an associated correction while preserving recipient and amount. Success and failure each state that this is a simulation and no money moved.

- Review has recipient, sent amount, $2.50 fee, total debited, VND receive amount, source account, and illustrative delivery date.
- Edit preserves both form values and recalculates the review.
- Recipient and amount are labeled native controls; keyboard focus is visible; errors and outcomes have text feedback.
- Long Vietnamese name wraps in form and review; mobile layout stacks controls and decision details.

## Reference and tool record

- Read frozen TasteForge `workflows/create-ui.md`, `workflows/research-and-plan.md`, `references/surface-purpose.md`, `references/accessibility.md`, `references/catalog-use.md`, `references/design-principles.md`, `references/typography.md`, and `references/layout-archetypes.md`.
- External browsing was prohibited. No live products or external sources were inspected.
- CLI version: `0.2.0-beta.1`. Offline catalog version from `catalog --kind template --task form --limit 4 --format json`: `2026.11.01.2`, four metadata matches (AdminLTE contact, forgot-password, login, recover-password), source structure only. None informed the transaction hierarchy; no template content was imported.
- Tried `inspire --task form --count 3 --seed 42 --format json`; it returned `ENOENT` for missing `.tasteforge/brief.json`. No brief/setup files were added solely for inspiration. No generated DNA or style candidate is claimed.
- Visual system and component styling below are manual decisions for this local sample, not imported reference assets: paper-white working surfaces on pale sage-gray canvas, deep ink body text, dark green action/receive treatment, and labeled warm error feedback.

## Review evidence

One supplied self-review render is required and recorded in `implementation-notes.md` after inspection. A visual rendering is not user testing or complete accessibility verification.
