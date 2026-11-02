# Try a structure, inspect it, and edit it

Use for a substantial new layout or authorized composition change after identifying the task and constraints. Keep small refinements within the existing structure. This is an agent workflow, not a new CLI command or a validated layout generator.

## Make alternatives observable

When layout is genuinely undecided, build two small, runnable structural candidates before visual polish. Share the same realistic content, data, behavior and rough styling. Limit this to the representative task slice; do not build two complete products. A different overview/detail relationship, decision location or disclosure sequence is meaningful; another palette is not. If an established pattern or the user's constraints already settle the structure, test that structure and explain why additional candidates would not inform the decision.

Open each candidate at a wide and narrow viewport. Include a representative long name, the decision/review state and one recoverable error. Compare:

- What can the person compare, and what must they remember across views?
- Which evidence is adjacent to the decision? Is repeated information serving comparison or merely extending the page?
- Does mobile preserve useful context or carry the entire desktop overview above the action?
- How do return, edit, validation and retry preserve values and focus?

Use the existing browser/test tooling where possible. Plain HTML prototypes are sufficient. Keep prototype switches in development artifacts, not in the product's user flow. If rendering is unavailable, retain the structural sketch and explicitly mark the selection provisional. Do not describe source inspection or a grayscale filter as observed usability.

Record the selected candidate, actual prototype paths, inspected states and concrete tradeoff in `UX_PLAN.md` or existing project guidance. Select on the task; visual-reference sampling follows this decision.

## Render the chosen task, then edit

After implementation, inspect actual wide/narrow renders of entry, decision/review and recovery, plus task-specific states. Exercise the action path, keyboard focus, retained edits and long content. Check at a narrower supporting width or zoom when available; document what was actually exercised.

Write a short `DESIGN_REVIEW.md` or use the project's review location:

| Observed issue and task consequence               | Screenshot/trace            | Change                                          | Result after checking again    |
| ------------------------------------------------- | --------------------------- | ----------------------------------------------- | ------------------------------ |
| Specific content or behavior, not “looks generic” | Actual artifact/state/width | Remove, merge, reorder, clarify or fix behavior | Observed outcome or unresolved |

Identify the few most consequential problems. Revise at least once when the evidence exposes a material issue, then render the affected states again. Usually one or two bounded passes suffice for a representative slice; stop expanding the exercise when remaining questions need user/domain evidence. Do not invent defects or make arbitrary edits to satisfy an iteration count.

Look for useful subtraction: merge repeated evidence, shorten orientation copy, remove an empty region with no current job, or disclose secondary detail when needed. Cards, whitespace and conventional tables remain valid when they help this task. Do not compress essential evidence or obscure focus just to shorten the page. A button's page coordinate is a diagnostic, not a universal fold limit or proof of ease.

Use domain terms, units, actual content lengths and honest consequences. Do not add forecasts, urgency, testimonials or operational claims merely to give the UI character. Let emphasis and density follow the work. Document the reasons for recurring visual choices rather than adding arbitrary irregularity.

## Keep the evidence honest

Separate executed behavior, automated accessibility findings, agent visual inspection and human/user review. A passing task script does not establish comprehension; zero axe findings do not establish accessibility conformance. Record missing tools and unresolved questions. Never label an agent-produced example “human designed” or “user validated” without that review.

For a warehouse slice, a useful relationship might be: comparable stock rows → selected item's stock ledger → editable quantity → retained review/error/success. On mobile, a separate detail view can retain search/filter state without displaying the whole list above every decision. This is a task-specific option, not a universal dashboard recipe.

When relevant users are available and the session authorizes involving them, ask them to perform realistic tasks without naming the controls. Observe interpretation, mistakes, recovery and lost context. Save their actual observations separately from agent judgments; keep approval/review status pending until it happens.
