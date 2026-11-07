import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = process.argv[2];
const files = [];
async function walk(d, rel = '') {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) await walk(p, path.join(rel, e.name));
    else files.push(path.join(rel, e.name));
  }
}
await walk(root);
files.sort();

const sha = async (f) => createHash('sha256').update(await readFile(path.join(root, f))).digest('hex');

const record = JSON.parse(await readFile(path.join(root, 'creator-record.json'), 'utf8'));
const html = await readFile(path.join(root, 'index.html'), 'utf8');

const idx = await sha('index.html');
const v00 = await sha('versions/00.html');
const v01 = await sha('versions/01.html');

const problems = [];
if (idx !== v01) problems.push('index.html not byte-identical to versions/01.html');
if (record.submitted_sha256 !== idx) problems.push('record submitted_sha256 mismatch');
if (record.versions[0].sha256 !== v00) problems.push('record v00 sha mismatch');
if (record.versions[1].sha256 !== v01) problems.push('record v01 sha mismatch');
if (v00 === v01) problems.push('v00 and v01 identical — correction not actually applied');

for (const pat of [/\bhttps?:\/\//i, /<link\b/i, /<img\b/i, /@import/i, /url\(/i, /src=/i]) {
  if (pat.test(html)) problems.push('external/asset reference matched: ' + pat);
}
if (!/<style>/i.test(html) || !/<script>/i.test(html)) problems.push('inline style/script missing');

// fact presence in submitted source
const facts = [
  ['LS-02', 'Coastal erosion survey, figure 4', 'Emulsion lifting at one corner; not assessed further'],
  ['LS-07', 'Kiln stacking diagram', 'Two edge chips; image area intact'],
  ['LS-11', 'River weir cross-section — revised plate', 'Clean; revised plate replaces an earlier figure'],
  ['LS-14', 'Dyeworks colour wheel', 'Fading across the yellow sector'],
  ['LS-19', 'Coastal erosion survey, figure 4 — duplicate', 'Duplicate of LS-02; second copy, not a different photograph'],
];
for (const [id, title, cond] of facts) {
  if (!html.includes(id)) problems.push('missing id ' + id);
  if (!html.includes(title)) problems.push('missing title ' + title);
  if (!html.includes(cond)) problems.push('missing condition for ' + id);
}
for (const s of ['Field Surveys', 'Craft Teaching', 'Hand-tinted glass', 'Black-and-white glass',
  '8.3 × 8.3 cm', '10 × 8.3 cm', '8.3 × 10 cm', 'undated', '1924', '1931', '1936']) {
  if (!html.includes(s)) problems.push('missing provided value: ' + s);
}
// prohibitions: invented provenance words
for (const bad of ['photographer', 'copyright', 'licensed under', 'public domain', 'institution', 'museum', 'archive holds']) {
  if (new RegExp(bad, 'i').test(html)) problems.push('possibly invented provenance term: ' + bad);
}

console.log(JSON.stringify({
  checkedAtUtc: new Date().toISOString(),
  fileCount: files.length,
  files,
  hashes: { index: idx, v00, v01 },
  indexEqualsV01: idx === v01,
  recordShaMatches: record.submitted_sha256 === idx,
  problems,
}, null, 2));
process.exit(problems.length ? 1 : 0);
