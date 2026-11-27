import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { root, serve, chromium, geometry } from './browser.mjs';

const model=process.argv[2],pass=process.argv[3]||'initial';
if(!['deepseek','glm'].includes(model)||!['initial','corrected'].includes(pass))throw new Error('Expected model and snapshot');
const out=path.join(root,'evidence',`${model}-${pass}-invalid-switch`);await mkdir(out);
const source=await readFile(path.join(root,'outputs',model,pass,'index.html'));
const report={model,pass,startedAt:new Date().toISOString(),sourceSha256:createHash('sha256').update(source).digest('hex'),observations:[]};
const start=performance.now();const {server,url}=await serve();const browser=await chromium.launch();
try{
  for(const width of [1440,390,320])for(const value of ['','0','-1','1.5']){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();await page.goto(`${url}/outputs/${model}/${pass}/`,{waitUntil:'networkidle'});
    const qty=page.getByLabel(/^quantity$/i).or(page.getByRole('spinbutton')).first();
    await qty.fill(value);await page.getByText('Iron',{exact:true}).first().click();
    const g=await geometry(page);const feedback=g.live.map(x=>x.text||'').join('\n');
    const total=await page.locator('dt').evaluateAll(nodes=>nodes.find(e=>e.textContent.trim()==='Total')?.nextElementSibling?.textContent?.trim());
    const invalid=await qty.getAttribute('aria-invalid')==='true';
    const retained=await qty.inputValue()===value;
    const unavailableTotal=typeof total==='string'&&/—|–|invalid|enter|choose/i.test(total)&&!/(?:USD|\$)\s*\d/.test(total);
    const file=`${width}-${value.replace('.','-')||'empty'}.png`;
    await page.screenshot({path:path.join(out,file),fullPage:false});
    report.observations.push({width,value,retained,invalid,feedback,total,unavailableTotal,pass:retained&&invalid&&!!feedback.trim()&&unavailableTotal,file,geometry:g});
    await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
report.finishedAt=new Date().toISOString();report.durationMs=performance.now()-start;report.passed=report.observations.filter(x=>x.pass).length;report.failed=report.observations.filter(x=>!x.pass).length;
await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({model,pass,passed:report.passed,failed:report.failed,durationMs:report.durationMs},null,2));process.exitCode=report.failed?1:0;
