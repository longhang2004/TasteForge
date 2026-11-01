import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { root, resolveEvidence } from './evidence.mjs';
const data = JSON.parse(await readFile(path.join(root, 'cases.json'), 'utf8'));
const files = new Map([
  ['/', [path.join(root, 'index.html'), 'text/html']],
  ...Object.entries({
    'app.mjs': 'text/javascript',
    'styles.css': 'text/css',
    'cases.json': 'application/json',
    'README.md': 'text/plain',
  }).map(([file, type]) => [`/${file}`, [path.join(root, file), type]]),
]);
for (const entry of data.cases)
  for (const capture of entry.captures) {
    files.set(`/captures/${entry.id}/${capture.id}.png`, [
      resolveEvidence(capture.file),
      'image/png',
    ]);
    files.set(`/traces/${capture.trace.split('/').at(-2)}.json`, [
      resolveEvidence(capture.trace),
      'application/json',
    ]);
  }
export async function serve(port = 0) {
  const server = createServer(async (request, response) => {
    const entry = files.get(new URL(request.url, 'http://localhost').pathname);
    if (!entry) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    try {
      const bytes = await readFile(entry[0]);
      response.writeHead(200, {
        'Content-Type': `${entry[1]}; charset=utf-8`,
        'Cache-Control': 'no-store',
      });
      response.end(bytes);
    } catch {
      response.writeHead(500);
      response.end('Unable to read gallery asset');
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await serve(Number(process.argv[2] || 4175));
  console.log(`Design gallery: ${url}`);
}
