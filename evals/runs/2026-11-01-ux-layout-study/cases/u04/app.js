const product = {
  brand: 'Field Kiln', name: 'Everyday Teapot', price: 68, shipping: 8,
  capacity: '650 ml', dimensions: '16 cm wide × 12 cm high',
  material: 'Glazed stoneware',
  care: 'Hand wash. Avoid sudden temperature changes. Not for stovetop use.',
  delivery: 'Dispatch in 2 business days; illustrative domestic transit 3–5 business days.',
  returns: 'Unused pieces accepted within 30 days. Customer pays return shipping; original shipping is nonrefundable.',
  variants: [{ id: 'iron', name: 'Iron', stock: 4, color: '#536057' }, { id: 'ash', name: 'Ash', stock: 0, color: '#c9c4b8' }, { id: 'sand', name: 'Sand', stock: 7, color: '#c4a778' }]
};
const money = value => `$${value.toFixed(2)}`;

document.querySelector('#app').innerHTML = `
  <header class="masthead">
    <a class="wordmark" href="#top" aria-label="Field Kiln home">FIELD <span>KILN</span></a>
    <p class="mast-note">A small fictional pottery shop <span lang="vi">· Gốm thủ công</span></p>
    <a class="bag-link" href="#purchase">Your selection <span aria-hidden="true">↗</span></a>
  </header>
  <div class="page" id="top">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#top">Objects</a><span aria-hidden="true">/</span><span aria-current="page">Everyday Teapot</span></nav>
    <section class="product-layout" aria-labelledby="product-title">
      <div class="visual-column">
        <figure class="product-figure">
          <img src="assets/teapot.svg" alt="Original vector illustration of a round, deep green glazed stoneware teapot with a curved handle and short spout, on a warm neutral background.">
          <figcaption><span>01 / Form study</span><span>650 ml · Stoneware</span></figcaption>
        </figure>
        <p class="image-note">Original vector illustration of a fictional sample product; not a photograph.</p>
      </div>
      <div class="buy-column">
        <p class="eyebrow">FIELD KILN <span>—</span> EVERYDAY OBJECTS</p>
        <h1 id="product-title">Everyday<br>Teapot</h1>
        <p class="dek">A familiar shape for the everyday pour.</p>
        <div class="price-line"><strong>${money(product.price)}</strong><span>USD · one piece</span></div>
        <p class="availability"><span class="availability-dot" aria-hidden="true"></span><span id="stock-copy">4 available in Iron</span></p>
        <p class="fiction-note">Fictional shop and illustrative product, price, stock, delivery, and returns.</p>

        <form id="purchase" class="purchase-form">
          <fieldset class="glaze-fieldset">
            <legend>Choose a glaze <span id="selected-glaze">Iron</span></legend>
            <div class="glaze-options">
              ${product.variants.map(v => `<button type="button" class="glaze-option ${v.id === 'iron' ? 'is-selected' : ''}" data-testid="glaze-${v.id}" data-variant="${v.id}" ${v.stock === 0 ? 'disabled aria-disabled="true"' : ''} aria-pressed="${v.id === 'iron'}" aria-label="${v.name}${v.stock === 0 ? ', unavailable' : ''}"><span class="swatch" style="--swatch:${v.color}"></span><span class="glaze-name">${v.name}</span>${v.stock === 0 ? '<span class="unavailable">Unavailable</span>' : ''}</button>`).join('')}
            </div>
          </fieldset>
          <div class="quantity-row"><label for="quantity">Quantity</label><select id="quantity" data-testid="quantity">${[1,2,3,4].map(n => `<option value="${n}">${n}</option>`).join('')}</select><span class="quantity-hint">Up to 4 per order</span></div>
          <div class="order-total"><div><span>Order total</span><small>Includes ${money(product.shipping)} illustrative shipping</small></div><strong id="total">${money(product.price + product.shipping)}</strong></div>
          <button class="add-button" type="submit" data-testid="add-to-cart">Add to your selection <span aria-hidden="true">↗</span></button>
          <p class="simulation-note">Simulated cart · no purchase or payment is made.</p>
          <p class="cart-status" data-testid="cart-status" role="status" aria-live="polite" hidden></p>
        </form>
        <div class="delivery-summary"><span class="small-mark" aria-hidden="true">✳</span><p><strong>Dispatch in 2 business days</strong><br>Illustrative domestic transit: 3–5 business days.</p></div>
      </div>
    </section>

    <section class="details" aria-labelledby="details-heading">
      <div class="details-intro"><p class="eyebrow">THE USEFUL DETAILS</p><h2 id="details-heading">Made to be<br>reached for.</h2><p>Clear facts for choosing a piece that fits your table and routine.</p></div>
      <dl class="spec-list">
        <div><dt>Material</dt><dd>${product.material}</dd></div>
        <div><dt>Capacity</dt><dd>${product.capacity}</dd></div>
        <div><dt>Dimensions</dt><dd>${product.dimensions}</dd></div>
        <div><dt>Care</dt><dd>${product.care}</dd></div>
      </dl>
      <div class="policy-list">
        <article><h3>Delivery</h3><p>${product.delivery}</p></article>
        <article><h3>Returns</h3><p>${product.returns}</p></article>
      </div>
    </section>
    <footer><a class="wordmark" href="#top">FIELD <span>KILN</span></a><p>Sample product page · all shop information is fictional.</p><a href="#purchase">Choose a glaze ↑</a></footer>
  </div>`;

let selected = product.variants[0];
const quantity = document.querySelector('#quantity');
const total = document.querySelector('#total');
const stockCopy = document.querySelector('#stock-copy');
const status = document.querySelector('[data-testid="cart-status"]');
function updateSummary() {
  const qty = Number(quantity.value);
  total.textContent = money(product.price * qty + product.shipping);
  stockCopy.textContent = `${selected.stock} available in ${selected.name}`;
}
document.querySelectorAll('[data-variant]').forEach(button => button.addEventListener('click', () => {
  selected = product.variants.find(v => v.id === button.dataset.variant);
  document.querySelectorAll('[data-variant]').forEach(item => {
    item.classList.toggle('is-selected', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  document.querySelector('#selected-glaze').textContent = selected.name;
  status.hidden = true;
  updateSummary();
}));
quantity.addEventListener('change', () => { status.hidden = true; updateSummary(); });
document.querySelector('#purchase').addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = `${quantity.value} ${selected.name} ${Number(quantity.value) === 1 ? 'teapot' : 'teapots'} added to your selection. Order total: ${total.textContent}. This is a simulation.`;
  status.hidden = false;
});
