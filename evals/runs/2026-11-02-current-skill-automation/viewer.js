const data = await fetch('viewer-data.json').then(response => { if (!response.ok) throw new Error('Capture metadata unavailable'); return response.json(); });
const element = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
const taskName = value => value === 'fintech-transfer' ? 'Transfer review and recovery' : 'Craft product purchase conditions';
element('pair').innerHTML = data.pairs.map(pair => `<option value="${pair.id}">${escape(pair.model)} · ${escape(taskName(pair.task))}</option>`).join('');
element('snapshot').textContent = `${data.cases.filter(row => row.capturedAtUtc).length} actual captured UIs · metadata snapshot ${data.generatedAtUtc}`;
function imageFor(row, viewport, scene, mode, scope) {
  const state = scene === 'initial' ? 'full' : scene;
  let filename;
  if (mode === 'neutral') filename = `${viewport}-neutral-${state}.png`;
  else if (scene === 'initial') filename = `${viewport}-${scope === 'viewport' ? 'initial' : 'full'}.png`;
  else filename = `${viewport}-${scene}${scope === 'viewport' && scene !== 'keyboard-focus' ? '-viewport' : ''}.png`;
  if (scope === 'full' && scene === 'keyboard-focus') return null;
  return row.images.includes(filename) ? `${row.imageDirectory}/${filename}` : null;
}
function render() {
  const pair = data.pairs.find(row => row.id === element('pair').value);
  const viewport = element('viewport').value, scene = element('scene').value, mode = element('mode').value;
  element('scope').disabled = mode === 'neutral';
  if (mode === 'neutral') element('scope').value = 'full';
  const scope = element('scope').value;
  const dimensions = data.viewports.find(row => row.name === viewport);
  element('scope-note').textContent = `${dimensions.width} × ${dimensions.height} capture viewport. ${scope === 'full' ? 'Full page: includes content below the visible viewport.' : 'Top-of-page viewport: clipped to the stated screen height.'} All state captures reset scroll to the top; they do not show natural post-click scroll or focus landings. ${mode === 'neutral' ? 'Monochrome diagnostic changes font geometry; compare authored evidence too.' : 'Original authored rendering; no design repairs applied.'}`;
  element('comparison').innerHTML = [pair.noSkill, pair.currentSkill].map(id => {
    const row = data.cases.find(value => value.id === id), image = imageFor(row, viewport, scene, mode, scope);
    const check = row.checks?.[viewport];
    const caption = `${mode === 'neutral' ? 'Monochrome diagnostic' : 'Authored'} · ${scene} · ${scope === 'full' ? 'full-page' : 'top-of-page viewport'} · ${dimensions.width} × ${dimensions.height}`;
    const missing = row.capturedAtUtc ? 'No capture for this state/scope. The flow may not require this state, or the operator trace may have stopped; inspect browser JSON.' : `No operator capture yet. Generation status: ${row.generation}.`;
    return `<article class="case" data-case="${row.id}"><header><p class="badge">${row.condition === 'no-skill' ? 'Without skill' : 'Current TasteForge skill'}</p><h2>${escape(taskName(row.promptId))}</h2><p class="meta">${escape(row.model)} · ${escape(row.host)} · ${row.id}</p></header><div class="frame">${image ? `<img src="${image}" alt="${escape(caption)} for ${row.condition === 'no-skill' ? 'without skill' : 'current skill'}">` : `<p class="missing">${escape(missing)}</p>`}</div><div class="caption"><p>${escape(caption)}</p><p>${check ? `${check.passed}/${check.total} recorded scripted checks at this width; this is not a UX score.${check.executionError ? ' Task trace interrupted: ' + escape(check.executionError) : ''}` : 'No scripted task result at this width yet.'}</p><p>${row.finalEvidenceSelected ? 'Final evidence pass explicitly selected; original diagnostics retained.' : 'Initial/in-progress operator evidence; final pass has not been selected.'}</p><div class="links">${image ? `<a href="${image}">Original image</a>` : ''}${row.capturedAtUtc ? `<a href="cases/${row.id}/index.html">Runnable UI</a><a href="cases/${row.id}/styles.css">CSS</a><a href="cases/${row.id}/app.js">JavaScript</a><a href="cases/${row.id}/implementation-notes.md">Creator notes</a><a href="${row.evidencePath}">Selected browser trace</a><a href="${row.initialEvidencePath}">Initial diagnostics</a>` : ''}<a href="cases/${row.id}/task.md">Task</a></div></div></article>`;
  }).join('');
  document.body.dataset.renderKey = [pair.id, viewport, scene, mode, scope].join('|');
}
for (const id of ['pair','viewport','scene','mode','scope']) element(id).addEventListener('change', render);
const optionalModels = [...new Set(data.cases.filter(row => row.optional).map(row => row.model))];
element('availability').innerHTML = optionalModels.map(model => {
  const rows = data.cases.filter(row => row.optional && row.model === model);
  const blocked = rows.every(row => row.generation === 'availability-blocked');
  const evidence = rows.find(row => row.availabilityEvidence)?.availabilityEvidence;
  return `<article><h3>${escape(model)}</h3><p>${blocked ? 'Provider free-usage limit reached. No UI generated; no UI quality score.' : 'Optional cells pending availability; no quality conclusion without generated evidence.'} ${rows.length} planned cells.</p>${evidence ? `<a href="${escape(evidence)}">Actual availability record</a>` : ''}</article>`;
}).join('');
render();
