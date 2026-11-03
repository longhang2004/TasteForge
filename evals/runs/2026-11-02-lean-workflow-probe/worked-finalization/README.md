# Focused finalization after actual gate findings

This is a corrected copy of raw `cases/l04`, not a fifth paired UI submission or another creator sample. Raw l04, its screenshots, notes and provider metrics remain unchanged.

The operator made three scoped changes: darken the existing blue normal/hover accent for button contrast; remove the invalid definition-list separator child and retain its visual rule on a valid dt/dd group; replace “Guaranteed Rate” with “Illustrative exchange rate”. OnlyHTML/CSS changed; JavaScript, fixture and original task remain byte-identical. [Correction metadata](correction.json) retains before/after hashes.

The same capture tool runs against `cases/f01` with natural scroll/focus. Three traces pass63/63 task/width checks, with no axe violating rule reported in the captured initial/failure/final stages. Incomplete ARIA/contrast findings remain; this is not accessibility certification or user research. [Actual trace](evidence/f01/browser.json).

The first operator invocation refused an incomplete worked-copy manifest before executing any trace. That setup refusal is retained separately; metadata was completed before the passing execution. No raw trial was changed to clear a gate.

Initial AGY paired usage/time figures exclude evaluation and this correction. Its end-to-end model/resource cost was not measured; do not advertise the initial20% input reduction as the cost of this finalizedUI.

Serve the parent study directory and open `/worked-finalization/cases/f01/` to inspect the result.
