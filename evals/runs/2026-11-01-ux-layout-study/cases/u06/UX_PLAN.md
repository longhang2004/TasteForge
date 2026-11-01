# Transfer review UX plan

## Task and order
Occasional customers need to verify who receives the transfer and what will be debited before confirming. Use a focused check-answers sequence: editable recipient and USD amount → review containing recipient, send, fee, total debit, VND received, and illustrative delivery estimate → explicit simulated confirmation → recoverable first failure with retry → success. Edit returns to entry with both values intact. Invalid amount bounds are explained before error and retain the other field.

## Structural candidates
1. **Focused entry then review (selected):** first useful action is entering recipient/amount; review assembles all consequences before commit. Edit is explicit and retains values. On narrow screens each step is one vertical reading path. Tradeoff: one extra transition, justified by the cost of misreading a transfer.
2. **Continuous workbench:** inputs next to live ledger, then confirm on same screen. Fast recalculation and clear costs, but editing and committing share one context and it weakens the requested check-before-confirm separation.
3. **Guided wizard:** recipient, then amount, then review. Very focused on small screens, but adds a needless step for two independent fields and slows occasional customers.

## Narrow-screen priorities
Keep entry fields before estimate; keep the complete review and confirmation together; let the long Vietnamese name wrap; make actions full-width at very narrow sizes. Controls are native labeled form controls/buttons with visible focus and status text.

## Visual direction and evidence
TasteForge CLI 0.1.0's seeded `suggest --count 3 --seed 42` returned no compatible direction under the fixed English/Vietnamese and system-font requirements. These constraints were retained. Manual visual decisions use a restrained navy, warm neutral surface, clear borders, and warm focus accent. Offline `inspire --task form --count 3 --seed 42` supplied fixed review gates; its contextual `Preserve Screen State` rule (`promax-app-interface-12`) informed retaining input on edit and retry. The actual record is retained in `cli-reference-output.json`; complete outputs are retained in the `cli-*-output.json` files. CLI scoring and reference fit are heuristics, not usability findings. The catalog's form metadata returned source-only contact/login structures, not transaction behavior. External research was prohibited and not performed.

## Observable checks
- Initial entry includes fixture recipient and USD 250.
- Review shows recipient, $250 sent, $2.50 fee, $252.50 total, 6,250,000 ₫ received, and illustrative delivery estimate.
- Amounts outside $1–$1,000 are rejected without discarding recipient.
- First confirm fails with retained details and retry; retry succeeds with explicit no-money-moved disclosure.
- Edit returns to entry preserving both values.
