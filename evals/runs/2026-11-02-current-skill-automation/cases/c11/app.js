/**
 * TasteForge Everyday Teapot Interaction Logic
 * Product data sourced from fixture.json
 */

(function () {
  'use strict';

  const FIXTURE_DATA = {
    brand: "Field Kiln",
    product: "Everyday Teapot",
    fictional: true,
    priceUSD: 68,
    shippingUSD: 8,
    capacityMl: 650,
    dimensions: "16 cm wide × 12 cm high",
    material: "Glazed stoneware",
    variants: [
      { id: "iron", name: "Iron", stock: 4 },
      { id: "ash", name: "Ash", stock: 0 },
      { id: "sand", name: "Sand", stock: 7 }
    ],
    care: "Hand wash. Avoid sudden temperature changes. Not for stovetop use.",
    delivery: "Dispatch in 2 business days; illustrative domestic transit 3–5 business days.",
    returns: "Unused pieces accepted within 30 days. Customer pays return shipping; original shipping is nonrefundable.",
    imageDisclosure: "Original vector illustrations of a fictional sample product; these are not photographs.",
    sampleDataDisclosure: "Fictional shop and illustrative product, price, stock, delivery, and returns."
  };

  // State
  let currentGlazeId = 'iron';
  let currentQuantity = 1;

  // DOM Elements
  const glazeButtons = {
    iron: document.querySelector('[data-testid="glaze-iron"]'),
    ash: document.querySelector('[data-testid="glaze-ash"]'),
    sand: document.querySelector('[data-testid="glaze-sand"]')
  };

  const selectedGlazeLabel = document.getElementById('selected-glaze-label');
  const quantitySelect = document.querySelector('[data-testid="quantity"]');
  const lineItemDesc = document.getElementById('line-item-desc');
  const lineItemTotal = document.getElementById('line-item-total');
  const shippingAmount = document.getElementById('shipping-amount');
  const orderTotal = document.getElementById('order-total');
  const btnTotalText = document.getElementById('btn-total-text');
  const addToCartBtn = document.querySelector('[data-testid="add-to-cart"]');
  const cartStatus = document.querySelector('[data-testid="cart-status"]');

  function calculateTotals() {
    const unitPrice = FIXTURE_DATA.priceUSD;
    const shipping = FIXTURE_DATA.shippingUSD;
    const subtotal = currentQuantity * unitPrice;
    const total = subtotal + shipping;
    return { unitPrice, shipping, subtotal, total };
  }

  function updateDisplay() {
    const { unitPrice, shipping, subtotal, total } = calculateTotals();
    const activeVariant = FIXTURE_DATA.variants.find(v => v.id === currentGlazeId);

    // Update glaze label
    if (selectedGlazeLabel && activeVariant) {
      selectedGlazeLabel.textContent = activeVariant.name;
    }

    // Update summary breakdown
    if (lineItemDesc) {
      lineItemDesc.textContent = `Item price (${currentQuantity} × $${unitPrice.toFixed(2)}):`;
    }
    if (lineItemTotal) {
      lineItemTotal.textContent = `$${subtotal.toFixed(2)} USD`;
    }
    if (shippingAmount) {
      shippingAmount.textContent = `$${shipping.toFixed(2)} USD`;
    }

    // Update shipping-inclusive total display
    const formattedTotal = `USD ${total.toFixed(2)}`;
    if (orderTotal) {
      orderTotal.textContent = formattedTotal;
    }
    if (btnTotalText) {
      btnTotalText.textContent = formattedTotal;
    }

    // Check stock availability
    if (!activeVariant || activeVariant.stock <= 0) {
      if (addToCartBtn) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Unavailable — Out of Stock';
      }
    } else {
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = `Add to Cart &mdash; <span id="btn-total-text">${formattedTotal}</span>`;
      }
    }
  }

  function selectGlaze(variantId) {
    const variant = FIXTURE_DATA.variants.find(v => v.id === variantId);
    if (!variant || variant.stock <= 0) {
      // Prevent selecting or purchasing unavailable variants like Ash
      return;
    }

    currentGlazeId = variantId;

    // Update button states
    Object.entries(glazeButtons).forEach(([id, btn]) => {
      if (!btn) return;
      const isSelected = id === variantId;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    updateDisplay();
  }

  function handleQuantityChange() {
    if (!quantitySelect) return;
    let qty = parseInt(quantitySelect.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 4) qty = 4;
    currentQuantity = qty;
    updateDisplay();
  }

  function handleAddToCart() {
    const activeVariant = FIXTURE_DATA.variants.find(v => v.id === currentGlazeId);
    if (!activeVariant || activeVariant.stock <= 0) {
      if (cartStatus) {
        cartStatus.className = 'cart-status-region error';
        cartStatus.textContent = 'This variant is currently out of stock and cannot be added to cart.';
      }
      return;
    }

    const { total } = calculateTotals();
    const formattedTotal = `USD ${total.toFixed(2)}`;

    // Visible confirmation with selected glaze and quantity
    if (cartStatus) {
      cartStatus.className = 'cart-status-region active';
      cartStatus.innerHTML = `
        <div class="cart-status-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Added to cart successfully
        </div>
        <div>
          <strong>${currentQuantity} × ${FIXTURE_DATA.product}</strong> in <strong>${activeVariant.name}</strong> glaze.
          Order total: <strong>${formattedTotal}</strong> (includes $${FIXTURE_DATA.shippingUSD.toFixed(2)} domestic shipping).
        </div>
      `;
    }
  }

  // Bind event listeners
  Object.entries(glazeButtons).forEach(([id, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectGlaze(id);
    });
  });

  if (quantitySelect) {
    quantitySelect.addEventListener('change', handleQuantityChange);
    quantitySelect.addEventListener('input', handleQuantityChange);
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAddToCart();
    });
  }

  // Initial render
  selectGlaze('iron');
  updateDisplay();
})();
