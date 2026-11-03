const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

export function mount(root, fixture, condition) {
  root.className = `commerce ${condition}`;
  const money = (value) => `${fixture.currency} ${value}`;
  const state = { variant: fixture.variants[0].name, quantity: '1', attempts: 0, stage: 'ready' };
  const title = `<div class="co-title"><p class="eyebrow">${escape(fixture.brand)} / object 01</p><h1>${escape(fixture.name)}</h1><p>${escape(fixture.description)}</p><p class="co-price">${money(fixture.price)} <span>per cup</span></p><p class="co-fiction">Fictional shop and stock. No payment or real order.</p></div>`;
  const media = `<figure class="co-media"><div class="co-image"><img src="${escape(fixture.asset)}" alt="Schematic outline of the handleless pouring cup with spout and a width annotation" width="640" height="480" /></div><figcaption>${escape(fixture.caption)}</figcaption></figure>`;
  const specs = `<dl class="co-specs"><div><dt>Capacity</dt><dd>${escape(fixture.capacity)}</dd></div><div><dt>Dimensions</dt><dd>${escape(fixture.dimensions)}</dd></div><div><dt>Material</dt><dd>${escape(fixture.material)}</dd></div></dl>`;
  const terms = `<section class="co-terms" aria-labelledby="co-terms-title"><h2 id="co-terms-title">Before you add</h2><div><h3>Care</h3><p>${escape(fixture.care)}</p></div><div><h3>Delivery</h3><p>${escape(fixture.delivery)}</p></div><div><h3>Returns</h3><p>${escape(fixture.returns)}</p></div></section>`;
  const form = `<section class="co-order" aria-labelledby="co-options-title"><h2 id="co-options-title">Choose your cup</h2><form id="co-form" novalidate><div class="co-fields"><label for="co-glaze">Glaze<select id="co-glaze" aria-describedby="co-stock">${fixture.variants.map((variant) => `<option value="${escape(variant.name)}">${escape(variant.name)} — ${variant.stock ? `${variant.stock} available` : 'unavailable'}</option>`).join('')}</select></label><label for="co-quantity">Quantity<input id="co-quantity" type="number" min="${fixture.quantityMin}" max="${fixture.quantityMax}" step="1" inputmode="numeric" value="1" required aria-describedby="co-stock co-feedback" /></label></div><p id="co-stock" class="muted" role="status"></p><dl class="co-cost"><div><dt>Item subtotal</dt><dd id="co-subtotal"></dd></div><div><dt>Shipping</dt><dd>${money(fixture.shipping)}</dd></div><div class="co-total"><dt>Total</dt><dd id="co-total"></dd></div></dl><div id="co-feedback" tabindex="-1"></div><button id="co-add" class="co-action primary">Add to simulated cart</button><button id="co-retry" class="co-action primary" type="button" hidden>Retry adding cup</button><p class="co-consequence">No payment is taken. This adds one simulated cart entry for this page session.</p></form></section>`;
  root.innerHTML =
    condition === 'adapted'
      ? `${title}<div class="co-sheet"><section class="co-object" aria-label="Object evidence">${media}${specs}</section><div class="co-purchase">${form}${terms}</div></div>`
      : `<div class="co-product">${media}<div>${title}${specs}${form}</div></div>${terms}`;
  const glaze = root.querySelector('#co-glaze');
  const quantity = root.querySelector('#co-quantity');
  const feedback = root.querySelector('#co-feedback');
  const add = root.querySelector('#co-add');
  const retry = root.querySelector('#co-retry');
  const selected = () => fixture.variants.find((variant) => variant.name === state.variant);
  const validQuantity = () =>
    state.quantity !== '' &&
    Number.isInteger(Number(state.quantity)) &&
    Number(state.quantity) >= fixture.quantityMin &&
    Number(state.quantity) <= fixture.quantityMax &&
    Number(state.quantity) <= selected().stock;
  function update() {
    const variant = selected();
    root.querySelector('#co-stock').textContent = variant.stock
      ? `${variant.name}: ${variant.stock} available. Whole quantity ${fixture.quantityMin}–${Math.min(fixture.quantityMax, variant.stock)}.`
      : `${variant.name} is unavailable. Choose another glaze to continue.`;
    root.querySelector('#co-subtotal').textContent = validQuantity()
      ? money(Number(state.quantity) * fixture.price)
      : '—';
    root.querySelector('#co-total').textContent = validQuantity()
      ? money(Number(state.quantity) * fixture.price + fixture.shipping)
      : '—';
    add.disabled = !variant.stock || state.stage === 'success';
    add.hidden = state.stage === 'failure';
    retry.hidden = state.stage !== 'failure';
  }
  function clearFeedback() {
    state.stage = 'ready';
    feedback.textContent = '';
    feedback.className = '';
    feedback.removeAttribute('role');
    quantity.removeAttribute('aria-invalid');
    update();
  }
  glaze.addEventListener('change', () => {
    state.variant = glaze.value;
    clearFeedback();
  });
  quantity.addEventListener('input', () => {
    state.quantity = quantity.value;
    clearFeedback();
  });
  function commit() {
    if (!selected().stock || !validQuantity()) {
      feedback.className = 'error';
      feedback.setAttribute('role', 'alert');
      feedback.textContent = selected().stock
        ? `Enter a whole quantity from ${fixture.quantityMin} to ${Math.min(fixture.quantityMax, selected().stock)} for ${state.variant}. Your glaze is retained.`
        : `${state.variant} is unavailable. Choose another glaze.`;
      quantity.setAttribute('aria-invalid', 'true');
      quantity.focus();
      return;
    }
    state.attempts += 1;
    state.stage = state.attempts === 1 ? 'failure' : 'success';
    feedback.className = state.stage === 'failure' ? 'error' : 'success';
    feedback.setAttribute('role', state.stage === 'failure' ? 'alert' : 'status');
    feedback.innerHTML =
      state.stage === 'failure'
        ? '<strong>Cup was not added.</strong><p>Your glaze and quantity are retained. Retry or change the choices above.</p>'
        : `<strong>Added ${escape(state.variant)} × ${escape(state.quantity)}.</strong><p>Total ${money(Number(state.quantity) * fixture.price + fixture.shipping)}, including ${money(fixture.shipping)} shipping. Simulated cart only; no real order or payment.</p>`;
    update();
    feedback.focus();
  }
  root.querySelector('#co-form').addEventListener('submit', (event) => {
    event.preventDefault();
    commit();
  });
  retry.addEventListener('click', commit);
  update();
}
