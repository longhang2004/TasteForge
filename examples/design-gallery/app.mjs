const data = await (await fetch('cases.json')).json();
const list = document.querySelector('#case-list');
const comparison = document.querySelector('#comparison');
const text = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const imageUrl = (entry, capture) =>
  `/captures/${encodeURIComponent(entry.id)}/${encodeURIComponent(capture.id)}.png`;
const traceUrl = (capture) => `/traces/${encodeURIComponent(capture.trace.split('/').at(-2))}.json`;

function render(id, moveFocus = false) {
  const entry = data.cases.find((item) => item.id === id) || data.cases[0];
  list.innerHTML = data.cases
    .map(
      (item) =>
        `<button data-case="${text(item.id)}" aria-pressed="${item.id === entry.id}">${text(item.title)}<span>${item.kind === 'repair' ? 'Before / after' : 'Structural alternatives'}</span></button>`,
    )
    .join('');
  comparison.dataset.case = entry.id;
  comparison.innerHTML = `
    <p class="case-kind">${entry.kind === 'repair' ? 'Before / after repair' : 'Structural alternatives · not before / after'}</p>
    <h2 id="case-heading">${text(entry.title)}</h2>
    <p class="purpose">${text(entry.purpose)}</p>
    <dl class="decision-record">
      <div><dt>Observed</dt><dd>${text(entry.evidence)}</dd></div>
      <div><dt>${entry.kind === 'repair' ? 'Change' : 'Selection'}</dt><dd>${text(entry.change)}</dd></div>
      <div><dt>Keep / tradeoff</dt><dd>${text(entry.keep)}</dd></div>
    </dl>
    <p class="framing">${text(entry.limit)}</p>
    <p class="legend">Blue outlines link to authored notes. A dashed line marks the original viewport boundary on selected full-page captures.</p>
    <div class="capture-grid">${entry.captures
      .map((capture, index) => {
        const o = capture.observed;
        const r = capture.region;
        const noteId = `note-${entry.id}-${capture.id}`;
        return `<figure>
        <h3>${text(capture.label)}</h3>
        <p class="scope">${capture.scope === 'viewport' ? 'Actual viewport capture' : 'Full-page capture'} · image ${o.width}×${o.height}<br />Original viewport ${o.viewport.width}×${o.viewport.height} · scrollY ${o.scrollY}</p>
        <div class="capture" style="max-width:${o.width}px">
          <img src="${imageUrl(entry, capture)}" width="${o.width}" height="${o.height}" alt="${text(capture.alt)}" />
          ${capture.showViewportBoundary ? `<div class="viewport-line annotation" style="top:${((o.scrollY + o.viewport.height) / o.height) * 100}%"><span>Viewport ends here</span></div>` : ''}
          <button class="hotspot annotation" data-note="${noteId}" aria-label="Read note ${index + 1}: ${text(capture.label)}" aria-describedby="${noteId}" style="left:${(r.x / o.width) * 100}%;top:${(r.y / o.height) * 100}%;width:${(r.width / o.width) * 100}%;height:${(r.height / o.height) * 100}%"><span>${index + 1}</span></button>
        </div>
        <figcaption><p id="${noteId}" tabindex="-1"><strong>Note ${index + 1}.</strong> ${text(capture.note)}</p><div class="source-links"><a href="${imageUrl(entry, capture)}">Original PNG</a><a href="${traceUrl(capture)}">Recorded trace</a></div></figcaption>
      </figure>`;
      })
      .join('')}</div>
    <a class="back" href="#cases">Back to cases</a>`;
  const url = new URL(window.location.href);
  url.searchParams.set('case', entry.id);
  url.hash = '';
  window.history.replaceState(null, '', url);
  if (moveFocus) comparison.focus();
}

list.addEventListener('click', (event) => {
  const id = event.target.closest('button')?.dataset.case;
  if (id) render(id, true);
});
comparison.addEventListener('click', (event) => {
  const id = event.target.closest('button')?.dataset.note;
  if (id) document.getElementById(id).focus();
});
document.querySelector('#annotations').addEventListener('change', (event) => {
  document.documentElement.classList.toggle('without-annotations', !event.target.checked);
});
render(new URL(window.location.href).searchParams.get('case'));
