import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('..', import.meta.url));
const evidenceRoot = path.resolve(root, '../inventory-workbench/evidence');
export function resolveEvidence(file) {
  const resolved = path.resolve(root, file);
  assert(
    resolved.startsWith(evidenceRoot + path.sep),
    'Evidence path must stay in the inventory evidence directory',
  );
  return resolved;
}
export async function inspect(capture) {
  const image = await readFile(resolveEvidence(capture.file));
  const trace = await readFile(resolveEvidence(capture.trace));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  const report = JSON.parse(trace.toString());
  const observation = report[capture.collection].find((entry) => entry.id === capture.traceId)
    ?.states[capture.state]?.geometry;
  assert(observation, 'Named trace/state must exist');
  const expected =
    capture.scope === 'viewport'
      ? observation.viewport
      : { width: observation.width, height: observation.height };
  assert.equal(width, expected.width, 'Capture width disagrees with its scope/trace');
  assert.equal(height, expected.height, 'Capture height disagrees with its scope/trace');
  const region = capture.region;
  assert(region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0);
  assert(
    region.x + region.width <= width && region.y + region.height <= height,
    'Authored region leaves the image',
  );
  return {
    width,
    height,
    sha256: createHash('sha256').update(image).digest('hex'),
    traceSha256: createHash('sha256').update(trace).digest('hex'),
    viewport: observation.viewport,
    scrollY: observation.scrollY,
  };
}
