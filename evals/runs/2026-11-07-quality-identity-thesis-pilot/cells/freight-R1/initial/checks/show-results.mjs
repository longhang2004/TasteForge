import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
d.results.forEach((r, i) => {
  console.log(`${i + 1}. [${r.status}] ${r.name}${r.detail ? ' :: ' + r.detail.replace(/\s+/g, ' ').slice(0, 110) : ''}`);
});
console.log('---');
console.log('console errors:', d.consoleErrors.length, 'pageerrors:', d.pageErrors.length, 'failedRequests:', d.failedRequests.length);
console.log('external reqs:', JSON.stringify(d.staticFacts.externalReqs));
console.log('lang:', d.staticFacts.lang, '| title:', d.staticFacts.title);
console.log('consignments:', d.staticFacts.consignments.join(','));
console.log('decisions:', d.staticFacts.decisions.join(','));
console.log('textarea maxlength attr:', d.staticFacts.noteMaxLength);
