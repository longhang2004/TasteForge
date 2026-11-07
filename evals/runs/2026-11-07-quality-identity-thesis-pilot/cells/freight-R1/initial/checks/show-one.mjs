import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const only = process.argv[3];
for (const key of ['violations', 'incomplete']) {
  for (const v of data[key]) {
    if (only && v.id !== only) continue;
    console.log('===', key, v.id, v.help);
    for (const n of v.nodes) {
      console.log(' target:', JSON.stringify(n.target));
      console.log(' html:', (n.html || '').slice(0, 300));
      console.log(' why:', (n.failureSummary || '').replace(/\n/g, ' | ').slice(0, 400));
    }
  }
}
