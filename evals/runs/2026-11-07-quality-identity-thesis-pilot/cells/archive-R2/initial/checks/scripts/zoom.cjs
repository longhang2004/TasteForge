const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
(async()=>{
const b=await chromium.launch();
// 200% text zoom proxy: root font-size doubled at 320 CSS px
const p=await b.newPage({viewport:{width:320,height:800}});
await p.goto('http://127.0.0.1:4191/index.html');
await p.addStyleTag({content:'html{font-size:32px}'});
await p.waitForTimeout(150);
const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
  clipped:Array.from(document.querySelectorAll('h1,.record-title,.tag,.acc')).filter(e=>e.scrollWidth>e.clientWidth+2).length}));
console.log('200% text @320', JSON.stringify(m));
await p.screenshot({path:'checks/zoom200-320.png',fullPage:true});
// reduced motion
const p2=await b.newPage({viewport:{width:1300,height:900},reducedMotion:'reduce'});
await p2.goto('http://127.0.0.1:4191/index.html');await p2.waitForTimeout(100);
console.log('reduce motion transitions:', await p2.evaluate(()=>getComputedStyle(document.querySelector('.chip span')).transitionDuration));
await b.close();})();
