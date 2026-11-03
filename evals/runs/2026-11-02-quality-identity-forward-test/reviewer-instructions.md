# Independent A/B review

Inspect only `review-packet/` plus these instructions. Do not read the run manifest, key, creator records, other reviewers, teaching studies or repository implementation notes. You authored none of these outputs. Labels A/B are randomized independently per task; neither label is preferred. The same packet is supplied to two reviewers. Do not infer a desired winner.

Read `index.json` and both task facts. Inspect both variants' normal wide and narrow images and relevant natural action states. A useful bounded sample per variant is wide entry (optional full-page separately),320/390 entry and the consequential failure/return/detail state; expand only for a named concern. Use actual image viewing tools, not filenames as evidence. Source/checks may clarify behavior. Full-page presence does not prove post-action visibility; preserve the recorded scroll/focus interpretation. No need to run another full automation suite unless a specific blocker is uncertain. No human tests, network, installs, commits, Linear or global changes.

Judge each case separately. For every dimension choose `A`, `B`, `tie` or `unassessed`, with concrete file/state evidence and a tradeoff. More novel is not automatically better. Familiar controls and ties are valid. No aggregate score or uniqueness/slop number.

Task quality dimensions:

1. Entry/action priority and grouping.
2. Decision context, truthful claims and consequence.
3. Narrow reading/action access.
4. State retention, editing/failure/recovery where relevant.
5. Keyboard/focus/contrast/semantics within available evidence.

Product specificity dimensions:

1. Supplied facts/artifacts that actually shaped composition.
2. Coherent media/caption/type/hierarchy/spacing direction.
3. Structure responding to relationships rather than an interchangeable shell.
4. Recognizable decisions preserved across widths/states without task harm.

Write your assigned `reviews/reviewer-N.json` and `.md`. JSON shape: `reviewer`, `startedAt`, `finishedAt`, `inspectedImages` (exact relative packet paths), `cases` keyed `press`/`listen`, each with `taskQuality` (five objects) and `productSpecificity` (four objects). Each object: `dimension`, `verdict`, `evidence`, `tradeoff`. Also include `findings` (concrete blockers or quality concerns with task/label/file), `limitations`, and observed resource fields/null unknowns. Markdown can be a compact evidence-backed explanation. Freeze your initial judgments, send hashes, and do not overwrite after learning treatment identity. If an objective blocker needs clarification, append a separate note.

Keep review proportional (soft8 minutes, hard12). Record actual images inspected and unassessed dimensions. Blinding is procedural: outputs can hint at guidance/style; exact creator/model identity and condition key are withheld. Automated zero findings does not prove accessibility conformance, comprehension, human usability or uniqueness.
