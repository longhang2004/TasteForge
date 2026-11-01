import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { runRoot, serve } from './serve.mjs';
const id = process.argv[2];
if (!/^u\d{2}$/.test(id ?? '')) throw new Error('Supply your assigned case ID');
const { server, baseURL } = await serve();
const browser = await chromium.launch({ headless: true });
try {
  const output = path.join(runRoot, 'cases', id, 'evidence/self-review');
  await mkdir(output, { recursive: true });
  for (const [name, width, height] of [['desktop',1440,1000],['mobile',390,844]]) {
    const page = await browser.newPage({ viewport:{width,height}, deviceScaleFactor:1, locale:'en-US', timezoneId:'Asia/Ho_Chi_Minh', colorScheme:'light', reducedMotion:'reduce' });
    await page.route('**/*', (r) => r.request().url().startsWith(baseURL+'/') ? r.continue() : r.abort());
    await page.goto(`${baseURL}/cases/${id}/`, {waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const filename=path.join(output,`${name}.png`);
    await page.screenshot({path:filename,fullPage:true,animations:'disabled'});
    console.log(filename);
    await page.close();
  }
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
