import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { runRoot,serve } from './serve.mjs';
const require=createRequire(path.resolve(runRoot,'../../../examples/inventory-workbench/tools/package.json'));
const {chromium}=require('playwright');
const out=path.join(runRoot,'evidence/price-precision-probe');await mkdir(out);
const accepted=JSON.parse(await readFile(path.join(runRoot,'acceptance.json'),'utf8'));
const {server,url}=await serve();const browser=await chromium.launch();
const report={startedAt:new Date().toISOString(),reason:'Previous monthly /12/ could also match120. Supplement checks exact currency amount and period; no UI change.',checks:[],failures:[]};
try{
  for(const [cell,data] of Object.entries(accepted).filter(([cell])=>cell.startsWith('relay'))){
    const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
    try{
      await page.goto(`${url}/cells/${cell}/${data.stage}/index.html`);
      for(const [plan,expected,period] of [['annual',120,/year|annual/i],['monthly',12,/month/i]]){
        await page.locator('#billing').selectOption(plan);
        const text=await page.locator('#price').innerText();
        const match=text.match(/(?:USD|\$)\s*([0-9]+(?:\.[0-9]+)?)/i)||text.match(/([0-9]+(?:\.[0-9]+)?)/);
        assert(match);assert.equal(Number(match[1]),expected);assert.match(text,period);
        report.checks.push({cell,plan,text,sourceSha256:createHash('sha256').update(await readFile(path.join(runRoot,'cells',cell,data.stage,'index.html'))).digest('hex')});
      }
    }catch(error){report.failures.push({cell,error:error.stack});}finally{await context.close();}
  }
}finally{report.finishedAt=new Date().toISOString();await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(JSON.stringify({checks:report.checks.length,failures:report.failures}));if(report.failures.length)process.exitCode=1;
