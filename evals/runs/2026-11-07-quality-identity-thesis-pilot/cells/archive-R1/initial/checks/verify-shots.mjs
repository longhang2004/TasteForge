// Structural check of the captured PNGs: dimensions + that they are not blank.
// Used because this model cannot view images, so visual judgment stays unassessed.
import { readFile, readdir } from 'node:fs/promises';
import zlib from 'node:zlib';

const dir = process.argv[2];
const files = (await readdir(dir)).filter((f) => f.endsWith('.png')).sort();
const rows = [];
for (const f of files) {
  const buf = await readFile(dir + '/' + f);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  // gather IDAT, inflate, count distinct byte values as a crude non-blank signal
  let off = 8, idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len));
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const distinct = new Set();
  for (let i = 0; i < raw.length; i += 97) distinct.add(raw[i]);
  rows.push({ file: f, width, height, bytes: buf.length, inflatedBytes: raw.length, sampledDistinctValues: distinct.size });
}
const expected = { 'w320': 320, 'w390': 390, 'w1440': 1440 };
const problems = [];
for (const r of rows) {
  const key = Object.keys(expected).find((k) => r.file.startsWith(k));
  if (!key) { problems.push(`${r.file}: unrecognised width prefix`); continue; }
  if (r.width !== expected[key]) problems.push(`${r.file}: width ${r.width} != ${expected[key]}`);
  if (r.height <= 0) problems.push(`${r.file}: zero height`);
  if (r.sampledDistinctValues < 5) problems.push(`${r.file}: looks blank (${r.sampledDistinctValues} distinct sampled values)`);
}
console.log(JSON.stringify({ dir, count: rows.length, problems, rows }, null, 2));
process.exit(problems.length ? 1 : 0);
