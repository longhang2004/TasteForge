import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { repository, serve } from '../../../../examples/composition-studies/tools/serve.mjs';

const run = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const sha = bytes=>createHash('sha256').update(bytes).digest('hex');
const json = async file=>JSON.parse(await readFile(file,'utf8'));
const manifest=await json(path.join(run,'manifest.json'));
for(const [file, record] of Object.entries(manifest.commonInputs)) assert.equal(sha(await readFile(path.join(run,file))),record.sha256,file);
for(const [label, record] of Object.entries(manifest.resources)) for(const [file, expected] of Object.entries(record.files)) assert.equal(sha(await readFile(path.join(run,'resources',label,file))),expected.sha256,file);
const freeze=await json(path.join(run,'reviews/freeze.json'));
for(const [file, expected] of Object.entries(freeze.files)) assert.equal(sha(await readFile(path.join(run,'reviews',file))),expected,file);
const packet=await json(path.join(run,'review-packet/hashes.json'));
for(const [file,expected] of Object.entries(packet)) assert.equal(sha(await readFile(path.join(run,'review-packet',file))),expected,file);
const accepted=await json(path.join(run,'acceptance.json'));
for(const [cell, record] of Object.entries(accepted)){
  const report=await json(path.join(run,record.report));assert.equal(report.failures.length,0);
  assert.equal(sha(await readFile(path.join(run,'cells',cell,'final/index.html'))),report.sourceSha256);
  assert.equal(sha(await readFile(path.join(run,'cells',cell,'initial/index.html'))),report.sourceSha256);
  for(const trace of report.traces) for(const state of trace.states) await stat(path.join(run,state.viewport));
}
const docs=['README.md','report.md','../../../docs/ui-quality-art-direction.md','../../../examples/composition-studies/README.md'];
let links=0;
for(const relative of docs){
  const file=path.resolve(run,relative);const text=await readFile(file,'utf8');
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].split('#')[0];if(!target||target.includes('://'))continue;
    await stat(path.resolve(path.dirname(file),target));links++;
  }
}
const require=createRequire(path.join(repository,'examples/inventory-workbench/tools/package.json'));
const {chromium}=require('playwright');const AxeBuilder=require('@axe-core/playwright').default;
const out=path.join(run,'evidence/gallery-check');await mkdir(out);
const report={startedAt:new Date().toISOString(),links,checks:[],scope:'Gallery navigation/geometry/axe only; app-task evidence separately hash-bound'};
const {server,url}=await serve();const browser=await chromium.launch();
try{
  for(const [id,pathname] of [['studies','/examples/composition-studies/'],['pilot','/evals/runs/2026-11-02-quality-identity-forward-test/']]){
    for(const width of [320,1440]){
      const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      assert.equal((await page.goto(url+pathname)).status(),200);
      if(id==='pilot')await page.locator('table').waitFor();else await page.locator('h1').waitFor();
      await page.keyboard.press('Tab');
      const geometry=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,scrollY,focus:document.activeElement.textContent}));
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      await page.screenshot({path:path.join(out,`${id}-${width}.png`)});
      report.checks.push({id,width,geometry,errors,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:axe.incomplete.map(v=>v.id)});
      assert(geometry.documentWidth<=width,'Gallery overflow');assert.deepEqual(errors,[]);assert.equal(axe.violations.length,0);
      const hrefs=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href));
      for(const href of new Set(hrefs))if(href.startsWith(url))assert.equal((await page.request.get(href)).status(),200,href);
      await context.close();
    }
  }
}catch(error){report.error=error.stack;throw error;}
finally{report.finishedAt=new Date().toISOString();await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(`Frozen inputs/resources/reviews/packet + final hashes verified; ${links} local Markdown links and four gallery viewport/access traces passed.`);
