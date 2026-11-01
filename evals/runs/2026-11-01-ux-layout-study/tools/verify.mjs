import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {runRoot} from './serve.mjs';
const json=async file=>JSON.parse(await readFile(path.join(runRoot,file),'utf8'));
const sha=async file=>createHash('sha256').update(await readFile(path.join(runRoot,file))).digest('hex');
async function files(dir){const found=[];for(const e of await readdir(path.join(runRoot,dir),{withFileTypes:true})){if(['node_modules','.git','__pycache__'].includes(e.name))continue;const f=path.posix.join(dir,e.name);if(e.isDirectory())found.push(...await files(f));else if(e.isFile())found.push(f);}return found;}
const manifest=await json('manifest.json');
assert.equal(await sha('protocol.md'),manifest.protocolSha256);
assert.equal(await sha('treatment/reference-catalog.json'),manifest.catalogSha256);
for(const [file,hash]of Object.entries(manifest.skillFiles))assert.equal(await sha('treatment/'+file),hash);
const results=await json('results.json');assert.equal(results.cases.length,12);assert.equal(results.pairs.length,6);
const sourceCells=new Set();
for(const c of manifest.cases){
 const id=c.id;sourceCells.add([c.model,c.promptId,c.condition].join('/'));
 assert.equal(await sha(`cases/${id}/task.md`),c.taskSha256);assert.equal(await sha(`cases/${id}/fixture.json`),c.fixtureSha256);
 assert.equal(await sha(`prompts/${c.promptId}.md`),c.taskSha256);assert.equal(await sha(`shared/${c.promptId}.json`),c.fixtureSha256);
 const browser=await json(`evidence/${id}/browser.json`);
 for(const [file,hash]of Object.entries(browser.sourceHashes))assert.equal(await sha(`cases/${id}/${file}`),hash,`${id}/${file} source changed`);
 assert.deepEqual(c.sourceHashes,browser.sourceHashes);
 assert.equal(Object.keys(browser.viewports).length,2);
 const result=results.cases.find(e=>e.id===id);assert(result);
 for(const [viewport,r]of Object.entries(browser.viewports)){
  const checks=r.checks.filter(e=>e.kind!=='diagnostic');
  assert.equal(result.browser[viewport].passed,checks.filter(e=>e.status==='pass').length);
  assert.equal(result.browser[viewport].total,checks.length);
 }
}
assert.equal(sourceCells.size,12);
for(const [file,hash]of Object.entries(await json('reviews/packet-hashes.json')))assert.equal(await sha(file),hash);
for(const [reviewer,stages]of Object.entries(manifest.reviewStages)){
 assert.equal(Object.keys(stages).length,2);
 for(const stage of ['neutral','authored']){
  assert.equal(await sha(stages[stage].file),stages[stage].sha256,`${reviewer} ${stage} changed`);
  const data=await json(stages[stage].file);assert.equal(data.views.length,12);assert.equal(new Set(data.views.map(v=>v.view)).size,12);
 }
 assert(stages.neutral.observedAtUtc<stages.authored.observedAtUtc,'Neutral review must be frozen first');
}
assert.equal(Object.keys(manifest.reviewStages).length,2);
assert.equal(results.postHocSensitivity.remainingBlocks,5);
assert.equal((await json('evidence/gallery-check.json')).combinations,96);
for(const id of ['deepseek-v4.1-flash-free','glm-5.3-flash-free']){
 const record=await json(`evidence/opencode-availability/${id}.json`);
 assert.equal(record.requestedModel,`opencode/${id}`);assert.equal(record.exitCode,'timeout-90s');
 assert.match(await readFile(path.join(runRoot,`evidence/opencode-availability/${id}.log`),'utf8'),/Free usage limit reached/);
}
const boundFile='evidence/artifact-hashes.json';
if(process.argv.includes('--freeze')){
 const hashes={};for(const file of (await files('')).sort())if(file!==boundFile)hashes[file]=await sha(file);
 await writeFile(path.join(runRoot,boundFile),JSON.stringify({algorithm:'sha256',files:hashes},null,2)+'\n');
 console.log(`Frozen ${Object.keys(hashes).length} study artifacts.`);
}
const bound=await json(boundFile);
for(const [file,hash]of Object.entries(bound.files))assert.equal(await sha(file),hash,`Bound artifact changed: ${file}`);
console.log(`Integrity PASS: 12 unique matched UIs, 24 viewport traces, 2 frozen neutral/authored reviews, 96 gallery states, 5-block sensitivity, 2 blocked OpenCode attempts; ${Object.keys(bound.files).length} artifact hashes.`);
