(() => {
  const product = {
    price: 68,
    shipping: 8,
    variants: {
      iron: { name: 'Iron', stock: 4 },
      ash: { name: 'Ash', stock: 0 },
      sand: { name: 'Sand', stock: 7 }
    }
  };

  const glazeButtons = Array.from(document.querySelectorAll('[data-glaze]'));
  const quantity = document.querySelector('[data-testid="quantity"]');
  const summaryVariant = document.querySelector('#summary-variant');
  const summaryQuantity = document.querySelector('#summary-quantity');
  const itemsPrice = document.querySelector('#items-price');
  const total = document.querySelector('#order-total');
  const addButton = document.querySelector('[data-testid="add-to-cart"]');
  const status = document.querySelector('[data-testid="cart-status"]');
  let selectedGlaze = 'iron';

  const money = (amount) => `$${amount.toFixed(2)}`;

  function updateSummary() {
    const count = Number(quantity.value);
    const itemTotal = product.price * count;
    const orderTotal = itemTotal + product.shipping;
    summaryVariant.textContent = `· ${product.variants[selectedGlaze].name}`;
    summaryQuantity.textContent = String(count);
    itemsPrice.textContent = money(itemTotal);
    total.textContent = money(orderTotal);
  }

  glazeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const glaze = button.dataset.glaze;
      if (!product.variants[glaze] || product.variants[glaze].stock < 1) return;
      selectedGlaze = glaze;
      glazeButtons.forEach((option) => {
        const selected = option === button;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      status.textContent = '';
      updateSummary();
    });
  });

  quantity.addEventListener('change', () => {
    status.textContent = '';
    updateSummary();
  });

  addButton.addEventListener('click', () => {
    const count = Number(quantity.value);
    const variant = product.variants[selectedGlaze];
    if (!variant || variant.stock < count) {
      status.textContent = 'That quantity is not available for this glaze. Choose a smaller quantity.';
      return;
    }
    status.textContent = `Added ${count} ${count === 1 ? 'Everyday Teapot' : 'Everyday Teapots'} in ${variant.name} to your sample bag. Total ${money(product.price * count + product.shipping)} including illustrative shipping. No payment was taken.`;
  });

  updateSummary();
})();
