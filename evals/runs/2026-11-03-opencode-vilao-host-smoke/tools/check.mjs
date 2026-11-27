import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { root, serve, chromium, AxeBuilder, geometry } from './browser.mjs';

const model=process.argv[2],pass=process.argv[3]||'initial';
if(!['deepseek','glm'].includes(model)||!['initial','corrected'].includes(pass))throw new Error('Expected model and initial/corrected');
const out=path.join(root,'evidence',`${model}-${pass}`);
await mkdir(out); // Never overwrite a previous test/capture pass.
const started=Date.now(),timer=performance.now();
const source=await readFile(path.join(root,'outputs',model,pass,'index.html'));
const report={model,pass,startedAt:new Date(started).toISOString(),sourceSha256:createHash('sha256').update(source).digest('hex'),assertions:[],captures:[],errors:[],remote:[],keyboard:[],scope:'Automated task/axe/geometry observations; no human testing or conformance claim.'};
const check=(label,condition,details)=>{report.assertions.push({label,pass:!!condition,...(details!==undefined?{details}:{})});};
const live=async page=>(await geometry(page)).live.map(x=>x.text||'').join('\n');
async function amount(page,value){
  const matches=page.getByText(new RegExp(`^(?:USD\\s*|\\$\\s*)${value}(?:\\.00)?$`));
  for(let i=0;i<await matches.count();i++)if(await matches.nth(i).isVisible())return true;
  return false;
}
async function choose(page,name){
  const button=page.getByRole('button',{name:new RegExp(name,'i')});
  if(await button.count())return button.first().click();
  const text=page.getByText(name,{exact:true});
  if(await text.count())return text.first().click();
  return page.getByRole('radio',{name:new RegExp(name,'i')}).check();
}
async function capture(page,width,state,axe=false){
  const file=`${width}-${state}.png`;
  await page.screenshot({path:path.join(out,file),fullPage:false});
  const current=await geometry(page);
  check(`${width} ${state}: no horizontal overflow`,current.scrollWidth<=width+1,current);
  let violations;
  if(axe){
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    violations=result.violations;
    check(`${width} ${state}: axe has no violations`,!violations.length,violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
  }
  report.captures.push({width,state,file,geometry:current,violations});
}
const {server,url}=await serve();const browser=await chromium.launch();report.chromium=browser.version();
try{
  for(const width of [1440,390,320]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(5000);
    page.on('pageerror',error=>report.errors.push({width,message:error.message}));
    await page.route('**/*',route=>{const href=route.request().url();if(href.startsWith(url)||href.startsWith('data:'))return route.continue();report.remote.push({width,url:href});return route.abort();});
    try{
      await page.goto(`${url}/outputs/${model}/${pass}/`,{waitUntil:'networkidle'});
      await capture(page,width,'initial',true);
      check(`${width}: initial total USD 48`,await amount(page,48));
      const body=await page.locator('body').innerText();
      check(`${width}: supplied material, capacity and care visible`,/stoneware/i.test(body)&&/280\s*ml/i.test(body)&&/hand.wash/i.test(body),body);
      check(`${width}: supplied return period and postage visible`,/14\s+days/i.test(body)&&/postage/i.test(body),body);
      check(`${width}: simulation is disclosed`,/no real|no payment|fictional/i.test(body),body);
      check(`${width}: provided image loaded`,await page.locator('img').evaluateAll(images=>images.some(i=>i.complete&&i.naturalWidth>0&&i.getAttribute('src')?.includes('pouring-cup.svg'))));
      const ash=page.getByRole('radio',{name:/ash/i}).or(page.getByRole('button',{name:/ash/i}));
      check(`${width}: sold-out Ash unavailable`,await ash.count()>0
        ? (await ash.first().isDisabled()||await ash.first().getAttribute('aria-disabled')==='true')
        : /ash[\s\S]{0,80}sold out|sold out[\s\S]{0,80}ash/i.test(body));
      const quantity=page.getByLabel(/^quantity$/i).or(page.getByRole('spinbutton')).first();
      const add=page.getByRole('button',{name:/add.*simulat|simulat.*cart/i}).first();
      await quantity.fill('3');check(`${width}: Sand 3 total USD 132`,await amount(page,132));
      await choose(page,'Iron');check(`${width}: lower-stock switch clamps to 2`,await quantity.inputValue()==='2');
      check(`${width}: clamp announced`,/2/.test(await live(page))&&/iron|stock|adjust|reduc/i.test(await live(page)));
      check(`${width}: Iron 2 total USD 90`,await amount(page,90));
      await capture(page,width,'clamp');
      await choose(page,'Sand');
      for(const invalid of ['','0','-1','1.5','5']){
        await quantity.fill(invalid);if(await add.isEnabled())await add.click();
        const constraint=await quantity.evaluate(e=>({invalid:e.getAttribute('aria-invalid')==='true',valid:e.validity.valid,message:e.validationMessage}));
        const message=await live(page);
        check(`${width}: invalid ${JSON.stringify(invalid)} gets feedback`,message.trim().length>0||(!constraint.valid&&!!constraint.message),{message,constraint});
        check(`${width}: invalid ${JSON.stringify(invalid)} cannot succeed`,!/added to (?:the )?simulated cart:|successfully|success:/i.test(message),message);
        if(invalid==='1.5')await capture(page,width,'fractional-invalid',true);
      }
      await quantity.fill('2');await add.click();
      const failed=await live(page);
      check(`${width}: first valid attempt fails recoverably`,/fail|try again|retry/i.test(failed),failed);
      check(`${width}: quantity retained after failure`,await quantity.inputValue()==='2');
      check(`${width}: total retained after failure`,await amount(page,90));
      await capture(page,width,'failure',true);
      await add.click();const success=await live(page);
      check(`${width}: retry succeeds with glaze, quantity and total`,/added|success/i.test(success)&&/sand/i.test(success)&&/\b2\b/.test(success)&&/90(?:\.00)?/.test(success)&&!/fail|try again/i.test(success),success);
      await capture(page,width,'success',true);
      await quantity.fill('1');const edited=await live(page);
      check(`${width}: editing clears stale success`,!/added to (?:the )?simulated cart:|successfully|success:/i.test(edited),edited);
      check(`${width}: edited total USD 48`,await amount(page,48));
      await capture(page,width,'edited');
      // Fresh navigation for a normal Tab-only traversal, not an evidence focus reset.
      await page.goto(`${url}/outputs/${model}/${pass}/`,{waitUntil:'networkidle'});
      const seen=new Set();let reached=false;
      for(let i=0;i<24;i++){
        await page.keyboard.press('Tab');const g=await geometry(page);const key=JSON.stringify([g.focus.tag,g.focus.id,g.focus.text]);
        if(seen.has(key))break;seen.add(key);report.keyboard.push({width,step:i+1,geometry:g});
        if(await add.evaluate(e=>e===document.activeElement)){reached=true;await capture(page,width,'keyboard-add');break;}
      }
      check(`${width}: Tab reaches simulated cart action`,reached);
    }catch(error){check(`${width}: task execution completed`,false,error.message);await page.screenshot({path:path.join(out,`${width}-execution-failure.png`),fullPage:false}).catch(()=>{});}
    await context.close();
  }
  check('No browser script errors',!report.errors.length,report.errors);
  check('No external asset/network attempts',!report.remote.length,report.remote);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
report.finishedAt=new Date().toISOString();report.durationMs=performance.now()-timer;
report.passed=report.assertions.filter(x=>x.pass).length;report.failed=report.assertions.filter(x=>!x.pass).length;
await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({model,pass,passed:report.passed,failed:report.failed,durationMs:report.durationMs,failures:report.assertions.filter(x=>!x.pass)},null,2));
process.exitCode=report.failed?1:0;
