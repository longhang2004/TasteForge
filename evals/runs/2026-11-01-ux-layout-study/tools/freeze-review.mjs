import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {runRoot} from './serve.mjs';
const [reviewer,stage]=process.argv.slice(2);
assert(['r1','r2'].includes(reviewer));assert(['neutral','authored'].includes(stage));
const file=`reviews/reviewer-${reviewer}.${stage}.json`;
const bytes=await readFile(path.join(runRoot,file));const data=JSON.parse(bytes);
assert.equal(data.stage,stage);assert.equal(data.views.length,12);
assert.deepEqual(data.views.map(v=>v.view).sort(),Array.from({length:12},(_,i)=>`view-${String(i+1).padStart(2,'0')}`));
for(const view of data.views){
 if(stage==='neutral')for(const dimension of ['entryPriority','decisionContext','narrowContext','recoveryFlow','compositionPurpose']){
  assert(view.scores[dimension]===null||(Number.isInteger(view.scores[dimension])&&view.scores[dimension]>=1&&view.scores[dimension]<=5));
  assert.equal(typeof view.evidence[dimension],'string');assert(view.evidence[dimension].length>10);
 }else{assert(['helps','hurts','mixed','little-change'].includes(view.effect));assert.equal(typeof view.evidence,'string');}
}
const manifestFile=path.join(runRoot,'manifest.json');const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
manifest.reviewStages??={};manifest.reviewStages[reviewer]??={};
const hash=createHash('sha256').update(bytes).digest('hex');
if(manifest.reviewStages[reviewer][stage])assert.equal(manifest.reviewStages[reviewer][stage].sha256,hash,'Review changed after freeze');
manifest.reviewStages[reviewer][stage]??={file,sha256:hash,observedAtUtc:new Date().toISOString()};
await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');console.log(`Frozen ${reviewer} ${stage}: 12 valid views, SHA-256 ${hash}`);
