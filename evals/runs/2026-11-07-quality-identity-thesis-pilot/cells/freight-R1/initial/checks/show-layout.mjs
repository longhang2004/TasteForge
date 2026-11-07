import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (const k of Object.keys(d)) {
  const v = d[k];
  if (v.clipped) v.clipped = v.clipped.filter((c) => c.cls !== 'sr-only');
  console.log(k, JSON.stringify(v));
}
