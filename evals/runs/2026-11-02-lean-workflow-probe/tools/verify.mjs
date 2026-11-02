import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';
const load = async file => JSON.parse(await readFile(path.join(runRoot,file),'utf8'));
const sha = async file => createHash('sha256').update(await readFile(path.join(runRoot,file))).digest('hex');
const exists = async file => {try {await access(path.join(runRoot,file));return true;} catch(e) {if(e.code==='ENOENT')return false;throw e;}};
async function files(folder='') {
 const out=[];
 for (const e of await readdir(path.join(runRoot,folder),{withFileTypes:true})) {
  if (['node_modules','.git','__pycache__'].includes(e.name)) continue;
  const file=path.posix.join(folder,e.name);
  if(e.isDirectory())out.push(...await files(file));else if(e.isFile())out.push(file);
 }
 return out;
}
const manifest=await load('manifest.json');
assert.equal(manifest.cases.length,4,'Only four planned UI cells');
assert.equal(manifest.generationReady,true,'Final snapshots/helper must be frozen');
assert.equal(await sha('protocol.md'),manifest.protocolSha256,'Base protocol changed');
for(const [condition,snapshot] of Object.entries(manifest.skillSnapshots)) {
 for(const [file,hash]of Object.entries(snapshot.files))assert.equal(await sha('treatment/'+condition+'/tasteforge/'+file),hash,'Frozen '+condition+' resource changed: '+file);
 const md=Object.keys(snapshot.files).filter(f=>f.endsWith('.md'));
 assert.equal(md.length,snapshot.stats.markdownFiles,'Markdown snapshot count mismatch');
}
assert.equal(manifest.skillSnapshots.old.stats.markdownFiles,20,'Baseline source had twenty Markdown files');
assert.equal(await sha('shared/check-ui.mjs'),manifest.sharedHelperSha256,'Equal common helper changed');
assert.equal(manifest.skillSnapshots.lean.files['scripts/check-ui.mjs'],manifest.sharedHelperSha256,'Shared helper differs from frozen lean helper');
for(const [kind,hashes]of Object.entries(manifest.sharedStarterHashes)) {
 const folder='shared/'+(kind==='product'?'product-starter':'transfer-starter');
 for(const[file,hash]of Object.entries(hashes))assert.equal(await sha(folder+'/'+file),hash,'Shared starter changed');
}
for(const amendment of manifest.protocolAmendments??[]) {
 assert.equal(await sha(amendment.file),amendment.sha256,'Declared amendment changed');
 const record=await load(amendment.record);
 assert.equal(record.baseProtocolUnchanged,true);
 assert.equal(record.noStandardInferenceObserved,true);
 for(const[file,hash]of Object.entries(record.originalHashes))assert.equal(await sha('evidence/protocol-amendment-01/original/'+file),hash,'Original amended input changed');
 for(const[file,hash]of Object.entries(record.amendedHashes))assert.equal(await sha(file),hash,'Amended input changed');
}
let captured=0,traces=0,checks=0,passed=0;
for(const entry of manifest.cases) {
 assert.equal(await sha('cases/'+entry.id+'/task.md'),entry.taskSha256,'Task changed '+entry.id);
 assert.equal(await sha('prompts/'+entry.promptId+'.md'),entry.taskSha256,'Task differs within pair '+entry.id);
 assert.equal(await sha('cases/'+entry.id+'/fixture.json'),entry.fixtureSha256,'Fixture changed '+entry.id);
 assert.equal(await sha('shared/'+(entry.effort==='fast'?'commerce-craft':'fintech-transfer')+'.json'),entry.fixtureSha256);
 assert.equal(await sha('tools/'+entry.id+'-prompt.txt'),entry.creatorPromptSha256,'Creator prompt changed');
 const recordPath='evidence/'+entry.id+'/browser.json';
 if(!await exists(recordPath)) {
  if(process.argv.includes('--freeze'))throw new Error('Cannot freeze before all four actual cases are captured: '+entry.id);
  continue;
 }
 captured++;
 const b=await load(recordPath);
 assert.equal(b.caseId,entry.id);assert.equal(b.captureVersion,'lean-natural-1.0');
 assert.equal(b.checkpointHelperSha256,manifest.sharedHelperSha256);
 assert.equal(b.captureToolSha256,await sha('tools/capture.mjs'),'Executed capture code changed');
 assert.deepEqual(Object.keys(b.viewports),manifest.viewports.map(v=>v.name));
 for(const[file,hash]of Object.entries(b.sourceHashes))assert.equal(await sha('cases/'+entry.id+'/'+file),hash,'Submission changed after capture: '+entry.id+'/'+file);
 for(const viewport of manifest.viewports) {
  traces++;const v=b.viewports[viewport.name];assert.deepEqual(v.viewport,viewport);
  assert(v.checks.length>0);checks+=v.checks.length;passed+=v.checks.filter(c=>c.status==='pass').length;
  assert(v.checks.every(c=>['pass','fail'].includes(c.status)));
  assert(v.screenshots.length>0);
  for(const image of v.screenshots)assert(await exists('evidence/'+entry.id+'/'+image),'Screenshot missing: '+image);
  for(const[state,checkpoint]of Object.entries(v.stateGeometry)) {
   assert.equal(checkpoint.scope,'Current natural viewport; no scroll or focus reset');
   const prefix='evidence/'+entry.id+'/checkpoints/'+viewport.name+'-'+state;
   assert(await exists(prefix+'/report.json'),'Checkpoint metadata missing');
   assert.deepEqual(await load(prefix+'/report.json'),checkpoint,'Checkpoint report differs from capture record');
  }
  assert(v.executionError||v.axeFinal,'No final scan and no disclosed interruption');
 }
 if(entry.host==='antigravity'&&await exists('evidence/'+entry.id+'/generation.json')) {
  const g=await load('evidence/'+entry.id+'/generation.json');
  const a=await load('evidence/protocol-amendment-01/record.json');
  assert(Date.parse(g.startedAtUtc)>=Date.parse(a.recordedAtUtc),'Standard generation preceded declared amendment');
 }
}
// Worked correction is not another paired sample; bind its provenance separately.
if (await exists('worked-finalization/manifest.json')) {
 const prefix='worked-finalization/';
 const worked=await load(prefix+'manifest.json');
 const correction=await load(prefix+'correction.json');
 assert.equal(worked.type,'operator-targeted-finalization-not-a-paired-trial');
 assert.equal(worked.generationReady,true);
 for(const[file,hash]of Object.entries(worked.frozenInputHashes))assert.equal(await sha(prefix+file),hash,'Worked input changed');
 for(const[file,hash]of Object.entries(correction.before))assert.equal(await sha('cases/l04/'+file),hash,'Raw source was altered during finalization');
 for(const[file,hash]of Object.entries(correction.after))assert.equal(await sha(prefix+'cases/f01/'+file),hash,'Worked correction changed');
 for(const file of ['app.js','fixture.json','task.md'])assert.equal(correction.before[file],correction.after[file],'Unrequested worked change');
 const b=await load(prefix+'evidence/f01/browser.json');
 assert.equal(b.captureToolSha256,await sha(prefix+'tools/capture.mjs'));
 assert.equal(b.checkpointHelperSha256,manifest.sharedHelperSha256);
 for(const[file,hash]of Object.entries(b.sourceHashes))assert.equal(await sha(prefix+'cases/f01/'+file),hash,'Worked source changed after capture');
 for(const v of Object.values(b.viewports))for(const image of v.screenshots)assert(await exists(prefix+'evidence/f01/'+image),'Worked capture missing');
}
const target='evidence/artifact-hashes.json';
if(process.argv.includes('--freeze')) {
 assert(!await exists(target),'Never replace frozen artifact hashes');
 const hashes={};for(const file of (await files()).sort())if(file!==target)hashes[file]=await sha(file);
 await writeFile(path.join(runRoot,target),JSON.stringify({algorithm:'sha256',frozenAtUtc:new Date().toISOString(),files:hashes},null,2)+'\n');
}
let hashes=0;
if(await exists(target)) {
 const bound=await load(target);for(const[file,hash]of Object.entries(bound.files))assert.equal(await sha(file),hash,'Frozen artifact changed: '+file);
 hashes=Object.keys(bound.files).length;
}
console.log(JSON.stringify({integrity:'pass',plannedCases:4,capturedCases:captured,viewportTraces:traces,recordedChecks:checks,passedChecks:passed,artifactHashes:hashes,scope:'Integrity validates preserved inputs/evidence, not that all UI assertions passed, all resources were cheaper or humans found the result usable.'},null,2));
