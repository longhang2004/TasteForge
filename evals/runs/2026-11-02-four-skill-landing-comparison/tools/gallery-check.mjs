import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve,runRoot} from './serve.mjs';

const require=createRequire(path.resolve(runRoot,'../../../examples/inventory-workbench/tools/package.json'));
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const out=path.join(runRoot,'evidence',process.argv[2]||'gallery-01');
await mkdir(out);
const report={startedAt:new Date().toISOString(),checks:[],failures:[],captures:[],scope:'Gallery navigation/links/rendering only; eight UI task checks and independent reviews are separate'};
const browser=await chromium.launch();
const {server,url}=await serve();
const context=await browser.newContext();
const page=await context.newPage();
page.on('pageerror',error=>report.failures.push(error.message));
async function check(name,fn){try{await fn();report.checks.push({name,pass:true});}catch(error){report.failures.push(`${name}: ${error.message}`);report.checks.push({name,pass:false,error:error.message});}}
try{
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForSelector('.card');
  await page.keyboard.press('Tab');
  await check('first keyboard stop is skip link',async()=>assert.equal(await page.locator(':focus').innerText(),'Skip to comparison'));
  await page.keyboard.press('Enter');
  await check('skip link focuses comparison',async()=>assert.equal(await page.locator(':focus').getAttribute('id'),'comparison'));
  const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  for(const href of [...new Set(links.filter(h=>!h.startsWith('#'))) ]){
    await check(`local link ${href}`,async()=>assert((await page.request.get(new URL(href,url).href)).ok()));
  }
  for(const viewport of [1440,320]){
    await page.setViewportSize({width:viewport,height:900});
    for(const task of ['field-fold','relay-notes']){
      await page.selectOption('#task',task);
      for(const width of ['1440','390','320']){
        await page.selectOption('#width',width);
        for(const state of ['entry','decision','invalid','failure','success']){
          await page.selectOption('#state',state);
          await check(`${viewport}/${task}/${width}/${state} four real captures`,async()=>{
            assert.equal(await page.locator('.card').count(),4);
            assert.equal(await page.locator('.card img').count(),4);
            for(const img of await page.locator('.card img').all()){
              // Native lazy images below the fold are fetched without scrolling the gallery.
              await img.evaluate(async el=>{el.loading='eager';await el.decode();});
              assert(await img.evaluate(el=>el.naturalWidth>0));
            }
            assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
          });
        }
      }
      for(const href of await page.locator('.card a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')))){
        await check(`runnable/evidence link ${href}`,async()=>assert((await page.request.get(new URL(href,url).href)).ok()));
      }
    }
    await page.selectOption('#task','field-fold');
    await page.selectOption('#width','1440');
    await page.selectOption('#state','entry');
    await page.locator('#task').focus();
    await check(`${viewport} visible control focus`,async()=>assert.notEqual(await page.locator('#task').evaluate(el=>getComputedStyle(el).outlineStyle),'none'));
    await check(`${viewport} gallery axe`,async()=>{
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      report[`axe${viewport}`]={violations:result.violations,incomplete:result.incomplete};
      assert.equal(result.violations.length,0);
    });
    // Retain actual focus/scroll; screenshots are gallery previews, not UI task evidence.
    const file=`gallery-${viewport}.png`;
    await page.screenshot({path:path.join(out,file)});
    report.captures.push({file,viewport,scroll:await page.evaluate(()=>({x:scrollX,y:scrollY})),focus:await page.locator(':focus').getAttribute('id')});
  }
}finally{
  report.finishedAt=new Date().toISOString();
  await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({checks:report.checks.length,failures:report.failures}));
if(report.failures.length)process.exitCode=1;
