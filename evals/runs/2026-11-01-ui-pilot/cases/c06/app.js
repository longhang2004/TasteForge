const price = 68;
const variants = {
  iron: { name: 'Iron', stock: 4 },
  ash: { name: 'Ash', stock: 0 },
  sand: { name: 'Sand', stock: 7 }
};
let selected = 'iron';
const controls = [...document.querySelectorAll('[data-glaze]')];
const quantity = document.querySelector('#quantity');
const total = document.querySelector('#item-total');
const status = document.querySelector('#cart-status');
function updateSelection(id) {
  if (!variants[id] || variants[id].stock < 1) return;
  selected = id;
  controls.forEach(button => {
    const active = button.dataset.glaze === id;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#selected-name').textContent = `— ${variants[id].name}`;
  document.querySelector('#stock-text').textContent = `${variants[id].name} · ${variants[id].stock} available`;
  status.textContent = '';
  updateTotal();
}
function updateTotal() {
  total.textContent = `$${price * Number(quantity.value)}`;
}
controls.forEach(button => button.addEventListener('click', () => updateSelection(button.dataset.glaze)));
quantity.addEventListener('change', updateTotal);
document.querySelector('#purchase').addEventListener('submit', event => {
  event.preventDefault();
  const count = Number(quantity.value);
  const item = variants[selected];
  if (!item || count < 1 || count > 4 || count > item.stock) {
    status.textContent = 'Please choose an available glaze and quantity.';
    return;
  }
  status.textContent = `Added to your bag: ${count} ${item.name} ${count === 1 ? 'teapot' : 'teapots'} · $${price * count} before $8 shipping.`;
});
updateTotal();
