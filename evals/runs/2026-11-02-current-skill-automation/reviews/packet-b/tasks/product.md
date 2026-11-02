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


Show the shipping-inclusive order total visibly before the add action and update it when quantity changes. At Sand × 2 the total is USD 144.00. Test hooks do not prescribe a layout.

