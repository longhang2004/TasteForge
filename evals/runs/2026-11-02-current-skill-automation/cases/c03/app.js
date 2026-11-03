(() => {
  'use strict';
  const variants = { iron: { name: 'Iron', stock: 4 }, ash: { name: 'Ash', stock: 0 }, sand: { name: 'Sand', stock: 7 } };
  const price = 68;
  const shipping = 8;
  const form = document.querySelector('#purchase-form');
  const quantity = document.querySelector('#quantity');
  const status = document.querySelector('[data-testid="cart-status"]');
  const amount = value => value.toFixed(2);
  function selection() {
    const glaze = form.querySelector('input[name="glaze"]:checked').value;
    return { glaze, variant: variants[glaze], count: Number(quantity.value) };
  }
  function updateSummary() {
    const { variant, count } = selection();
    document.querySelector('#item-description').textContent = `${variant.name} × ${count}`;
    document.querySelector('#subtotal').textContent = `$${amount(price * count)}`;
    document.querySelector('#order-total').textContent = `USD ${amount(price * count + shipping)}`;
    status.textContent = '';
  }
  form.addEventListener('change', updateSummary);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const { variant, count } = selection();
    if (!variant.stock || !Number.isInteger(count) || count < 1 || count > 4 || count > variant.stock) {
      status.textContent = 'Please choose an available glaze and a quantity from 1–4.';
      return;
    }
    status.textContent = `Added to your simulated cart: ${variant.name} × ${count}. Order total: USD ${amount(price * count + shipping)}, including USD 8.00 shipping. No payment or real order has been placed.`;
  });
  updateSummary();
})();
