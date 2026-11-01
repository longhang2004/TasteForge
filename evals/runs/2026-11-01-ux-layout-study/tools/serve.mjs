import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const runRoot = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain' };
export async function serve() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let filename = path.resolve(runRoot, '.' + pathname);
      const relative = path.relative(runRoot, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Outside run');
      if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
      const bytes = await readFile(filename);
      response.writeHead(200, { 'content-type': types[path.extname(filename)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      response.end(bytes);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, baseURL: `http://127.0.0.1:${server.address().port}` };
}
