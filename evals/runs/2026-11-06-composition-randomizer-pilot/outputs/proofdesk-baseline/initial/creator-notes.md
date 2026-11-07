# ShiftPress proof desk — creator notes

Direction: a compact working print desk, with warm paper surfaces, fine rule lines, an ultramarine action color, supplied artwork thumbnails, and generous editorial titles. Queue is the initial screen; no job auto-opens.

Facts and decisions:
- Each copy consumes one sheet and preview never decrements shared stock. Available / run / remaining quantities stay together beside the form, and review repeats title, paper, copies and remaining sheets.
- Cotton White has 120 sheets, Kraft 60, Recycled White 0. Recycled stays visible as unavailable. Changing paper clamps a previously valid run only when necessary and announces it. Invalid values retain an error and replace totals with em dashes.

Reference use: read supplied tasteforge/SKILL.md, workflows/create-ui.md, frozen reference-pack.json, style-document.json, template-document.json and local font specimen metadata. Accepted calm hierarchy, semantic colors, consistent control corners, visible labels, preserved state and explicit recovery. Adapted Fluent 2 suggestions into a print-specific visual system; rejected platform branding and blur because the supplied artwork and paper are the primary evidence. Rejected the forgot-password template's isolated single-input structure because the queue, proof and consumption need connected context. No reference code or upstream commands were reused or executed.

Typography: local Archivo for controls and metadata, local Newsreader for editorial headings. Supplied specimen metadata lists both English and Vietnamese for these fonts. Actual glyph rendering remains unassessed. Existing font license files retained in assets/fonts.

Task and states: search by title/ID, All / Needs proof / Approved filtering, per-job draft choices, selected queue marker, edit/review, integer/stock validation, disabled unavailable paper, pending approval, explicit first-attempt failure, retry success and persistent local success until editing. Queue query/status and selected job survive navigation. Approval is an in-memory local demonstration; reloading starts fresh. No printing, charging or sending.

Accessibility/source provisions: semantic buttons, visible labels, skip link, focus-visible outlines, heading/control focus management across state changes, live quantities and clamp announcement, alert on recoverable failure, language tags on Vietnamese job titles, no required animation, reduced-motion override, wrapping titles, one-column layout under 760px. Source uses only relative local assets and inline CSS/JS; no dependencies or network calls.

Checks and limits: source-only inspection/check results will be recorded below. Browser behavior, rendering at 320/390/1440, actual glyph rendering, zoom, full keyboard flow, axe, and human usability remain unassessed here and are delegated to parent checks. No rendered validation is claimed. Usage/billing is unknown.

Source-only verification completed:
- node --check passed before and after the focused correction.
- Embedded papers/jobs exactly match fixture.json (JSON parity assertion).
- Ten pure quantity checks passed: empty, zero, negative, fractional, above-stock, lower-stock, unavailable-stock, and valid boundary values. This does not exercise DOM interaction.
- All three proof assets and both selected local font files exist.
- Main color contrast calculations: ink/paper 13.59:1; muted/paper 5.33:1; white/blue 7.26:1; error/surface 6.98:1; green/paper 7.02:1. These are source color pairs, not rendered contrast certification.
- Required control-name strings were inspected; Open labels are generated from authoritative job IDs. Back to queue now has an explicit exact accessible label.
- first-write.html was copied from the first complete index.html before any correction and remains unchanged.

One focused correction pass: disabled queue navigation during the short pending approval to avoid a detached-state callback; preserved the success screen when reopening an approved local draft; added live result counts and the exact Back to queue label; hid the optional header tag below 430px to prevent narrow-header crowding. No alternative direction or further polish pass.

Environment: initial sandboxed WSL call was denied; approved escalated WSL calls succeeded. No native shell fallback, network, installation, browser, other model, or subagent was used.

Approximate tool-call count: 9 (including initial denied WSL call). Actual model usage and billing are not exposed.


completedAt: 2026-11-06T09:36:27Z
