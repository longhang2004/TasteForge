import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {runRoot} from './serve.mjs';
const json=async f=>JSON.parse(await readFile(path.join(runRoot,f),'utf8'));
const sha=async f=>createHash('sha256').update(await readFile(path.join(runRoot,f))).digest('hex');
const manifest=await json('manifest.json'),results=await json('results.json');
assert.equal(await sha('protocol.md'),manifest.protocolSha256);
assert.equal(await sha('treatment/reference-catalog.json'),manifest.catalogSha256);
for(const [file,hash]of Object.entries(manifest.skillFiles))assert.equal(await sha('treatment/'+file),hash);
assert.equal(results.cases.length,2);assert.equal(results.pairedBlocks,1);
const tasks=new Set(),fixtures=new Set();
for(const c of manifest.cases){
 tasks.add(await sha(`cases/${c.id}/task.md`));fixtures.add(await sha(`cases/${c.id}/fixture.json`));
 assert.equal(await sha(`cases/${c.id}/task.md`),c.taskSha256);assert.equal(await sha(`cases/${c.id}/fixture.json`),c.fixtureSha256);
 const b=await json(`evidence/${c.id}/browser.json`),g=await json(`evidence/${c.id}/generation.json`);
 assert.equal(g.init.model,'gemini-3.8-flash-medium');assert.equal(g.result.status,'SUCCESS');assert.equal(g.exitCode,0);
 assert.equal(g.result.denied_actions?.length??0,0);assert.equal(g.result.conversation_id,c.conversationId);
 for(const [file,hash]of Object.entries(b.sourceHashes))assert.equal(await sha(`cases/${c.id}/${file}`),hash,`Submitted source changed: ${c.id}/${file}`);
 assert.deepEqual(b.sourceHashes,c.sourceHashes);
 const r=results.cases.find(e=>e.id===c.id);
 for(const [viewport,v]of Object.entries(b.viewports)){
  const checks=v.checks.filter(e=>e.kind!=='diagnostic');assert.equal(r.browser[viewport].total,checks.length);assert.equal(r.browser[viewport].passed,checks.filter(e=>e.status==='pass').length);
 }
 const bootstrap=await json(`evidence/${c.id}/bootstrap-01/generation.json`);
 assert(bootstrap.result.denied_actions.length>0,'Original bootstrap denial must remain recorded');
}
assert.equal(tasks.size,1);assert.equal(fixtures.size,1);
for(const [file,hash]of Object.entries(await json('reviews/packet-hashes.json')))assert.equal(await sha(file),hash);
for(const reviewer of ['r1','r2']){
 const file=`reviews/reviewer-${reviewer}.json`;const r=await json(file);
 assert.equal(await sha(file),manifest.reviewHashes[reviewer]);assert.equal(r.samples.length,2);assert.equal(new Set(r.samples.map(v=>v.view)).size,2);
 for(const s of r.samples)for(const d of results.dimensions){assert(s.scores[d]===null||(Number.isInteger(s.scores[d])&&s.scores[d]>=1&&s.scores[d]<=5));assert.equal(typeof s.evidence[d],'string');}
}
assert.equal((await json('evidence/gallery-check.json')).combinations,20);
const readiness=await json('evidence/availability/probe.json');assert.equal(JSON.parse(readiness.stdout).response.trim(),'READY');
async function files(dir){const list=[];for(const e of await readdir(path.join(runRoot,dir),{withFileTypes:true})){if(['node_modules','.git','__pycache__'].includes(e.name))continue;const f=path.posix.join(dir,e.name);if(e.isDirectory())list.push(...await files(f));else if(e.isFile())list.push(f);}return list;}
const bound='evidence/artifact-hashes.json';
if(process.argv.includes('--freeze')){
 const hashes={};for(const file of (await files('')).sort())if(file!==bound)hashes[file]=await sha(file);
 await writeFile(path.join(runRoot,bound),JSON.stringify({algorithm:'sha256',files:hashes},null,2)+'\n');
}
const hashes=await json(bound);for(const [file,hash]of Object.entries(hashes.files))assert.equal(await sha(file),hash,`Bound artifact changed: ${file}`);
console.log(`Integrity PASS: 2 matched Antigravity UIs, 4 viewport traces, 2 preserved bootstrap failures, 2 independent reviews, 20 viewer states, ${Object.keys(hashes.files).length} artifact hashes.`);
