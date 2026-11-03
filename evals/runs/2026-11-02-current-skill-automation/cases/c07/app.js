const product = {
  price: 68,
  shipping: 8,
  variants: {
    iron: { name: "Iron", stock: 4 },
    ash: { name: "Ash", stock: 0 },
    sand: { name: "Sand", stock: 7 }
  }
};

const glazeButtons = [...document.querySelectorAll("[data-glaze]")];
const quantityInput = document.querySelector("#quantity");
const total = document.querySelector("#total");
const status = document.querySelector("#cart-status");
const stockCopy = document.querySelector("#stock-copy");
const selectedName = document.querySelector("#selected-name");
let selectedGlaze = "iron";

function quantity() {
  const value = Number.parseInt(quantityInput.value, 10);
  const safeValue = Number.isFinite(value) ? Math.min(4, Math.max(1, value)) : 1;
  quantityInput.value = String(safeValue);
  quantityInput.max = "4";
  return safeValue;
}

function updateTotal() {
  total.textContent = `$${(product.price * quantity() + product.shipping).toFixed(2)}`;
}

function selectGlaze(id) {
  const variant = product.variants[id];
  if (!variant || variant.stock < 1) return;
  selectedGlaze = id;
  glazeButtons.forEach((button) => {
    const isSelected = button.dataset.glaze === id;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  selectedName.textContent = variant.name.toUpperCase();
  stockCopy.textContent = `${variant.stock} in stock · Ships in 2 business days`;
  status.textContent = "";
}

glazeButtons.forEach((button) => {
  button.addEventListener("click", () => selectGlaze(button.dataset.glaze));
});
quantityInput.addEventListener("input", updateTotal);
quantityInput.addEventListener("change", updateTotal);
document.querySelector("#qty-minus").addEventListener("click", () => {
  quantityInput.value = String(Math.max(1, quantity() - 1));
  updateTotal();
});
document.querySelector("#qty-plus").addEventListener("click", () => {
  quantityInput.value = String(Math.min(4, quantity() + 1));
  updateTotal();
});
document.querySelector("[data-testid='add-to-cart']").addEventListener("click", () => {
  const count = quantity();
  const variant = product.variants[selectedGlaze];
  if (count > variant.stock) {
    status.textContent = `Only ${variant.stock} ${variant.name} piece${variant.stock === 1 ? "" : "s"} available. Adjust the quantity to continue.`;
    quantityInput.focus();
    return;
  }
  status.textContent = `${count} ${variant.name} ${count === 1 ? "teapot" : "teapots"} added to your sample bag. Total: $${(product.price * count + product.shipping).toFixed(2)} USD, including $${product.shipping.toFixed(2)} shipping. This is a simulated cart.`;
});

updateTotal();
