# Harbor Cold Chain — consignment release

Build a runnable, polished English web task slice for **Harbor Cold Chain**, a fictional cold-storage co-operative. An operator must inspect one consignment's temperature evidence, decide whether to release or hold it, record a short note, submit the decision, and recover from a failed simulated submission.

Use the supplied facts exactly. Do not add certifications, guarantees, shelf-life claims, regulator approval, customer names, testimonials or real availability. No real food-safety determination is made by this demo.

## Supplied facts

Four declared consignments. Temperature limits are declared fixtures, not regulation.

| ID | Product | Catch date | Declared limit | Readings (°C, chronological) | Destination dock |
|---|---|---|---|---|---|
| HC-114 | Line-caught mackerel | 2 Nov 2026 | at or below −1.0 °C | −2.1, −1.8, −0.4, −1.6 | Dock B |
| HC-118 | Blue mussels | 3 Nov 2026 | at or below 2.0 °C | 1.2, 1.6, 1.9, 1.4 | Dock A |
| HC-121 | Sea bream | 1 Nov 2026 | at or below 0.0 °C | 0.3, 0.2, −0.2, 0.1 | Dock C |
| HC-126 | Squid | 4 Nov 2026 | at or below −0.5 °C | −1.4, −1.1, −1.2, −1.3 | Dock A |

Weights: HC-114 42.5 kg, HC-118 18.0 kg, HC-121 61.2 kg, HC-126 27.4 kg.

A reading above the declared limit is an **excursion**. A consignment with any excursion must be held, not released.

## Behavior

- Select a consignment by ID or product; show its readings, declared limit and resulting excursion state.
- Operator picks Release or Hold. Release is blocked while any reading is above the limit; the blocked state must explain which reading and why.
- A required short note (10–120 characters) accompanies the decision.
- Review shows consignment, decision, weight, destination dock, excursion summary and the note.
- Edit retains the selection, decision and note.
- The first valid submit fails with a useful recovery; retry succeeds with the same facts.
- Success states the recorded decision and says no real shipment, release or food-safety determination occurred.
- Changing consignment must not silently carry the previous decision or note.
- Keep ordinary form controls, semantic labels and clear focus.

## Visual material

No external media, fonts, dependencies, install or network. Use system fonts. You may author one original small schematic with HTML/CSS/inline SVG if it genuinely clarifies the supplied temperature evidence; label schematic media honestly. Do not copy another brand.

## Deliverable

Deliver `index.html` with inline CSS/JS in the assigned output directory. Support provisional widths 320, 390 and 1440px. Check reading/action access, long error text, semantic controls, contrast and keyboard/focus where available. Build only this task slice. Use the provided skill and only references relevant to unresolved decisions. Do not read teaching-example implementations or other cells. A static source inspection is not a browser test.
