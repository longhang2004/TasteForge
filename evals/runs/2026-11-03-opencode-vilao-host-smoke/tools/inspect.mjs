import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { root, serve, chromium, AxeBuilder, geometry } from './browser.mjs';

const model=process.argv[2];
if(!['deepseek','glm'].includes(model))throw new Error('Expected deepseek or glm');
const directory=path.join(root,'evidence','initial-inspect',model);
await mkdir(directory,{recursive:true});
const start=performance.now();
const {server,url}=await serve();
const browser=await chromium.launch();
const results=[];
try {
  for(const width of [1440,390,320]) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();const errors=[];const remote=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/*',route=>{const href=route.request().url();if(href.startsWith(url)||href.startsWith('data:'))return route.continue();remote.push(href);return route.abort();});
    await page.goto(`${url}/outputs/${model}/initial/`,{waitUntil:'networkidle'});
    await page.screenshot({path:path.join(directory,`${width}-viewport.png`),fullPage:false});
    await page.screenshot({path:path.join(directory,`${width}-full.png`),fullPage:true});
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    results.push({width,geometry:await geometry(page),errors,remote,axe:axe.violations,
      controls:await page.locator('input,select,button').evaluateAll(elements=>elements.map(e=>({tag:e.tagName,type:e.type,id:e.id,text:e.textContent,ariaLabel:e.getAttribute('aria-label'),disabled:e.disabled,value:e.value}))),
      bodyText:await page.locator('body').innerText()});
    await context.close();
  }
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(path.join(directory,'report.json'),JSON.stringify({model,chromium:browser.version(),durationMs:performance.now()-start,results},null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({width:r.width,overflow:r.geometry.scrollWidth>r.width,errors:r.errors,remote:r.remote,axe:r.axe.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),controls:r.controls})),null,2));
