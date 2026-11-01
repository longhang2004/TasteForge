import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve,runRoot} from './serve.mjs';
const {server,baseURL}=await serve();const browser=await chromium.launch({headless:true});const checks=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1,reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));await page.goto(baseURL);
 for(const mode of ['monochrome','authored'])for(const viewport of ['desktop','mobile'])for(const scene of ['full','detail','review','failure','success']){
  await page.selectOption('#mode',mode);await page.selectOption('#viewport',viewport);await page.selectOption('#scene',scene);
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.frame img')).every(i=>i.complete&&i.naturalWidth>0));
  const result=await page.locator('.frame').evaluateAll(nodes=>nodes.map(n=>({images:n.querySelectorAll('img').length,missing:n.querySelectorAll('.missing').length})));
  assert(result.every(n=>n.images+n.missing===1));checks.push({mode,viewport,scene,result});
 }
 await page.selectOption('#mode','authored');await page.selectOption('#viewport','mobile');await page.selectOption('#scene','review');
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.frame img')).every(i=>i.complete&&i.naturalWidth>0));
 await page.locator('#pair').screenshot({path:path.join(runRoot,'evidence/comparison-mobile-review.png')});
 await page.selectOption('#scene','full');await page.screenshot({path:path.join(runRoot,'evidence/gallery-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Gallery overflow');
 await page.screenshot({path:path.join(runRoot,'evidence/gallery-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 await writeFile(path.join(runRoot,'evidence/gallery-check.json'),JSON.stringify({combinations:checks.length,checks,pageErrors:errors,mobileOverflow:false},null,2)+'\n');
 console.log(`PASS: ${checks.length} paired viewer states; loaded images or explicit missing evidence; no JS errors/mobile overflow.`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
