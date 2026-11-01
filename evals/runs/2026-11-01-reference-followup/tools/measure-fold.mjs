import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serve as serveNew, runRoot } from './serve.mjs';
import { serve as serveOriginal } from '../../2026-11-01-ui-pilot/tools/serve.mjs';

const original = await serveOriginal();
const followup = await serveNew();
const browser = await chromium.launch({ headless: true });
const result = { method: 'Initial unscrolled viewport, same browser/context settings; positions are descriptive and do not establish task ease or UX quality.', observations: [] };
try {
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    for (const [name, url] of [['original-c02', original.baseURL+'/cases/c02/'],['followup-r01',followup.baseURL+'/cases/r01/']]) {
      const page = await browser.newPage({ viewport, locale:'en-US', timezoneId:'Asia/Ho_Chi_Minh', colorScheme:'light', reducedMotion:'reduce' });
      await page.goto(url, {waitUntil:'networkidle'});
      const controls = {};
      for (const id of ['recipient','amount','review-transfer']) {
        const box = await page.getByTestId(id).boundingBox();
        controls[id] = { ...box, fullyInInitialViewport: box ? box.y >= 0 && box.y+box.height <= viewport.height : false };
      }
      result.observations.push({case:name,viewport,controls,initialScrollY:await page.evaluate(()=>scrollY)});
      await page.close();
    }
  }
  await writeFile(path.join(runRoot,'evidence/fold-observations.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally {
  await browser.close();
  await Promise.all([new Promise(r=>original.server.close(r)),new Promise(r=>followup.server.close(r))]);
}
