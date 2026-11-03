import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { runRoot } from './serve.mjs';

export async function selectedEvidence(id, requireSelected = false) {
  let selection = null;
  try { selection = JSON.parse(await readFile(path.join(runRoot, 'evidence/selection.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const row = selection?.cases?.[id];
  if (requireSelected && !row?.selected) throw new Error(`${id}: explicit final evidence selection is required`);
  const filename = row?.selected ?? `evidence/${id}/browser.json`;
  const resolved = path.resolve(runRoot, filename);
  const relative = path.relative(runRoot, resolved);
  if (!filename.startsWith('evidence/') || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Invalid selected evidence path');
  let browser = null;
  try { browser = JSON.parse(await readFile(resolved, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (browser && browser.caseId !== id) throw new Error(`${id}: selected trace belongs to another case`);
  return { browser, filename, imageDirectory: path.posix.dirname(filename), selected: Boolean(row?.selected), initial: row?.initial ?? `evidence/${id}/browser.json`, reason: row?.reason ?? null };
}
