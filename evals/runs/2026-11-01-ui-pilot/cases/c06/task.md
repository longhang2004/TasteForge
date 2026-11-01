# Product request

Create a product page for a handmade ceramic teapot. Provide material, dimensions, care, price, stock, delivery, returns, image descriptions, and accessible variant selection. Express a considered craft identity with real product detail rather than a generic SaaS hero.

Primary task: Choose a glaze and determine total purchase conditions before adding to a simulated cart.

Constraints:
- No fake reviews or scarcity
- Visible practical details
- Works without hover

# Shared fixture and behavior contract

Use the fictional content in `fixture.json` as the source of truth. Do not invent testimonials, certifications, impact metrics, or real transaction capability.

Implement glaze selection, quantity selection, and an add-to-cart simulation. Initially select Iron and quantity 1. Ash is unavailable; the UI must prevent purchasing it. Selecting Sand, setting quantity 2, and adding to the cart must produce a visible confirmation with the selected glaze and quantity. Make price, shipping, delivery, returns, dimensions, material, and care discoverable before purchase. Use the supplied shared product illustrations and clearly identify the shop/data as fictional.

For neutral automated checks, add these invisible test hooks to the actual controls: `data-testid="glaze-iron"`, `glaze-ash`, and `glaze-sand` on their clickable/selectable glaze controls; `data-testid="quantity"` on an input/select that accepts quantity 1–4; `data-testid="add-to-cart"` on the actual action button; and `data-testid="cart-status"` on its visible feedback region. These hooks do not prescribe visual composition or control styling.

# Common implementation environment

Create a working, responsive interface in `index.html`, `styles.css`, and `app.js` using plain HTML/CSS/JavaScript. The identical starter has no established design system. No build step, third-party scripts, external fonts, remote assets, network APIs, or package installation. Use installed system-font fallbacks. All UI behavior must run locally from a static HTTP server. You may create additional local files inside your assigned case directory.

Work only in your assigned case. Read this task, fixture, starter, and shared assets; do not inspect other cases, evaluation metadata, repository documentation, or unrelated skills. Do not delegate. Routine terminal commands must use Ubuntu WSL2 Bash: `wsl.exe --distribution Ubuntu --cd <Linux-directory> --exec bash -lc <command>` when the tool is hosted on Windows. Do not use PowerShell for actual file operations.

Use one implementation pass and one self-review, aiming to finish within eight minutes. Both conditions receive this same budget; there is no enforced model-token or generation-seed API. Do not alter the fixture or testing contract. Save `implementation-notes.md` documenting your decisions, actual checks, known gaps, and any unavailable tools. Do not claim rendered inspection unless you performed it. Return a concise completion summary with file paths. A separate operator will capture screenshots and test the primary task after you finish.
