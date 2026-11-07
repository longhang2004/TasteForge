import fs from 'node:fs';
const f = process.argv[2];
const data = JSON.parse(fs.readFileSync(f, 'utf8'));
for (const key of ['violations', 'incomplete']) {
  console.log('===', key, data[key].length);
  for (const v of data[key]) {
    console.log('-', v.id, '|', v.impact, '|', v.help);
    for (const n of v.nodes) {
      console.log('   target:', JSON.stringify(n.target));
      console.log('   html:', (n.html || '').slice(0, 220));
      if (n.failureSummary) console.log('   why:', n.failureSummary.replace(/\n/g, ' | ').slice(0, 300));
    }
  }
}
