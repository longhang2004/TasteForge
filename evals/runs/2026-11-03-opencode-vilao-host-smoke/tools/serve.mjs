import { serve, root } from './browser.mjs';
const { url } = await serve();
console.log(`TasteForge Vilao host smoke: ${url}/index.html\nRoot: ${root}`);
