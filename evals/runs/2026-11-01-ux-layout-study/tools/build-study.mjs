import {readFile,writeFile,readdir,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {runRoot} from './serve.mjs';
const readJSON=async f=>JSON.parse(await readFile(path.join(runRoot,f),'utf8'));
const sha=async f=>createHash('sha256').update(await readFile(path.join(runRoot,f))).digest('hex');
const manifest=await readJSON('manifest.json');
const exists=async f=>{try{await readFile(path.join(runRoot,f));return true;}catch{return false;}};
const entries=[];
for(const item of manifest.cases){
  if(!await exists(`evidence/${item.id}/browser.json`))continue;
  const evidence=await readJSON(`evidence/${item.id}/browser.json`);
  const files=await readdir(path.join(runRoot,'evidence',item.id));
  entries.push({...item,evidence,files});
}
if(entries.length!==12)throw new Error(`Need 12 final captures; found ${entries.length}`);
let state=20261101;
const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
const shuffled=[...entries];
for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
const mapping={};const packets={neutral:[],authored:[]};const packetHashes={};
for(const [i,item] of shuffled.entries()){
  const view=`view-${String(i+1).padStart(2,'0')}`;mapping[view]=item.id;
  const task=(await readFile(path.join(runRoot,'prompts',`${item.promptId}.md`),'utf8')).split('# Common implementation and tool conditions')[0];
  const fixture=await readJSON(`shared/${item.promptId}.json`);
  const observations=Object.fromEntries(Object.entries(item.evidence.viewports).map(([name,r])=>[name,{
    checks:r.checks,executionError:r.executionError??null,initialText:r.initialText,
    initialGeometry:r.stateGeometry.initial,decisionGeometry:r.stateGeometry.review??r.stateGeometry.detail??null,
    axe:Object.fromEntries(['axeInitial','axeFailure','axeFinal'].filter(k=>r[k]).map(k=>[k,{violations:r[k].violations,incomplete:r[k].incomplete}])),
    pageErrors:r.pageErrors,focusSequence:r.focusSequence,
  }]));
  for(const mode of ['neutral','authored']){
    const images=[];
    const requests=[['desktop','full'],['mobile','full'],['desktop','review'],...(mode==='neutral'?[['mobile',item.promptId==='commerce-craft'?'cart':'failure']]:[])];
    const folder=`reviews/packet/${mode}/${view}`;await mkdir(path.join(runRoot,folder),{recursive:true});
    for(const [viewport,scene]of requests){
      const filename=`${viewport}-${mode==='neutral'?'neutral-':''}${scene}.png`;
      const source=`evidence/${item.id}/${filename}`;
      if(await exists(source)){
        const dest=`${folder}/${viewport}-${scene}.png`;await copyFile(path.join(runRoot,source),path.join(runRoot,dest));
        images.push({viewport,state:scene,file:dest});packetHashes[dest]=await sha(dest);
      }else images.push({viewport,state:scene,file:null,note:'Not captured; inspect execution trace. No replacement evidence fabricated.'});
    }
    const stageObservations=mode==='neutral'?Object.fromEntries(Object.entries(observations).map(([v,{axe,...rest}])=>[v,rest])):observations;
    packets[mode].push({view,promptId:item.promptId,task,fixture,images,observations:stageObservations,narrow320:item.evidence.supportingNarrow320});
  }
}
for(const mode of ['neutral','authored'])await writeFile(path.join(runRoot,`reviews/${mode}-packet.json`),JSON.stringify({stage:mode,views:packets[mode]},null,2)+'\n');
manifest.blindReviewMapping=mapping;manifest.captureHarnessSha256=await sha('tools/capture.mjs');manifest.neutralCSSSha256=await sha('tools/neutral.css');
for(const item of entries){const target=manifest.cases.find(c=>c.id===item.id);target.generation='submitted';target.sourceHashes=item.evidence.sourceHashes;}
await writeFile(path.join(runRoot,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(runRoot,'reviews/packet-hashes.json'),JSON.stringify(packetHashes,null,2)+'\n');

const blocks=[];
for(const task of ['fintech-transfer','commerce-craft','inventory-triage'])for(const model of manifest.models){
 const pair=entries.filter(e=>e.promptId===task&&e.model===model);
 if(random()<.5)pair.reverse();
 blocks.push({task,model,cases:pair.map(e=>({id:e.id,condition:e.condition,files:e.files,promptId:e.promptId,checks:Object.fromEntries(Object.entries(e.evidence.viewports).map(([v,r])=>[v,{passed:r.checks.filter(c=>c.status==='pass'&&c.kind!=='diagnostic').length,total:r.checks.filter(c=>c.kind!=='diagnostic').length}]))}))});
}
const data=JSON.stringify(blocks).replaceAll('<','\\u003c');
await writeFile(path.join(runRoot,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TasteForge UX/layout study</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f3ee;color:#212821;font:16px/1.5 system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:28px}h1{font-size:clamp(28px,4vw,44px);line-height:1.15;letter-spacing:-.03em;max-width:850px}h2{font-size:19px;margin:0 0 8px}p{max-width:960px}a{color:#23513d;text-underline-offset:3px}.intro{font-size:12px;text-transform:uppercase;letter-spacing:.12em}nav{display:flex;gap:20px;flex-wrap:wrap}.notice{border-left:3px solid #827448;background:#e9e6dc;padding:14px 18px}.controls{display:flex;flex-wrap:wrap;gap:16px;align-items:end;border-block:1px solid #c8cfc4;padding:18px 0;margin:24px 0}label{font-size:13px;font-weight:600;display:grid;gap:6px}label.reveal{display:flex;align-items:center;min-height:44px;font-size:14px}select{background:#fff;color:#212821;font:inherit;padding:10px;min-height:44px;max-width:100%;border:1px solid #73806c;border-radius:3px}input[type=checkbox]{width:19px;height:19px}a:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #a46f13;outline-offset:3px}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px}.caption{min-height:118px}.caption p{font-size:13px;margin:7px 0}.frame{padding:10px;border:1px solid #c0c9ba;background:#e1e6dc;min-height:220px}.frame img{display:block;width:100%;height:auto;margin:auto}.pair.mobile img{max-width:390px}.missing{padding:36px;color:#633f17}.foot{margin-top:24px;font-size:14px;border-top:1px solid #c8cfc4;padding-top:16px}@media(max-width:740px){main{padding:20px 14px}.pair{grid-template-columns:1fr}.caption{min-height:0;margin-bottom:14px}.controls label{min-width:140px}}
</style></head><body><main><div class="intro">TasteForge / 12 fresh UIs / 01 November 2026</div><h1>Does the structure help the task?</h1><p>Three tasks, two creator models, two conditions. Same fictional content, starter, offline tools and render access. Compare neutralized structure before revealing authored visuals or skill assignment.</p><p class="notice">Exploratory evidence: one generation per cell, AI reviewers, no population claim. Neutral font replacement can reflow content. Actual-layout measurements and task checks use original renders. Passing checks alone does not establish good UX.</p><nav><a href="report.md">Findings & limits</a><a href="protocol.md">Frozen protocol</a><a href="results.json">All results</a><a href="reviews/README.md">Review artifacts</a></nav><div class="controls"><label>Task and model<select id="block"></select></label><label>Render<select id="mode"><option value="neutral">Neutralized</option><option value="authored">Authored</option></select></label><label>Viewport<select id="viewport"><option value="desktop">Desktop · 1440</option><option value="mobile">Mobile · 390</option></select></label><label>State<select id="scene"><option value="full">Full initial page</option><option value="review">Decision / review</option><option value="failure">Recoverable failure</option><option value="success">Success / cart</option></select></label><label class="reveal"><input type="checkbox" id="reveal">Reveal skill condition</label></div><section id="pair" class="pair"><article><div class="caption" id="label0"></div><div class="frame" id="frame0"></div></article><article><div class="caption" id="label1"></div><div class="frame" id="frame1"></div></article></section><p class="foot">Task contracts include explicit totals, edit/retention and recovery. This differs from the earlier pilot; cross-run pass rates are not comparable. Scores are reported separately by dimension/reviewer. Source and failed outputs are preserved.</p></main><script>
const data=${data};const el=id=>document.getElementById(id);data.forEach((b,i)=>{const o=document.createElement('option');o.value=i;o.textContent=b.task+' / '+b.model;el('block').append(o)});
function render(){const b=data[Number(el('block').value)],v=el('viewport').value,m=el('mode').value;el('pair').classList.toggle('mobile',v==='mobile');b.cases.forEach((c,i)=>{const h=el('label'+i);h.replaceChildren();const title=document.createElement('h2');title.textContent=el('reveal').checked?(c.condition==='no-skill'?'No skill · same tools':'Current skill'):'View '+String.fromCharCode(65+i);h.append(title);const p=document.createElement('p');p.textContent=c.checks[v].passed+'/'+c.checks[v].total+' contract/execution checks passed · inspect trace for scope';h.append(p);const a=document.createElement('a');a.href='cases/'+c.id+'/';a.textContent='Open live submission';h.append(a);let s=el('scene').value;if(s==='success'&&c.promptId==='commerce-craft')s='cart';const f=v+'-'+(m==='neutral'?'neutral-':'')+s+'.png';const box=el('frame'+i);box.replaceChildren();if(c.files.includes(f)){const img=document.createElement('img');img.src='evidence/'+c.id+'/'+f;img.alt=title.textContent+', '+m+' '+v+' '+s;box.append(img)}else{const msg=document.createElement('p');msg.className='missing';msg.textContent='This state was not captured. Inspect the task trace; no replacement screenshot is invented.';const a=document.createElement('a');a.href='evidence/'+c.id+'/browser.json';a.textContent='Read actual browser trace';box.append(msg,a)}})};['block','mode','viewport','scene','reveal'].forEach(id=>el(id).addEventListener('change',render));render();
</script></body></html>`);
await writeFile(path.join(runRoot,'gallery-data.json'),JSON.stringify(blocks,null,2)+'\n');
console.log('Built 12 anonymous neutral/authored packets and six paired gallery blocks.');
