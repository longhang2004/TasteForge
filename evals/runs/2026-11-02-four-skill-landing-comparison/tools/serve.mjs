import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const runRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.md':'text/plain','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.woff2':'font/woff2'};
export async function serve(port=0){
  const server=createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://localhost');
      const parts=decodeURIComponent(url.pathname).split('/').filter(Boolean);
      if(parts.some(p=>p.startsWith('.')||p==='node_modules'))throw Error('Path');
      let file=path.resolve(runRoot,...parts);
      if(file!==runRoot&&!file.startsWith(runRoot+path.sep))throw Error('Path');
      if((await stat(file)).isDirectory())file=path.join(file,'index.html');
      const type=types[path.extname(file)];if(!type)throw Error('Type');
      const bytes=await readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(bytes);
    }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  return {server,url:`http://127.0.0.1:${server.address().port}`};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const {url}=await serve(Number(process.argv[2]||4182));console.log(`Four-skill gallery: ${url}`);}
