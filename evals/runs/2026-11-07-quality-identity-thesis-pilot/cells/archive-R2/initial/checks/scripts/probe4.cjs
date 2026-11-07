const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
(async()=>{
const b=await chromium.launch();
for (const w of [320,390,1440]) {
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto('http://127.0.0.1:4191/index.html');await p.waitForTimeout(120);
  const list = await p.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s);const r=e.getBoundingClientRect();return Math.round(r.x)+'..'+Math.round(r.right);};
    return {h1:g('h1'), list:g('#list'), record:g('.record-btn'), foot:g('.foot'), sw:document.documentElement.scrollWidth};
  });
  await p.locator('.record-btn').nth(3).click();await p.waitForTimeout(120);
  const det = await p.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return Math.round(r.x)+'..'+Math.round(r.right);};
    return {h2:g('#record-title'), plate:g('.plate-svg'), cat:g('.cat'), note:g('.dupe'), panel:g('.condition'), sw:document.documentElement.scrollWidth};
  });
  console.log(w, JSON.stringify(list), JSON.stringify(det));
  await p.close();
}
await b.close();})();
