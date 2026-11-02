"use strict";
const product = { price: 68, shipping: 8, variants: { iron: {name: "Iron", stock: 4}, ash: {name: "Ash", stock: 0}, sand: {name: "Sand", stock: 7} } };
const form = document.getElementById("order-form");
const quantity = document.getElementById("quantity");
const status = document.querySelector("[data-testid=cart-status]");
const money = value => `USD ${value.toFixed(2)}`;
function selection() {
  const id = form.elements.glaze.value;
  return { id, variant: product.variants[id], quantity: Number(quantity.value) };
}
function updateOrder() {
  const order = selection();
  document.getElementById("subtotal-label").textContent = `${order.quantity} × ${order.variant.name}`;
  document.getElementById("subtotal").textContent = money(order.quantity * product.price);
  document.getElementById("total").textContent = money(order.quantity * product.price + product.shipping);
  status.classList.remove("success");
  status.textContent = `${order.variant.name} glaze selected · ${order.variant.stock} in stock. Review the total before adding.`;
}
form.addEventListener("change", updateOrder);
form.addEventListener("submit", event => {
  event.preventDefault();
  const order = selection();
  if (!order.variant || order.variant.stock === 0 || !Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > 4 || order.quantity > order.variant.stock) {
    status.classList.remove("success");
    status.textContent = "Choose an available glaze and a quantity from 1–4.";
    return;
  }
  status.classList.add("success");
  status.textContent = `Added to simulated cart: ${order.quantity} × Everyday Teapot, ${order.variant.name} glaze. Order total ${money(order.quantity * product.price + product.shipping)}, shipping included. No payment taken.`;
});
