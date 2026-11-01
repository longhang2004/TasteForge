import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspect, root } from './evidence.mjs';
const file = path.join(root, 'cases.json');
const data = JSON.parse(await readFile(file, 'utf8'));
for (const entry of data.cases)
  for (const capture of entry.captures) capture.observed = await inspect(capture);
await writeFile(file, JSON.stringify(data, null, 2) + '\n');
console.log('Recorded image/trace hashes, dimensions and scope; source captures were not changed.');
