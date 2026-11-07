const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:320,height:800}});
await p.goto('http://127.0.0.1:4191/index.html');
await p.addStyleTag({content:'html{font-size:32px}'});await p.waitForTimeout(150);
const off=await p.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(e=>{const r=e.getBoundingClientRect();return r.right>321&&r.width>0;}).slice(0,12).map(e=>e.tagName+'.'+(e.className||'')+' -> '+Math.round(e.getBoundingClientRect().right)+' w'+Math.round(e.getBoundingClientRect().width)));
console.log(off.join('\n'));
console.log('clipped:', await p.evaluate(()=>Array.from(document.querySelectorAll('h1,.record-title,.tag,.acc')).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className+':'+e.textContent.slice(0,30))));
await b.close();})();
