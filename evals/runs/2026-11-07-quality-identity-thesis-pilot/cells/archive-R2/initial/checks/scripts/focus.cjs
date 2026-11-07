const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:4191/index.html');
await p.evaluate(()=>document.body.focus());
const out=[];
for(let i=0;i<14;i++){
  await p.keyboard.press('Tab');
  const r=await p.evaluate(()=>{const a=document.activeElement; const t=a.matches('.chip input')?a.nextElementSibling:a; const s=getComputedStyle(t);
    return {name:(a.id||a.className||a.tagName)+'', outline:s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor, vis:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2};});
  out.push(r);
  if(r.name.includes('record-btn')) break;
}
out.forEach(o=>console.log((o.vis?'OK  ':'MISS'), o.name, '|', o.outline));
await b.close();})();
