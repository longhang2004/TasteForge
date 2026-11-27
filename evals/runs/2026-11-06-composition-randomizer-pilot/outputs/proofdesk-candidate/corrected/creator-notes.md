# ShiftPress creator notes

- completedAt: 2026-11-06T09:43:04Z
- Effort: Standard; one complete direction, one focused source inspection, no subsequent source correction required. Approximate tool calls: 8 (including the initial denied WSL call); actual token usage and billing unknown.
- Scope: Only this assigned cell was inspected and written. No network, installs, servers, browser, other agents, or repository history used. Routine shell commands ran through Ubuntu WSL; initial sandbox WSL denial was resolved with authorized escalation.

## Facts and visual decisions

The fixture supplies three jobs, the actual colored proof SVGs, fixed paper stock, and one-copy/one-sheet arithmetic. Queue rows expose job title, format, ink, status, due time, and an explicit Open control without auto-opening. Detail pairs the supplied artwork with parameters and a ruled sheet ledger, because paper choice immediately qualifies quantity and remaining stock. A paper-toned canvas, ultramarine action color, ink-like rules and compact record typography take their cues from the supplied print proofs, without implying photographic material quality.

Read PROMPT.md, tasteforge/SKILL.md, workflows/create-ui.md, references/art-direction.md, fixture.json, frozen reference-pack.json, supplied SVG source and font specimen metadata. Accepted the frozen work-input-output paired workbench relationship and preserve-screen-state/labels guidance. Adapted its quiet parameter rail to a full sheet ledger and explicit review. Rejected the claymorphism suggestion: toy-like inflated surfaces would compete with artwork and stock evidence in this operator task. Rejected screenshot-only narrow behavior; actual controls stack in document order. The shadcn observation is an inspiration relationship only; no upstream code, brand, prose or assets copied, downloaded or executed. AdminLTE adds no needed structure, so was not adopted.

Archivo is used for interface and Vietnamese titles with Arial/system fallback. Supplied specimen metadata lists Archivo English/Vietnamese; font and OFL files exist. Actual rendered glyphs remain unassessed. Original supplied assets and font notices remain in place; all used asset URLs are relative.

## Task and state implementation

Queue starts closed to all details. Search covers ID/title; All, Needs proof and Approved filters are retained. Each job keeps its own draft, stage and recovery state. Paper is a native labelled select; zero-stock Recycled White is visibly unavailable and disabled. Copies reject empty, zero, negative, fractional and above-stock values. Invalid quantities replace used/remaining totals with a dash and disable review; form and approval handlers independently guard validity. Changing paper clamps only previously valid quantities above the new stock and announces the exact adjustment. Other invalid quantities remain invalid. Review shows title, paper, copies, sheet use and remaining stock. First approval deliberately fails with an explicit recoverable message; retry records local success and retains choices. Editing clears success. Queue query/filter and selection survive return. Approval never changes shared stock or prints/sends/charges, and no automatic post-success reset exists. Records last for this session only.

Semantic labels, live feedback, focus on detail/review/recovery and return, visible focus outlines, minimum control heights, responsive 800px/480px stacking, title wrapping and reduced-motion handling are included in source.

## Executed checks and limits

- JavaScript syntax: node --check passed.
- Source assertions: fixture objects exactly match fixture.json; relative assets/font/OFL exist; viewport and reduced-motion rules present; no remote URL references; first-write.html exactly preserved first completed index.html.
- Bounded Node VM tests using a minimal DOM stub passed: quantity boundaries, valid clamp announcement, invalid retention, first failure/retry, choice retention, edit clearing success and query/filter/selection retention. These are logic checks, not browser/task or accessibility validation.
- Calculated text contrast from source hex colors: {'body': 13.04, 'muted': 5.68, 'primary': 7.99, 'error': 7.0, 'pending badge': 7.12, 'approved badge': 7.86}. All sampled pairs exceed 4.5:1. This does not certify every rendered combination.
- Browser rendering, actual glyph display, widths 320/390/1440, zoom, keyboard completion, screen-reader experience, axe and human usability are unassessed here. Parent is responsible for matched browser checks. No rendered/human validation claims are made.

## Parent-targeted correction

- completedAt: 2026-11-06T09:49:49.346Z
- One focused batch; three exact source replacements only. Visible job-opening text now matches each required accessible name (Open P-104 and analogous IDs). Decorative back arrow is aria-hidden, leaving Back to queue as the accessible name. Edit proof clears the persistent prior success announcement before rendering editable choices. Layout, fixture facts, supplied assets, frozen inputs and first-write.html are unchanged.
- Source-only checks passed: JavaScript parses; rendered HTML strings for all three job labels and back-arrow semantics match; a minimal Node DOM-stub flow records 25-copy success, edits to 26, clears the old live announcement, and computes 94 remaining Cotton White sheets. first-write.html still contains the original pre-correction labels and no new live-clearing code. SHA-256 of preserved first-write: 6e9cf4a743bc5758427c186fac87060273c74b4489799e8c6f59363c61c8da0f.
- Approximately 2 additional tool calls. Actual usage/billing unknown. No browser, axe, actual keyboard, screen-reader or rendered-width checks performed; parent owns those checks. The supplied-proof image needed no correction.
