# Implementation notes

## Decisions
- Chose an entry step followed by an explicit review so recipient, fee, total debit, VND amount, and estimate appear together before confirmation.
- Used native inputs and buttons, associated labels and field hints, visible keyboard focus, and status announcements. The Vietnamese full name stays unshortened and can wrap in summary/review regions.
- Used a system sans-serif stack, warm neutral background, navy text/action, visible borders, and a warm focus accent. No external assets, fonts, APIs, or dependencies.
- Data comes from fixture values copied into local JavaScript. The UI identifies all activity as simulated and explicitly says no money moves.

## References and tools
- Read assigned `task.md`, `fixture.json`, starter files, TasteForge `SKILL.md`, `create-ui.md`, `research-and-plan.md`, `layout-archetypes.md`, `accessibility.md`, and `catalog-use.md` only.
- TasteForge CLI 0.1.0. Initialized case-local config and set bilingual/system-font constraints in `.tasteforge/brief.json`. Seeded `suggest --count 3 --seed 42` returned zero compatible directions due to font/language constraints; they were not relaxed. Actual output is retained in `cli-suggest-output.json`.
- Offline `catalog --kind template --task form --limit 3` returned source-only contact/login structures, which do not establish transfer behavior; output retained in `cli-catalog-output.json`.
- Offline seeded `inspire --task form --count 3 --seed 42` returned fixed review gates and contextual references. Inspected `promax-app-interface-12`, “Preserve Screen State,” which informed input retention on edit/retry. The exact source record is retained in `cli-reference-output.json`; full inspiration output is in `cli-inspire-output.json`. These are heuristics, not usability findings.
- No external research was performed, as prohibited by the case.

## Checks performed
- `node --check app.js` passed.
- Rendered once with the assigned preview helper at both supplied widths. Inspected desktop and mobile PNGs in `evidence/self-review/`.
- Entry render visibly includes the supplied Vietnamese recipient, USD 250, $2.50 fee, $252.50 total debit, 6,250,000 ₫, and illustrative delivery estimate. Mobile stacks entry before estimate and the long name remains legible.
- Source flow includes amount bounds validation, retained values on edit and failure, first-confirmation failure, retry success, and explicit fictional/no-money-moved feedback.

## Limitations
- Did not exercise controls interactively with a keyboard or screen reader; native controls/status semantics are implemented but remain unverified.
- Preview captured the initial entry state; review, validation, failure, and success were not separately rendered. No automated operator checks have been run.
- System font glyph coverage varies by OS. The Vietnamese diacritics rendered in this environment; other target platforms were not checked.
