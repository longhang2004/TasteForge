import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('..', import.meta.url));
const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/prototype.html', ['prototype.html', 'text/html']],
  ['/app.mjs', ['app.mjs', 'text/javascript']],
  ['/prototype.mjs', ['prototype.mjs', 'text/javascript']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/fixture.json', ['fixture.json', 'application/json']],
]);
export async function serve(port = 0) {
  const server = createServer(async (request, response) => {
    const entry = files.get(new URL(request.url, 'http://localhost').pathname);
    if (!entry) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    try {
      response.writeHead(200, {
        'Content-Type': `${entry[1]}; charset=utf-8`,
        'Cache-Control': 'no-store',
      });
      response.end(await readFile(path.join(root, entry[0])));
    } catch {
      response.writeHead(500);
      response.end('Unable to read example');
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await serve(Number(process.argv[2] || 4173));
  console.log(`Inventory example: ${url}`);
}
