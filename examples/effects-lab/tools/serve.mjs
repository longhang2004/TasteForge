import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
export const root = fileURLToPath(new URL('..', import.meta.url));
const types = {
  'index.html': 'text/html',
  'styles.css': 'text/css',
  'app.mjs': 'text/javascript',
  'study.svg': 'image/svg+xml',
};
export async function serve(port = 0) {
  const server = createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!Object.hasOwn(types, name)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    try {
      const bytes = await readFile(path.join(root, name));
      response.writeHead(200, {
        'Content-Type': `${types[name]}; charset=utf-8`,
        'Cache-Control': 'no-store',
      });
      response.end(bytes);
    } catch {
      response.writeHead(500);
      response.end('Unable to read study');
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await serve(Number(process.argv[2] || 4174));
  console.log(`Effect studies: ${url}`);
}
