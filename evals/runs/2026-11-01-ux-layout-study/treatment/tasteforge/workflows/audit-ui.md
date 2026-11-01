# Audit and refine an interface

Inspect the requested source and any existing Design DNA. Preserve the current direction, fonts, colors, component conventions, and branding unless the user authorizes redesign. A refinement task usually needs a local correction, not a new recommendation set.

If the CLI is available, run `tasteforge audit --path <project-local-source> --format json`. With generated DNA present, the engine checks against those tokens. Source-only checks cannot resolve the complete CSS cascade, utility frameworks, computed styles, responsive behavior, keyboard flows, or data truth.

Separate the evidence:

- **Verified:** the stated source condition was established, such as a declared opaque color pair or malformed syntax. Confirm whether runtime conditions affect its user impact.
- **Heuristic:** a pattern deserves inspection, such as three card-like ancestors or several gradients. Keep it when it serves the task.
- **Review:** the source cannot resolve the question; inspect a rendered state or obtain the missing context.

Read [accessibility](../references/accessibility.md), [interaction](../references/interaction-motion.md), or another reference only when relevant. Prioritize task blockers and accessibility failures, then hierarchy and content, then polish. Explain why a proposed change helps a user.

Assess the task architecture even when contrast and token checks pass: locate the first useful action, trace what users must compare, inspect cost/consequence visibility, count unnecessary navigation or context loss, and test edit/error/retry paths. Identify generic composition only through its impact on this task; a familiar layout is not inherently a defect. If structural redesign is authorized and needed, use [research and structural planning](research-and-plan.md); otherwise retain the system and report the issue or make the scoped fix.

For a rendered review, inspect the actual requested views at narrow and wide widths, with long content and meaningful empty/error states. Test keyboard focus and actions. Record which views, states, and methods were checked. For a source-only review, explicitly say no rendered UI was inspected.

Make scoped changes, rerun applicable checks, and summarize remaining uncertainties. Do not convert every heuristic into a mandatory fix.
