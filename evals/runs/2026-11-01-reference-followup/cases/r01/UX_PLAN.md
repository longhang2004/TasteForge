# Transfer task plan — 1 November 2026

Primary task: an occasional customer checks the recipient and complete cost, then confirms a fictional transfer. Entry starts with the supplied Vietnamese name and USD 250. Flat fee is additional; errors must preserve all input.

## Evidence and provenance
- Inspected https://github.com/VoltAgent/awesome-design-md using the web tool: collection index, including its Wise entry describing a bright green, clear visual vocabulary. This is community analysis, not a transactional product specification. Current index revision was not exposed by the tool. No upstream code/assets copied; index identifies MIT.
- Attempted the exact bundled discovery revision https://github.com/VoltAgent/awesome-design-md/blob/fcc70284932276d085f01ef9f83edde90b1258cb/design-md/wise/DESIGN.md and its raw URL; both returned cache miss. The actual Wise document was NOT inspected. No token values or behavior inferred from it.
- Inspected official https://design-system.service.gov.uk/patterns/check-answers/ documentation and inline HTML. Observed: grouped summary before consequential submission; contextual change actions; previous answers prepopulated. Adapt those relationships, not government branding. Source is unversioned live documentation, accessed 2026-11-01. OGL v3 footer; no code copied.
- Inspected official https://design-system.service.gov.uk/patterns/confirmation-pages/ documentation and example HTML. Observed: explicit completion and what happens next. Adapt to a simulation outcome with no invented reference, email, support service or real delivery promise. OGL v3 footer; no code copied.
- No rendered external app, real transfer flow or user testing inspected. Suitability below is design inference.

## Structural alternatives (before styling)
1. Single vertical form then dedicated review receipt. First action edits recipient/amount; quote directly follows inputs. Review replaces inputs with grouped facts and explicit confirmation. Edit returns retained inputs. Mobile follows identical order. Best for occasional users and careful second inspection; costs one explicit step.
2. Side-by-side editable form and persistent quote, with inline confirmation. All costs visible while editing; mobile stacks form then quote. Efficient for frequent comparisons but wider attention split and weaker separation between editing and confirming.
3. Recipient step, amount step, then review. Narrow linear progression and focused fields; retained back navigation. Useful with complex recipient bank details, but unnecessary steps for two supplied inputs.

Select 1: coherent reading sequence and clear intent boundary. Neutral wireframe: brand + simulation notice / step indicator / title / recipient input / amount input / fee-and-total quote / review button. Review: title / recipient + source / costs / received amount + estimate / edit + confirm. No marketing hero or unrelated navigation.

## States and checks
Entry → validation (blank name or amount outside 1–1000) → review → pending → recoverable failure → retry pending → success. Keep DOM inputs alive when hidden. Errors explain correction and focus the relevant control. First confirmation always fails; retry succeeds. Edit after failure preserves values and attempt history. No network activity in app; fixture copied as local constants.

On narrow screens: full-width natural document flow, labels before values, wrapping Vietnamese name, no fixed action covering content. Keyboard: native form/buttons, visible focus, state headings focusable, feedback live region. Check default arithmetic 250 + 2.50 = 252.50 USD and 6,250,000 VND; bounds; blank name; edit retention; first failure; retry; hooks; local-only resources.

## Visual treatment and CLI limitation
Ran CLI 0.1.0 init dry-run/init and suggest --count 3 --seed 42. Retained suggestions.json: zero compatible directions because the combined Vietnamese language and system-font requirements have no compatible font pair. Kept both requirements; did not generate fabricated DNA. Manual fallback uses Arial/Segoe UI/sans-serif; Vietnamese rendering is unverified in a real browser. Selected a restrained light canvas, deep green ink/action, and pale green received-amount grouping. The discovery index's clear, friendly description loosely supports the vocabulary; exact tokens are original, not imported Wise values. Avoid bright green brand imitation and marketing layout. Typography: 30px task heading, 14–16px controls/body, tabular numeric totals; 24px grouping rhythm and visible borders/focus. State structure remains independent of this manual visual choice.
