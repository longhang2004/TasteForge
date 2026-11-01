const results = document.querySelector('#stock-results');
const panel = document.querySelector('#decision-panel');
const search = document.querySelector('[data-testid="inventory-search"]');
const filter = document.querySelector('[data-testid="shortage-only"]');
const fixture = await (await fetch('fixture.json')).json();
const state = { item: null, stage: 'list', drafts: new Map(), attempts: 0, listScroll: 0 };
const html = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const focus = (selector, preventScroll = false) =>
  document.querySelector(selector)?.focus({ preventScroll });

function renderList() {
  const query = search.value.trim().toLocaleLowerCase();
  const items = fixture.items.filter(
    (item) =>
      (!filter.checked || item.shortage > 0) &&
      `${item.sku} ${item.name}`.toLocaleLowerCase().includes(query),
  );
  document.querySelector('#result-count').textContent =
    `${items.length} of ${fixture.items.length} items`;
  results.innerHTML = items.length
    ? `
    <table>
      <caption class="sr-only">Stock snapshot. Select an item name to inspect and record a decision.</caption>
      <thead><tr><th scope="col">Item / location</th><th scope="col" class="number">Available</th><th scope="col" class="number">Shortage</th></tr></thead>
      <tbody>${items
        .map(
          (
            item,
          ) => `<tr data-testid="inventory-row" data-sku="${html(item.sku)}" ${state.item?.sku === item.sku ? 'class="selected"' : ''}>
        <th scope="row"><button class="item-button" data-sku="${html(item.sku)}" data-testid="item-${html(item.sku)}" ${state.item?.sku === item.sku ? 'aria-current="true"' : ''}>${html(item.name)}<span class="item-meta">${html(item.sku)} <span aria-hidden="true">·</span> ${html(item.location)}</span></button></th>
        <td class="number">${item.available}<span class="unit">${html(item.unit)}</span></td>
        <td class="number ${item.shortage ? 'short' : ''}">${item.shortage}<span class="unit">${html(item.unit)}</span></td>
      </tr>`,
        )
        .join('')}</tbody>
    </table>`
    : `<div class="no-results"><h3>No matching items</h3><p>Try a SKU or another name${filter.checked ? ', or turn off Shortages only' : ''}.</p><button class="secondary" data-action="clear" data-testid="clear-search">Clear search</button></div>`;
}

function renderPanel() {
  const item = state.item;
  document.documentElement.dataset.stage = state.stage;
  panel.hidden = !item;
  if (!item) return;
  const quantity = state.drafts.get(item.sku);
  const editing = state.stage === 'detail';
  const failed = state.stage === 'failure';
  const saved = state.stage === 'success';
  const busy = state.stage === 'saving';
  panel.innerHTML = `
    <button class="back" data-action="back" data-testid="back-to-list">← Back to ${search.value.trim() || filter.checked ? 'filtered stock' : 'stock'}</button>
    <p class="eyebrow">${html(item.sku)} <span aria-hidden="true">/</span> Location ${html(item.location)}</p>
    <h2 id="item-heading" tabindex="-1">${html(item.name)}</h2>
    <dl class="stock-evidence" aria-label="Stock evidence">
      <div><dt>Available now</dt><dd>${item.available} ${html(item.unit)}</dd></div>
      <div><dt>Reorder point</dt><dd>${item.reorderPoint} ${html(item.unit)}</dd></div>
      <div class="shortage-line"><dt>Shortage</dt><dd>${item.shortage} ${html(item.unit)}</dd></div>
      <div><dt>Incoming</dt><dd>${item.incoming} ${html(item.unit)}</dd></div>
    </dl>
    <p class="evidence-note">Shortage = reorder point − available. Incoming is not counted as available in this snapshot.</p>
    ${
      editing
        ? `
      <form id="decision-form" novalidate>
        <label class="quantity-label" for="decision-quantity">Quantity to replenish <span>(${html(item.unit)})</span></label>
        <input id="decision-quantity" data-testid="decision-quantity" name="quantity" type="number" inputmode="numeric" min="1" max="50" step="1" value="${html(quantity)}" aria-describedby="quantity-help quantity-error" required />
        <p id="quantity-help" class="field-help">Enter a whole number from 1 to 50.</p>
        <p id="quantity-error" class="field-error" aria-live="polite"></p>
        <button class="primary" type="submit" data-testid="review-decision">Review decision <span aria-hidden="true">→</span></button>
      </form>`
        : `
      <div class="decision-summary">
        <p class="eyebrow">${saved ? 'Recorded quantity' : 'Review your decision'}</p>
        <p class="decision-amount">${html(quantity)} <span>${html(item.unit)}</span></p>
        <p class="consequence">This records a local decision only. No purchase order is placed.</p>
        ${failed ? '<div class="outcome error" role="alert" data-testid="decision-status"><strong>Decision was not recorded.</strong><p>Your quantity is retained. Try again or edit it.</p></div>' : ''}
        ${
          saved
            ? '<div class="outcome success" role="status" data-testid="decision-status"><strong>Decision recorded for this session.</strong><p>The warehouse snapshot is unchanged.</p></div>'
            : `
          <div class="actions">
            <button class="primary" data-action="save" data-testid="${failed ? 'retry-decision' : 'save-decision'}" ${busy ? 'disabled' : ''}>${busy ? 'Recording…' : failed ? 'Retry decision' : 'Record decision'}</button>
            <button class="secondary" data-action="edit" data-testid="edit-decision" ${busy ? 'disabled' : ''}>Edit quantity</button>
          </div>
          ${busy ? '<p role="status">Recording this simulated decision…</p>' : ''}`
        }
      </div>`
    }`;
}

function select(sku) {
  const item = fixture.items.find((entry) => entry.sku === sku);
  if (!item) return;
  state.listScroll = window.scrollY;
  state.item = item;
  state.stage = 'detail';
  if (!state.drafts.has(sku)) state.drafts.set(sku, String(item.shortage || 1));
  renderList();
  renderPanel();
  const continuous = document.documentElement.dataset.layout === 'continuous';
  if (continuous) panel.scrollIntoView({ block: 'start' });
  else if (window.matchMedia('(max-width: 760px)').matches) window.scrollTo(0, 0);
  focus('#item-heading');
}

search.addEventListener('input', renderList);
filter.addEventListener('change', renderList);
results.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button?.dataset.action === 'clear') {
    search.value = '';
    renderList();
    search.focus();
  } else if (button?.dataset.sku) select(button.dataset.sku);
});

panel.addEventListener('input', (event) => {
  if (event.target.name !== 'quantity') return;
  state.drafts.set(state.item.sku, event.target.value);
  event.target.removeAttribute('aria-invalid');
  document.querySelector('#quantity-error').textContent = '';
});

panel.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.querySelector('#decision-quantity');
  const quantity = Number(input.value);
  if (!input.value || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    input.setAttribute('aria-invalid', 'true');
    document.querySelector('#quantity-error').textContent = 'Enter a whole number from 1 to 50.';
    input.focus();
    return;
  }
  state.drafts.set(state.item.sku, String(quantity));
  state.stage = 'review';
  renderPanel();
  focus('#item-heading');
});

panel.addEventListener('click', async (event) => {
  const action = event.target.closest('button')?.dataset.action;
  if (action === 'back') {
    const sku = state.item.sku;
    state.item = null;
    state.stage = 'list';
    renderList();
    renderPanel();
    if (document.querySelector(`[data-testid="item-${sku}"]`)) focus(`[data-testid="item-${sku}"]`);
    else search.focus({ preventScroll: true });
    window.scrollTo(0, state.listScroll);
  } else if (action === 'edit') {
    state.stage = 'detail';
    renderPanel();
    focus('#decision-quantity');
  } else if (action === 'save' && ['review', 'failure'].includes(state.stage)) {
    const recordingItem = state.item;
    state.stage = 'saving';
    renderPanel();
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    if (state.item !== recordingItem || state.stage !== 'saving') return;
    state.attempts += 1;
    state.stage = state.attempts === 1 ? 'failure' : 'success';
    renderPanel();
    focus(state.stage === 'failure' ? '[data-testid="retry-decision"]' : '#item-heading');
  }
});

renderList();
renderPanel();
