const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const controls=['task','width','state'].map(id=>document.getElementById(id));
let data;
async function load(){try{const r=await fetch('results.json');if(!r.ok)throw Error();data=await r.json();}catch{document.querySelector('#summary').textContent='Could not load results. Serve this run over HTTP using the README command, then reload.';}render();}
function render(){
  if(!data)return;
  const [task,width,state]=controls.map(c=>c.value);
  document.querySelector('#summary').textContent=data.summary;
  const cells=data.cells.filter(c=>c.task===task);
  document.querySelector('#cards').innerHTML=cells.map(c=>{
    const shot=c.images.find(i=>String(i.width)===width&&i.state===state&&!i.reduced);
    return `<article class="card"><p class="eyebrow">${escape(c.id)}</p><h2>${escape(c.name)}</h2><p class="status">${escape(c.status)}</p>${shot?`<div class="preview ${width==='1440'?'':'narrow'}"><a href="${escape(shot.file)}"><img src="${escape(shot.file)}" alt="${escape(c.name)} ${escape(task)} ${escape(state)} at ${width}px natural viewport" loading="lazy"></a></div><p class="meta">${width}px · scrollY ${shot.scrollY} · focus ${escape(shot.focus||'body')}</p>`:'<div class="preview empty">No matching capture. Check raw evidence scope.</div>'}${c.pending?'<p>Creator/checks in progress.</p>':`<p><a href="cells/${c.id}/final/index.html" target="_blank" rel="noopener">Open runnable UI ↗</a></p><p class="meta"><a href="${escape(c.report)}">Raw checks</a> · <a href="cells/${c.id}/${c.stage}/creator-record.json">Creator record</a></p>`}<p class="meta">${escape(c.corrections)}</p></article>`;
  }).join('');
}
controls.forEach(c=>c.addEventListener('change',render));
await load();
