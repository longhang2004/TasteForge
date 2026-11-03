const fs=require('fs');
const path=require('path');
const base=__dirname;
const {chromium}=require(path.resolve('examples/inventory-workbench/tools/node_modules/playwright'));
const axe=require(path.resolve('examples/inventory-workbench/tools/node_modules/.pnpm/node_modules/axe-core'));
(async()=>{
const output={started:new Date().toISOString(),browserRuntime:path.resolve('examples/inventory-workbench/tools/node_modules/playwright'),checks:[],errors:[]};
let browser;
try{
browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage();page.on('pageerror',e=>output.errors.push(String(e)));
const url='file://'+path.join(base,'index.html');
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});await page.goto(url);
 await page.screenshot({path:path.join(base,`collection-${width}.png`),fullPage:true});
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
 output.checks.push({name:'collection layout',width,...dimensions,pass:dimensions.scroll<=width});
 await page.addScriptTag({content:axe.source});
 const a=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 output.checks.push({name:'axe collection',width,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:a.incomplete.map(v=>v.id)});
 await page.locator('#search').fill('engine');
 output.checks.push({name:'search note',width,count:await page.locator('.record').count(),title:await page.locator('.record-title').textContent()});
 await page.locator('#search').fill('');await page.locator('#habitat').selectOption('Channel');
 output.checks.push({name:'habitat filter',width,count:await page.locator('.record').count()});
 await page.locator('#search').fill('nonexistent');
 output.checks.push({name:'empty result',width,emptyVisible:await page.locator('#empty').isVisible(),countText:await page.locator('#result-count').textContent()});
 await page.screenshot({path:path.join(base,`empty-natural-${width}.png`)});
 await page.locator('#reset').click();
 output.checks.push({name:'reset',width,count:await page.locator('.record').count(),search:await page.locator('#search').inputValue(),habitat:await page.locator('#habitat').inputValue(),focused:await page.evaluate(()=>document.activeElement.id)});
 await page.locator('#search').fill('quiet');await page.locator('#habitat').selectOption('Salt pool');
 await page.locator('#open-EL-03').focus();
 const scrollBefore=await page.evaluate(()=>scrollY);
 await page.keyboard.press('Enter');
 const detailDimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,focused:document.activeElement.id,top:scrollY}));
 output.checks.push({name:'long title detail keyboard opening',width,...detailDimensions,title:await page.locator('#detail-title').textContent(),transcript:await page.locator('#detail-transcript').textContent(),pass:detailDimensions.scroll<=width});
 await page.screenshot({path:path.join(base,`detail-natural-${width}.png`)});
 await page.screenshot({path:path.join(base,`detail-${width}.png`),fullPage:true});
 const detailAxe=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 output.checks.push({name:'axe detail',width,violations:detailAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:detailAxe.incomplete.map(v=>v.id)});
 await page.locator('#back').click();
 output.checks.push({name:'retained return',width,search:await page.locator('#search').inputValue(),habitat:await page.locator('#habitat').inputValue(),ids:await page.locator('.record-id').allTextContents(),focused:await page.evaluate(()=>document.activeElement.id),scrollBefore,scrollAfter:await page.evaluate(()=>scrollY)});
 await page.screenshot({path:path.join(base,`return-natural-${width}.png`)});
}
}catch(e){output.errors.push(e.stack||String(e));process.exitCode=1}
finally{if(browser)await browser.close();output.finished=new Date().toISOString();fs.writeFileSync(path.join(base,'check-output.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));}
})();
