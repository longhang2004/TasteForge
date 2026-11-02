/**
 * Field Kiln — Everyday Teapot UI Logic
 * Source data from fixture.json
 */

(function () {
  'use strict';

  // Fictional fixture data source of truth
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
  const state = {
    selectedGlazeId: "iron", // Initially Iron
    quantity: 1,             // Initially 1
    maxQuantity: 4,
    minQuantity: 1
  };

  // DOM Elements
  const elements = {
    selectedGlazeLabel: document.getElementById('selected-glaze-label'),
    quantityInput: document.getElementById('quantity-input'),
    ledgerQtyCount: document.getElementById('ledger-qty-count'),
    ledgerSubtotal: document.getElementById('ledger-subtotal'),
    ledgerShipping: document.getElementById('ledger-shipping'),
    orderTotal: document.getElementById('order-total'),
    addToCartBtn: document.getElementById('add-to-cart-btn'),
    cartStatus: document.getElementById('cart-status'),
    glazeButtons: {
      iron: document.querySelector('[data-testid="glaze-iron"]'),
      ash: document.querySelector('[data-testid="glaze-ash"]'),
      sand: document.querySelector('[data-testid="glaze-sand"]')
    }
  };

  /**
   * Helper: Format number as USD currency string
   */
  function formatUSD(amount) {
    return `USD ${amount.toFixed(2)}`;
  }

  /**
   * Helper: Get variant info by id
   */
  function getVariant(id) {
    return FIXTURE_DATA.variants.find(v => v.id === id) || FIXTURE_DATA.variants[0];
  }

  /**
   * Calculate live order breakdown
   */
  function calculateTotal() {
    const qty = state.quantity;
    const subtotal = FIXTURE_DATA.priceUSD * qty;
    const shipping = FIXTURE_DATA.shippingUSD;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }

  /**
   * Update the UI to reflect current state
   */
  function render() {
    const currentVariant = getVariant(state.selectedGlazeId);
    const isOutOfStock = currentVariant.stock <= 0;

    // Update selected glaze label
    if (elements.selectedGlazeLabel) {
      elements.selectedGlazeLabel.textContent = `${currentVariant.name}${isOutOfStock ? ' (Unavailable)' : ''}`;
    }

    // Update variant buttons aria-checked and classes
    Object.keys(elements.glazeButtons).forEach(id => {
      const btn = elements.glazeButtons[id];
      if (!btn) return;

      const isSelected = id === state.selectedGlazeId;
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      if (isSelected) {
        btn.classList.add('glaze-btn--active');
      } else {
        btn.classList.remove('glaze-btn--active');
      }
    });

    // Update quantity breakdown and ledger
    const { subtotal, shipping, total } = calculateTotal();

    if (elements.ledgerQtyCount) {
      elements.ledgerQtyCount.textContent = state.quantity.toString();
    }
    if (elements.ledgerSubtotal) {
      elements.ledgerSubtotal.textContent = `$${subtotal.toFixed(2)} USD`;
    }
    if (elements.ledgerShipping) {
      elements.ledgerShipping.textContent = `$${shipping.toFixed(2)} USD`;
    }
    if (elements.orderTotal) {
      // Must visibly show shipping-inclusive total; e.g. "USD 144.00" at Sand × 2
      elements.orderTotal.textContent = formatUSD(total);
    }

    // Prevent purchasing out-of-stock variant (Ash)
    if (elements.addToCartBtn) {
      if (isOutOfStock) {
        elements.addToCartBtn.disabled = true;
        elements.addToCartBtn.setAttribute('aria-disabled', 'true');
        elements.addToCartBtn.textContent = 'Unavailable — Out of stock';
      } else {
        elements.addToCartBtn.disabled = false;
        elements.addToCartBtn.removeAttribute('aria-disabled');
        elements.addToCartBtn.textContent = 'Add to cart';
      }
    }
  }

  /**
   * Set selected glaze
   */
  function selectGlaze(variantId) {
    if (!FIXTURE_DATA.variants.some(v => v.id === variantId)) return;
    state.selectedGlazeId = variantId;
    render();
  }

  /**
   * Set and validate quantity
   */
  function setQuantity(val) {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < state.minQuantity) {
      parsed = state.minQuantity;
    } else if (parsed > state.maxQuantity) {
      parsed = state.maxQuantity;
    }
    state.quantity = parsed;
    if (elements.quantityInput && parseInt(elements.quantityInput.value, 10) !== parsed) {
      elements.quantityInput.value = parsed;
    }
    render();
  }

  /**
   * Handle simulated add-to-cart action
   */
  function handleAddToCart() {
    const currentVariant = getVariant(state.selectedGlazeId);

    // Hard safety check: Ash is unavailable, UI must prevent purchasing it
    if (currentVariant.stock <= 0) {
      if (elements.cartStatus) {
        elements.cartStatus.className = 'cart-status cart-status--visible cart-status--error';
        elements.cartStatus.textContent = `The ${currentVariant.name} glaze is out of stock and cannot be purchased.`;
      }
      return;
    }

    const { total } = calculateTotal();
    const formattedTotal = formatUSD(total);

    // Visible confirmation with selected glaze and quantity
    if (elements.cartStatus) {
      elements.cartStatus.className = 'cart-status cart-status--visible cart-status--success';
      elements.cartStatus.innerHTML = `
        <span class="cart-status-title">✓ Added to simulated cart</span>
        <span>Selected: <strong>${state.quantity} × ${FIXTURE_DATA.product}</strong> in <strong>${currentVariant.name}</strong> glaze.</span><br>
        <span>Order total (including shipping): <strong>${formattedTotal}</strong>.</span>
      `;
    }
  }

  /**
   * Event Listeners
   */
  function initEvents() {
    // Glaze button click listeners
    Object.keys(elements.glazeButtons).forEach(id => {
      const btn = elements.glazeButtons[id];
      if (!btn) return;
      btn.addEventListener('click', () => {
        selectGlaze(id);
      });
    });

    // Quantity input listeners (both input and change)
    if (elements.quantityInput) {
      elements.quantityInput.addEventListener('input', (e) => {
        setQuantity(e.target.value);
      });
      elements.quantityInput.addEventListener('change', (e) => {
        setQuantity(e.target.value);
      });
    }

    // Add to cart button listener
    if (elements.addToCartBtn) {
      elements.addToCartBtn.addEventListener('click', handleAddToCart);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    render();
  });

  // Run render immediately if DOM is already parsed
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initEvents();
    render();
  }

})();
