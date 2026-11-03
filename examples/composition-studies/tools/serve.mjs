import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const repository = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
export const root = path.join(repository, 'examples/composition-studies');
const types = {
  '.html': 'text/html',
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/plain',
  '.txt': 'text/plain',
};
export async function serve(port = 0) {
  const server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/') pathname = '/examples/composition-studies/index.html';
      const parts = pathname.split('/').filter(Boolean);
      if (parts.some((part) => part.startsWith('.') || part === 'node_modules'))
        throw Error('Path');
      let file = path.resolve(repository, ...parts);
      if (!file.startsWith(repository + path.sep)) throw Error('Path');
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const type = types[path.extname(file)];
      if (!type) throw Error('Type');
      const bytes = await readFile(file);
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      response.end(bytes);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await serve(Number(process.argv[2] || 4180));
  console.log(`Composition studies: ${url}/examples/composition-studies/`);
}
