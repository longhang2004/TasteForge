import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { root, serve, chromium, geometry } from './browser.mjs';

const model=process.argv[2],pass=process.argv[3]||'initial';
if(!['deepseek','glm'].includes(model)||!['initial','corrected'].includes(pass))throw new Error('Expected model and snapshot');
const out=path.join(root,'evidence',`${model}-${pass}-follow-up`);await mkdir(out);
const source=await readFile(path.join(root,'outputs',model,pass,'index.html'));
const report={model,pass,startedAt:new Date().toISOString(),sourceSha256:createHash('sha256').update(source).digest('hex'),assertions:[],captures:[]};
const start=performance.now();const check=(label,condition,details)=>report.assertions.push({label,pass:!!condition,details});
const live=async page=>(await geometry(page)).live.map(x=>x.text||'').join('\n');
const {server,url}=await serve();const browser=await chromium.launch();
async function capture(page,width,state){const file=`${width}-${state}.png`;await page.screenshot({path:path.join(out,file),fullPage:false});report.captures.push({width,state,file,geometry:await geometry(page)});}
try{
  for(const width of [1440,390,320]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(5000);
    await page.goto(`${url}/outputs/${model}/${pass}/`,{waitUntil:'networkidle'});
    const qty=page.getByLabel(/^quantity$/i).or(page.getByRole('spinbutton')).first();
    const iron=page.getByRole('radio',{name:/iron/i});const sand=page.getByRole('radio',{name:/sand/i});
    const add=page.getByRole('button',{name:/add.*simulat|simulat.*cart/i}).first();
    await qty.fill('5');await page.getByText('Iron',{exact:true}).first().click();
    const changed=await live(page);
    check(`${width}: displayed over-limit quantity clamps on lower-stock switch`,await qty.inputValue()==='2',{quantity:await qty.inputValue(),feedback:changed});
    check(`${width}: exceptional clamp announced`,/2/.test(changed)&&/iron|stock|adjust|reduc/i.test(changed),changed);
    check(`${width}: exceptional clamp shows USD 90`,await page.getByText(/^(?:USD\s*|\$\s*)90(?:\.00)?$/).count()>0,await page.locator('body').innerText());
    await capture(page,width,'invalid-to-iron');
    await page.goto(`${url}/outputs/${model}/${pass}/`,{waitUntil:'networkidle'});
    let reachedRadio=false;
    for(let i=0;i<20;i++){await page.keyboard.press('Tab');if(await sand.evaluate(e=>e===document.activeElement)){reachedRadio=true;break;}}
    check(`${width}: Tab reaches native glaze group`,reachedRadio);
    if(reachedRadio){await page.keyboard.press('ArrowRight');check(`${width}: ArrowRight selects Iron`,await iron.isChecked());await page.keyboard.press('ArrowRight');check(`${width}: ArrowRight skips disabled Ash`,await sand.isChecked());}
    let reachedQty=false;
    for(let i=0;i<20;i++){await page.keyboard.press('Tab');if(await qty.evaluate(e=>e===document.activeElement)){reachedQty=true;break;}}
    check(`${width}: Tab reaches quantity`,reachedQty);
    if(reachedQty){await page.keyboard.press('Control+A');await page.keyboard.type('2');}
    check(`${width}: keyboard enters quantity 2`,await qty.inputValue()==='2');
    async function toAdd(){for(let i=0;i<20;i++){if(await add.evaluate(e=>e===document.activeElement))return true;await page.keyboard.press('Tab');}return false;}
    check(`${width}: Tab reaches add action`,await toAdd());await page.keyboard.press('Enter');
    check(`${width}: Enter produces recoverable first failure`,/fail|try again|retry|could not/i.test(await live(page)),await live(page));
    check(`${width}: keyboard failure retains quantity`,await qty.inputValue()==='2');await capture(page,width,'keyboard-failure');
    check(`${width}: retry reachable with Tab`,await toAdd());await page.keyboard.press('Enter');
    const success=await live(page);check(`${width}: Enter retry names selection/quantity/total`,/added|success/i.test(success)&&/sand/i.test(success)&&/\b2\b/.test(success)&&/90(?:\.00)?/.test(success),success);
    await capture(page,width,'keyboard-success');await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
report.finishedAt=new Date().toISOString();report.durationMs=performance.now()-start;report.passed=report.assertions.filter(x=>x.pass).length;report.failed=report.assertions.filter(x=>!x.pass).length;
await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({model,pass,passed:report.passed,failed:report.failed,durationMs:report.durationMs,failures:report.assertions.filter(x=>!x.pass)},null,2));process.exitCode=report.failed?1:0;
