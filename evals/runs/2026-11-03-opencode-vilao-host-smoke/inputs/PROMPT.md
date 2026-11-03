Build a small runnable product decision UI for the fictional Kiln Notes pouring cup. Use the installed TasteForge skill by calling its native skill tool, then the relevant creation workflow and only references needed for this task. Use Standard effort and one creator. No long plan or alternative prototypes are required.

Read fixture.json and assets/pouring-cup.svg. They are the entire product-fact/asset contract. Do not invent testimonials, guarantees, benefits, delivery dates, trust badges, certifications or product properties. The SVG is an original schematic, not a photograph. Product identity should come from the product content, schematic, meaningful comparison relationships and one or two concrete art-direction decisions. Keep familiar selection/cart interactions.

Create index.html (inline CSS/JS is fine) and creator-notes.md inside this project only. No remote requests, fonts, packages, external assets, real purchases or payments. Use semantic controls, system fonts, visible keyboard focus and reduced-motion support. No hero navigation or unrelated page sections are needed.

The runnable slice must:
- Show the provided product facts, care/return terms and accurate image caption.
- Offer Sand and Iron; Ash is visibly sold out and cannot be selected. Start at Sand quantity 1.
- Accept whole quantities 1–4 and no more than selected stock. Empty, zero, negative, fractional and excessive input must show actionable validation and cannot succeed. When switching from a higher quantity to a glaze with lower stock, clamp quantity to that stock and announce the change.
- Keep item subtotal, flat shipping and total visible beside the decision action. Total = USD 42 × quantity + USD 6. No fees or delivery promises beyond the fixture.
- Label the action as a simulated cart. The first valid attempt must fail recoverably; retry then succeeds. Preserve glaze and quantity on failure. Success identifies glaze, quantity and total. Editing choices clears stale success feedback. Clearly state there is no real order/payment.
- Work at 320px and 390px minimum widths and 1440px wide, allowing natural vertical scrolling. Keep errors, totals and controls reachable without horizontal scrolling. Keyboard operation must reach all actionable controls with visible focus. Validation/failure/success must be programmatically announced.

Use read/skill/edit/write tools only. Shell, network, subagents and browser tools are unavailable in this creator lane; do not request them. Parent will run real browser acceptance, natural scroll/focus captures and automated accessibility checks after generation. Do not claim tests or rendering you did not perform. Do not inspect outside this project, change host settings, commit or push.

In creator-notes.md briefly record chosen structure, 1–2 product-specific art-direction decisions, source/asset rights, tradeoffs and unassessed checks. Finish with the created files. If a tool/provider prevents completion, report that limitation and stop; do not switch models.
