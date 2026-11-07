import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 4181);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.js': 'text/javascript' };

http.createServer(async (req, res) => {
  try {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const p = path.join(root, u === '/' ? 'index.html' : u);
    if (!p.startsWith(root)) { res.writeHead(403); res.end('forbidden'); return; }
    const data = await readFile(p);
    res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log('listening ' + port + ' root ' + root));
