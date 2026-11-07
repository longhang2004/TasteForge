# Signal Cabinet — creator notes

completedAt: 2026-11-06T09:36:37Z
Effort: Standard; one creator, one complete direction, one focused source inspection and correction.
Approximate tool calls: 8, including one WSL access-denied attempt and its successful escalation. Actual token usage and billing are unknown.

## Task and factual decisions
- Authoritative content: fixture.json. All six records are embedded verbatim in the inline JavaScript so the artifact can run directly without fixture-fetch limitations. Source comparison confirmed exact field/value parity.
- The records span 1986–2008 and use three materials. The small date range and material filter come from those facts, without historical provenance or physical-condition claims.
- Actual supplied graphics have consistent 600 × 360 SVG canvases while recorded dimensions differ. Equal image areas support visual browsing; dimension labels remain explicit in detail and comparison rather than implying graphic scale.
- Archivo is used for headings, controls, Vietnamese titles, and metadata. The supplied specimen metadata lists English and Vietnamese support. Its original local font and OFL notice remain in assets; actual rendered glyph behavior is unassessed.

## Reference decisions
Read tasteforge/SKILL.md, workflows/create-ui.md, frozen reference-pack.json, brief.json, selected style-document.json and template-document.json, font specimens, and the six SVG sources. No upstream links were visited or code executed.
- Accepted exploration-query-results: query and material scope precede an accurate result count, consistent peer-image grid, empty/reset state, detail, and retained return context. The grid becomes two columns then one column with width.
- Adapted Memphis geometry to the actual directional arrows and compact square masthead mark. Rejected neon clashes, arbitrary squiggles, tilted panels, and animation because supplied artifact colors and legible metadata carry the archive identity more clearly.
- Rejected the Freelancer contact/about/form sequence: it does not serve panel exploration or two-record comparison. No upstream code, copy, branding, or media was reused.

## Implemented state and access paths
Combined accent-insensitive title/ID/route search and material filtering; accurate counts; zero results and reset; named open/pin/unpin controls; at most two distinct pins; visible pinned identities and removal; disabled comparison until two pins; explicit third-pin recovery feedback both live and beside the fixed comparison shelf. Metadata labels cover ID, title, year, material, dimensions, and route in detail and comparison. The actual corresponding SVG is used in both.

The first open intentionally fails with an honest local-demonstration explanation. Retry opens the same selected record; later opens succeed. Filters and pins remain in memory, and Back to results restores the saved scroll position and a useful focus target. Pin controls remain in results and detail, including the simulated failure state. Focus moves to state headings on open/compare/retry and to a visible control after shelf removal. No payment, order, or cart flow.

Semantic controls, language attributes on Vietnamese titles, skip link, visible focus outlines, polite atomic status feedback, reduced-motion override, flexible intrinsic sizing, and 320/390/1440-oriented breakpoints are present in source.

## Source-only checks and correction
- Initial complete source preserved as first-write.html before correction.
- node --check passed for extracted inline JavaScript before and after the focused correction.
- Python source checks confirmed all six embedded records match fixture.json exactly; all supplied SVG paths, the chosen font, and its license exist; HTMLParser accepted the document; no remote asset or dependency URLs occur.
- One focused state-source inspection identified that shelf removal could focus a hidden results control and that third-pin feedback could be above the viewport. Corrected the fallback to the active view, added shelf-local limit feedback, and gave shelf removal distinct accessible names.
- Calculated opaque UI color pairs: ink/paper: 13.10:1; muted/paper: 5.76:1; white/ink: 14.42:1; ink/yellow: 11.76:1; shelf secondary/ink: 10.09:1; focus/paper: 7.13:1. These are source color calculations, not rendered contrast measurements.

## Unresolved limits
No browser, screenshot, axe, human, or rendered checks were run. Parent-owned browser checks must assess actual task behavior, keyboard order/focus, Vietnamese glyphs, 320/390/1440 layout, zoom, fixed-shelf reachability, and final visual contrast. No claim of responsive, accessibility, or human validation is made. Pin state is in memory for the current page session; persistence across reloads was not required. The intentional first-open failure is session-local. No network, installs, global configuration, sibling/parent/history/gallery inspection, subagents, commits, or pushes were used.


## Parent-targeted correction allowance

completedAt: 2026-11-06T09:48:52Z
Approximate correction tool calls: 4 (approximately 12 total). Actual token usage and billing remain unknown.

Read only the designated cabinet-candidate.md correction feedback outside this cell. Parent reports matched-v2 task paths passed and identifies label/content/name and active compare-button contrast failures; those parent results are attributed, not independently reproduced here.

Applied one focused batch to index.html: Open controls now visibly read Open SC-xx while the Vietnamese title, year, and record identity remain in their original card order outside the button. This keeps the required exact accessible names and aligns visible button text. Pinned controls visibly read Unpin rather than Pinned in both initial markup and live updates, matching their required Unpin SC-xx accessible names. The comparison-shelf button explicitly retains ink text on yellow during hover and active states (the existing calculated pair is 11.76:1), preventing the higher-specificity generic hover background from creating the reported 1.53:1 pair. Disabled and focus styles remain.

Source checks: extracted inline JavaScript passed node --check; assertions confirmed Open button text excludes title/year, both pin rendering paths use matching action words, and the shelf hover/active foreground/background pairing is explicit. One initial overbroad assertion matched the wasPinned variable identifier; it was narrowed to the actual visible-label templates and passed without further source modification. Embedded fixture parity still passes. The first-write.html SHA-256 remains bd8fe743e1d64f6cb5e852f3eccbb645a3036a3621c9ef2d00a3adf89d2fc70a. Frozen inputs and assets were not modified.

Limits: no browser, axe, rendered, network, install, or broader polish pass was performed. Parent will rerun matched browser checks. Obsolete first-harness hidden-thumbnail and live-phrase diagnostics were not used to change behavior.
