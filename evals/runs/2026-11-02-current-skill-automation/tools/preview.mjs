import { chromium } from 'playwright';
import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runRoot, serve } from './serve.mjs';

const id = process.argv[2];
if (!/^c\d{2}$/.test(id ?? '')) throw new Error('Supply your assigned case ID');
const output = path.join(runRoot, 'cases', id, 'evidence/self-review');
await mkdir(output, { recursive: true });
try {
  await access(path.join(output, 'preview.json'));
  throw new Error('Single preview already recorded; preserve original evidence');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const { server, baseURL } = await serve();
const browser = await chromium.launch({ headless: true });
const record = { caseId: id, startedAtUtc: new Date().toISOString(), browser: browser.version(), viewports: [] };
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh', colorScheme: 'light', reducedMotion: 'reduce' });
    await page.route('**/*', route => route.request().url().startsWith(baseURL + '/') ? route.continue() : route.abort());
    await page.goto(`${baseURL}/cases/${id}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const [scope, fullPage] of [['viewport', false], ['full', true]]) {
      const filename = `${name}-${scope}.png`;
      await page.screenshot({ path: path.join(output, filename), fullPage, animations: 'disabled' });
      console.log(path.join(output, filename));
    }
    record.viewports.push({ name, width, height });
    await page.close();
  }
  record.completedAtUtc = new Date().toISOString();
} finally {
  await writeFile(path.join(output, 'preview.json'), JSON.stringify(record, null, 2) + '\n');
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
