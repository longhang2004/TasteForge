import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve,runRoot} from './serve.mjs';
import {captureCheckpoint} from '../../../../skills/tasteforge/scripts/check-ui.mjs';
const require=createRequire(path.resolve(runRoot,'../../../examples/inventory-workbench/tools/package.json'));
const {chromium}=require('playwright');
const out=path.join(runRoot,'evidence/pricing-probe-01');await mkdir(out,{recursive:true});
assert(!(await import('node:fs')).existsSync(path.join(out,'report.json')),'Do not overwrite raw probe');
const {server,url}=await serve();const browser=await chromium.launch();
const report={startedAt:new Date().toISOString(),scope:'Named invalid-stock displayed-total regression; supplied existing UI before/after, not a fresh quality comparison',observations:[],failures:[]};
try{
  for(const stage of ['before','after'])for(const width of [320,390,1440]){
    const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();
    await page.goto(url+`/cells/fold-3/${stage}/index.html`,{waitUntil:'networkidle'});
    await page.locator('#quantity').fill('3');await page.locator('#edition').selectOption('Ridge');
    const total=await page.locator('#total').innerText(),quantity=await page.locator('#quantity').inputValue();
    const ordinaryPayable=/(?:USD|\$)\s*\d/.test(total);
    report.observations.push({stage,width,quantity,total,ordinaryPayable,expectedKnownBaselineFinding:stage==='before'&&ordinaryPayable});
    if(quantity!=='3'||ordinaryPayable!==(stage==='before'))report.failures.push(`${stage}/${width}: unexpected retained selection or cost state`);
    await captureCheckpoint(page,{outputDir:out,label:`${stage}-${width}-invalid-edit`,feedbackSelectors:['#total','#quantity']});
    await context.close();
  }
}finally{
  report.finishedAt=new Date().toISOString();await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({observations:report.observations.length,knownBaselineFindings:report.observations.filter(x=>x.expectedKnownBaselineFinding).length,failures:report.failures}));
if(report.failures.length)process.exitCode=1;
