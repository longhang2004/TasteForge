Continue the same TasteForge task/context with Fast effort. Make one focused quantity/glaze-state correction in index.html and briefly update creator-notes.md. Reuse the inspected context; the relevant code is the glaze change/input handlers near the end of index.html. Parent already ran browser acceptance, so source-only checks here must remain labeled source-only.

Independent review identified and parent browser testing reproduced this defect at 1440/390/320:
Fresh Sand / quantity 1 → enter 5 → select Iron. The quantity stays 5, subtotal stays $42 and total stays $48, errors are cleared, and no clamp is announced. The handler compares lastValidQty rather than the quantity currently shown.

Use the displayed quantity when switching glaze. A displayed positive whole quantity above the selected stock limit (including a quantity already above the general 4 limit) must clamp to the selected limit, announce that change, and render the matching subtotal/total. The named trace must result in Iron / 2 / subtotal $84 / total $90.

An empty, negative, zero or fractional displayed input must remain visibly invalid with actionable feedback until corrected. A glaze change must not hide that invalid state or present a previous valid total as if it describes the current input. Valid input must restore accurate totals. Preserve ordinary valid clamping, first-valid-attempt failure, retained choices, retry, success details and stale-success clearing.

Keep the existing layout, facts, asset, styling and other behavior. Use read/edit tools inside this project; shell/network/subagents remain unavailable. Stop after the focused patch and a brief honest summary. Parent will run the browser rechecks. Do not switch models, request extra exploration or claim rendered tests.
