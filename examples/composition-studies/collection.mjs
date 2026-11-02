const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

export function mount(root, fixture, condition) {
  let query = '';
  let type = 'All';
  let selected = null;
  root.className = `collection ${condition}`;
  root.innerHTML = `<header class="cl-header"><p class="eyebrow">${escape(fixture.brand)} / fictional archive</p><h1>${escape(fixture.title)}</h1><p>${escape(fixture.description)}</p></header>
    <div id="cl-overview"><form class="cl-filters" role="search"><div><label for="cl-search">Search title or material</label><input id="cl-search" type="search" autocomplete="off" placeholder="e.g. ink or clay" /></div><div><label for="cl-type">Type</label><select id="cl-type"><option>All</option>${fixture.types.map((entry) => `<option>${escape(entry)}</option>`).join('')}</select></div><button id="cl-reset" type="button">Reset filters</button></form><p class="cl-count" id="cl-count" role="status"></p><div id="cl-results"></div></div>
    <section id="cl-detail" hidden aria-labelledby="cl-detail-title"></section>`;
  const overview = root.querySelector('#cl-overview');
  const detail = root.querySelector('#cl-detail');
  const results = root.querySelector('#cl-results');
  const search = root.querySelector('#cl-search');
  const select = root.querySelector('#cl-type');
  const renderResults = () => {
    const matched = fixture.items.filter(
      (item) =>
        (type === 'All' || item.type === type) &&
        `${item.name} ${item.material}`.toLowerCase().includes(query.toLowerCase().trim()),
    );
    root.querySelector('#cl-count').textContent =
      `${matched.length} ${matched.length === 1 ? 'record' : 'records'}${type !== 'All' ? ` · ${type}` : ''}${query.trim() ? ` · “${query.trim()}”` : ''}`;
    results.innerHTML = matched.length
      ? `<ul class="cl-records">${matched.map((item) => `<li class="cl-record ${item.type.toLowerCase()}"><figure><img src="${escape(item.asset)}" alt="Original schematic of ${escape(item.name)}" width="360" height="280" /></figure><div class="cl-record-label"><p class="eyebrow">${item.id} / ${item.type} / ${item.year}</p><h2><button data-record="${item.id}">${escape(item.name)}</button></h2>${condition === 'adapted' ? `<dl class="cl-quick"><div><dt>Material</dt><dd>${escape(item.material)}</dd></div><div><dt>Dimensions</dt><dd>${escape(item.dimensions)}</dd></div></dl>` : ''}</div></li>`).join('')}</ul>`
      : '<div class="cl-empty"><h2>No matching records</h2><p>Try another title or material, or reset the filters to see all four fictional records.</p><button type="button" data-empty-reset>Show all records</button></div>';
    results
      .querySelectorAll('[data-record]')
      .forEach((button) => button.addEventListener('click', () => open(button.dataset.record)));
    results.querySelector('[data-empty-reset]')?.addEventListener('click', reset);
  };
  const open = (id) => {
    selected = id;
    const item = fixture.items.find((entry) => entry.id === id);
    detail.innerHTML = `<button id="cl-back">← Back to results</button><div class="cl-detail-layout"><figure><img src="${escape(item.asset)}" alt="Original schematic of ${escape(item.name)}" width="640" height="480" /><figcaption>${escape(item.caption)}</figcaption></figure><div class="cl-object-record"><p class="eyebrow">${item.id} / fictional record</p><h2 id="cl-detail-title" tabindex="-1">${escape(item.name)}</h2><p>${escape(item.description)}</p><dl><div><dt>Type</dt><dd>${escape(item.type)}</dd></div><div><dt>Year</dt><dd>${item.year}</dd></div><div><dt>Material</dt><dd>${escape(item.material)}</dd></div><div><dt>Dimensions</dt><dd>${escape(item.dimensions)}</dd></div></dl><p class="cl-scope">Original schematic and fictional metadata. No real holdings, historical attribution or availability is implied.</p></div></div>`;
    overview.hidden = true;
    detail.hidden = false;
    root.querySelector('#cl-back').addEventListener('click', () => {
      detail.hidden = true;
      overview.hidden = false;
      results.querySelector(`[data-record="${selected}"]`).focus();
    });
    root.querySelector('#cl-detail-title').focus();
  };
  function reset() {
    query = '';
    type = 'All';
    search.value = '';
    select.value = 'All';
    renderResults();
    search.focus();
  }
  root.querySelector('form').addEventListener('submit', (event) => event.preventDefault());
  search.addEventListener('input', () => {
    query = search.value;
    renderResults();
  });
  select.addEventListener('change', () => {
    type = select.value;
    renderResults();
  });
  root.querySelector('#cl-reset').addEventListener('click', reset);
  renderResults();
}
