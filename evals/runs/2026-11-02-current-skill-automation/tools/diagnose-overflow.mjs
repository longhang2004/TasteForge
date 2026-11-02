import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runRoot, serve } from './serve.mjs';
const id=process.argv[2], width=Number(process.argv[3]??320);
if(!/^c\d{2}$/.test(id??'')||width<240||width>2000)throw new Error('Case and bounded width required');
const out=path.join(runRoot,'evidence/diagnostics');await mkdir(out,{recursive:true});
const {server,baseURL}=await serve();const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width,height:740},reducedMotion:'reduce'});
 await page.route('**/*',r=>r.request().url().startsWith(baseURL+'/')?r.continue():r.abort());
 await page.goto(baseURL+'/cases/'+id+'/',{waitUntil:'networkidle'});
 const report=await page.evaluate(()=>{
  const w=innerWidth;return {viewport:{width:w,height:innerHeight},documentWidth:document.documentElement.scrollWidth,
   elements:[...document.querySelectorAll('body *')].map(e=>({e,r:e.getBoundingClientRect(),css:getComputedStyle(e)})).filter(x=>x.r.height>0&&x.css.visibility!=='hidden'&&(x.r.left<-.5||x.r.right>w+.5)).map(({e,r,css})=>({tag:e.tagName,id:e.id,className:e.className,text:e.textContent?.trim().slice(0,120),left:r.left,right:r.right,width:r.width,minWidth:css.minWidth,display:css.display,gridTemplateColumns:css.gridTemplateColumns})).slice(0,40)};
 });
 const result={case:id,capturedAtUtc:new Date().toISOString(),scope:'Read-only authored initial-state geometry diagnostic, no UI repair',...report};
 await writeFile(path.join(out,id+'-'+width+'-overflow.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
