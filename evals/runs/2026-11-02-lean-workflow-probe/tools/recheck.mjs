import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runRoot, serve } from './serve.mjs';
import { captureCheckpoint } from '../shared/check-ui.mjs';
import { readFile } from 'node:fs/promises';

const id = process.argv[2];
const requested = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const manifest = JSON.parse(await readFile(path.join(runRoot, 'manifest.json'), 'utf8'));
if (!manifest.generationReady) throw new Error('Operator must freeze inputs/helper before generation');
const entry=manifest.cases.find(c=>c.id===id);
if (!entry || entry.effort !== 'standard') throw new Error('This recheck is authorized only for Standard l03/l04');
if (requested && (!requested.length || new Set(requested).size!==requested.length || requested.some(w=>!manifest.viewports.some(v=>v.width===w)))) throw new Error('Choose distinct supplied widths only');
await readFile(path.join(runRoot,'cases',id,'evidence/self-review/preview.json'),'utf8');
const out = path.join(runRoot, 'cases', id, 'evidence/self-review-recheck');
await mkdir(out, { recursive: true });
await writeFile(path.join(out, 'recheck-started.json'), JSON.stringify({startedAtUtc:new Date().toISOString(),singleUse:true})+'\n', {flag:'wx'});
const { server, baseURL } = await serve();
const browser = await chromium.launch({headless:true});
const record = {caseId:id,startedAtUtc:new Date().toISOString(),browser:browser.version(),scope:'Initial-page post-correction recheck only; no interactions exercised',viewports:[]};
try {
  for (const viewport of manifest.viewports.filter(v=>!requested || requested.includes(v.width))) {
    const context = await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,locale:'en-US',timezoneId:'Asia/Ho_Chi_Minh',colorScheme:'light',reducedMotion:'reduce'});
    const page = await context.newPage();
    await page.route('**/*',route=>route.request().url().startsWith(baseURL+'/')?route.continue():route.abort());
    await page.goto(baseURL+'/cases/'+id+'/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const checkpoint = await captureCheckpoint(page,{outputDir:out,label:viewport.name,fullPage:viewport.name==='mobile'});
    record.viewports.push({viewport,report:path.relative(out,path.join(checkpoint.directory,'report.json')),geometry:checkpoint.report.geometry,images:checkpoint.report.screenshots.map(x=>path.join(checkpoint.directory,x.file))});
    await context.close();
  }
  record.completedAtUtc=new Date().toISOString();
} catch(error) {
  record.error=error.message;
  throw error;
} finally {
  await writeFile(path.join(out,'recheck.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({caseId:id,scope:record.scope,images:record.viewports.flatMap(v=>v.images),geometry:record.viewports.map(v=>({width:v.viewport.width,...v.geometry}))}));
