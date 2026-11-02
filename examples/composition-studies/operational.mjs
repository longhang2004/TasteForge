const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

export function mount(root, fixture, condition) {
  root.className = `operational ${condition}`;
  const state = { selected: null, stage: 'list', drafts: new Map(), attempts: 0, returnScroll: 0 };
  root.innerHTML = `
    <header class="op-header"><div><p class="eyebrow">${escape(fixture.brand)} / ${escape(fixture.warehouse)}</p><h1>Stock decisions</h1><p>Compare the snapshot. Record one replenishment decision.</p></div><p class="op-snapshot">${escape(fixture.snapshot)}</p></header>
    <div class="op-workspace">
      <section class="op-overview" aria-labelledby="op-overview-title">
        <h2 id="op-overview-title">Stock ledger</h2>
        <div class="op-toolbar"><label for="op-search">Search item or SKU<input id="op-search" type="search" autocomplete="off" placeholder="Name or SKU" /></label><label class="op-filter" for="op-shortage"><input type="checkbox" id="op-shortage" /> Shortages only</label></div>
        <p id="op-count" class="muted" role="status"></p><div id="op-results"></div>
      </section>
      <section id="op-panel" class="op-panel" aria-labelledby="op-heading" hidden></section>
    </div>`;
  const search = root.querySelector('#op-search');
  const shortage = root.querySelector('#op-shortage');
  const results = root.querySelector('#op-results');
  const panel = root.querySelector('#op-panel');
  const focus = (selector) => root.querySelector(selector)?.focus();

  function renderList() {
    const query = search.value.trim().toLocaleLowerCase();
    const items = fixture.items.filter(
      (item) =>
        `${item.sku} ${item.name}`.toLocaleLowerCase().includes(query) &&
        (!shortage.checked || item.shortage > 0),
    );
    root.querySelector('#op-count').textContent =
      `${items.length} of ${fixture.items.length} records`;
    results.innerHTML = items.length
      ? `<table class="op-table"><caption>Available and shortage quantities in the same units. Select an item to decide.</caption><thead><tr><th scope="col">Item / location</th><th scope="col">Available</th><th scope="col">Shortage</th></tr></thead><tbody>${items.map((item) => `<tr class="${state.selected?.sku === item.sku ? 'is-selected' : ''}"><th scope="row"><button class="op-item" data-sku="${escape(item.sku)}" ${state.selected?.sku === item.sku ? 'aria-current="true"' : ''}>${escape(item.name)}<span>${escape(item.sku)} · ${escape(item.location)}</span></button></th><td>${item.available}<small>${escape(item.unit)}</small></td><td class="${item.shortage ? 'op-short' : ''}">${item.shortage}<small>${escape(item.unit)}</small></td></tr>`).join('')}</tbody></table>`
      : '<div class="op-empty"><h3>No matching stock</h3><p>Try another name or clear the search and shortage filter.</p><button id="op-reset">Reset filters</button></div>';
  }
  function renderPanel() {
    panel.hidden = !state.selected;
    root.classList.toggle('op-selected', !!state.selected);
    if (!state.selected) {
      panel.innerHTML = '';
      return;
    }
    const item = state.selected;
    const qty = state.drafts.get(item.sku);
    const editing = state.stage === 'detail';
    panel.innerHTML = `<button id="op-back">← Back to ${search.value || shortage.checked ? 'filtered stock' : 'stock ledger'}</button><p class="eyebrow">${escape(item.sku)} / ${escape(item.location)}</p><h2 id="op-heading" tabindex="-1">${escape(item.name)}</h2>
      <dl class="op-evidence"><div><dt>Available now</dt><dd>${item.available} ${escape(item.unit)}</dd></div><div><dt>Reorder point</dt><dd>${item.reorderPoint} ${escape(item.unit)}</dd></div><div class="op-shortage-line"><dt>Shortage</dt><dd>${item.shortage} ${escape(item.unit)}</dd></div><div><dt>Incoming</dt><dd>${item.incoming} ${escape(item.unit)}</dd></div></dl>
      <p class="op-policy">Shortage is reorder point minus available, with a minimum of zero. Incoming is not counted as available.</p>
      ${editing ? `<form id="op-form" novalidate><label for="op-quantity">Quantity to replenish (${escape(item.unit)})</label><input id="op-quantity" name="quantity" type="number" min="${fixture.quantityMin}" max="${fixture.quantityMax}" step="1" inputmode="numeric" value="${escape(qty)}" aria-describedby="op-help op-error" required /><p id="op-help" class="muted">Whole number, ${fixture.quantityMin}–${fixture.quantityMax}.</p><p id="op-error" role="alert"></p><button class="primary" id="op-review">Review decision →</button></form>` : `<section class="op-commit" aria-label="Decision summary"><p class="eyebrow">${state.stage === 'success' ? 'Recorded locally' : 'Review decision'}</p><p class="op-amount">${escape(qty)} <span>${escape(item.unit)}</span></p><p>This records a local decision only. No purchase order is placed and the stock snapshot stays unchanged.</p>${state.stage === 'failure' ? '<div class="error" role="alert" id="op-error" tabindex="-1"><strong>Decision was not recorded.</strong><p>Your quantity is retained. Retry or edit the decision.</p></div>' : ''}${state.stage === 'success' ? `<div class="success" role="status" id="op-success" tabindex="-1">Recorded ${escape(qty)} ${escape(item.unit)} for ${escape(item.sku)} in this session. No real warehouse update.</div>` : `<div class="actions"><button class="primary" id="${state.stage === 'failure' ? 'op-retry' : 'op-save'}">${state.stage === 'failure' ? 'Retry decision' : 'Record decision'}</button><button id="op-edit">Edit quantity</button></div>`}</section>`}`;
  }
  search.addEventListener('input', renderList);
  shortage.addEventListener('change', renderList);
  results.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button?.id === 'op-reset') {
      search.value = '';
      shortage.checked = false;
      renderList();
      search.focus();
      return;
    }
    if (!button?.dataset.sku) return;
    state.returnScroll = window.scrollY;
    state.selected = fixture.items.find((item) => item.sku === button.dataset.sku);
    if (!state.drafts.has(state.selected.sku))
      state.drafts.set(state.selected.sku, String(state.selected.shortage || 1));
    state.stage = 'detail';
    renderList();
    renderPanel();
    focus('#op-heading');
  });
  panel.addEventListener('input', (event) => {
    if (event.target.id !== 'op-quantity') return;
    state.drafts.set(state.selected.sku, event.target.value);
    event.target.removeAttribute('aria-invalid');
    root.querySelector('#op-error').textContent = '';
  });
  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = root.querySelector('#op-quantity');
    const quantity = Number(input.value);
    if (
      !input.value ||
      !Number.isInteger(quantity) ||
      quantity < fixture.quantityMin ||
      quantity > fixture.quantityMax
    ) {
      input.setAttribute('aria-invalid', 'true');
      root.querySelector('#op-error').className = 'error';
      root.querySelector('#op-error').textContent =
        `Enter a whole number from ${fixture.quantityMin} to ${fixture.quantityMax}. Your draft is retained.`;
      input.focus();
      return;
    }
    state.drafts.set(state.selected.sku, String(quantity));
    state.stage = 'review';
    renderPanel();
    focus('#op-heading');
  });
  panel.addEventListener('click', (event) => {
    const id = event.target.closest('button')?.id;
    if (id === 'op-back') {
      const sku = state.selected.sku;
      state.selected = null;
      state.stage = 'list';
      renderList();
      renderPanel();
      window.scrollTo(0, state.returnScroll);
      const trigger = results.querySelector(`[data-sku="${sku}"]`);
      (trigger || search).focus();
    } else if (id === 'op-edit') {
      state.stage = 'detail';
      renderPanel();
      focus('#op-quantity');
    } else if (id === 'op-save' || id === 'op-retry') {
      state.attempts += 1;
      state.stage = state.attempts === 1 ? 'failure' : 'success';
      renderPanel();
      focus(state.stage === 'failure' ? '#op-error' : '#op-success');
    }
  });
  renderList();
}
