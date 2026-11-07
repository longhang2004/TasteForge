const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://127.0.0.1:4191/index.html');
await p.evaluate(()=>document.body.focus());
for(let i=0;i<4;i++) await p.keyboard.press('Tab');
console.log('focus on:', await p.evaluate(()=>document.activeElement.dataset.open||document.activeElement.id));
await p.keyboard.press('Enter');await p.waitForTimeout(120);
console.log('detail open:', await p.locator('#detail').isVisible(), '| focus:', await p.evaluate(()=>document.activeElement.id));
await p.screenshot({path:'checks/kb-detail-390.png',fullPage:true});
await p.keyboard.press('Escape');await p.waitForTimeout(120);
console.log('back, focus restored to:', await p.evaluate(()=>document.activeElement.dataset.open||document.activeElement.tagName));
// empty state at 320
await p.setViewportSize({width:320,height:844});
await p.fill('#q','weir');await p.waitForTimeout(100);
await p.getByText('Craft Teaching').first().click();await p.waitForTimeout(120);
console.log('empty visible:', await p.locator('#empty').isVisible(), '| reset btn h:', await p.evaluate(()=>Math.round(document.querySelector('#reset').getBoundingClientRect().height)));
await p.screenshot({path:'checks/empty-320.png',fullPage:true});
await b.close();})();
