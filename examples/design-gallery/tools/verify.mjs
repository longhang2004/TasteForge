import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inspect, root } from './evidence.mjs';
const data = JSON.parse(await readFile(path.join(root, 'cases.json'), 'utf8'));
const ids = new Set();
let count = 0;
for (const entry of data.cases) {
  assert(!ids.has(entry.id));
  ids.add(entry.id);
  assert(['repair', 'alternatives'].includes(entry.kind));
  assert.equal(entry.captures.length, 2);
  for (const capture of entry.captures) {
    assert.deepEqual(await inspect(capture), capture.observed, `Evidence changed: ${capture.file}`);
    count += 1;
  }
}
console.log(
  `${data.cases.length} cases / ${count} original captures verified against hashes, trace scope and annotation bounds.`,
);
