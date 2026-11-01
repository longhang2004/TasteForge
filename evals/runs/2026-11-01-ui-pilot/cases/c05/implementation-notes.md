# Implementation notes

Implemented a local responsive two-step money transfer simulation in index.html, styles.css and app.js.

Decisions:
- Warm neutral surfaces, green actions and a persistent cost summary support clarity.
- Full Vietnamese names wrap on review and render as text.
- Fee appears before confirmation and adds to the send amount; recipient receives amount × 25,000 VND.
- Validation and simulated failure retain input. First confirmation fails; retry succeeds.
- Fictional/demo disclosures appear throughout, including success.
- Native controls, labels, visible focus outlines, focus movement and a live status region support keyboard use.
- Single-column layout below 760px. No remote resources.

Actual checks:
- node --check app.js passed.
- Node VM with a lightweight DOM stub passed initial total and VND conversion, rejection of 0 and 1001, retained input, review rows, first failure, retry success, accepted 1 and 1000 bounds, and required test hooks.
- Source self-review covered layout, labels, feedback, text rendering and disclosures.

Limitations:
- No rendered browser inspection or native keyboard/screen-reader test performed. DOM-stub tests do not verify layout, native focus or announcements.
- No real money movement, account connection, network calls or delivery guarantee.
