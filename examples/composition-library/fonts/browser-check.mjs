// Optional browser evidence helper; uses the repository's existing Playwright install.
// Run in Ubuntu WSL. Override PLAYWRIGHT_MODULE with an installed module URL/path.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ??
    new URL('../../inventory-workbench/tools/node_modules/playwright/index.mjs', import.meta.url)
      .href
);
const manifest = JSON.parse(await readFile(path.join(root, 'specimens.json'), 'utf8'));
const server = createServer(async (request, response) => {
  try {
    const local = path.resolve(
      root,
      `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`,
    );
    if (!local.startsWith(`${root}${path.sep}`)) throw new Error('Outside font directory');
    response.setHeader('Content-Type', local.endsWith('.ttf') ? 'font/ttf' : 'application/json');
    response.end(await readFile(local));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const requests = [];
try {
  const page = await browser.newPage();
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (!url.startsWith(`${origin}/`)) throw new Error(`Unexpected nonlocal request: ${url}`);
    requests.push(new URL(url).pathname);
    await route.continue();
  });
  await page.goto(`${origin}/specimens.json`);
  await page.setContent(
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>Font mapping samples</title><style>*{box-sizing:border-box}body{margin:24px;background:#fff;color:#111}h1{font:600 24px system-ui}h2{font:600 18px system-ui;margin-top:32px}p{font-size:24px;line-height:1.7;overflow-wrap:anywhere;margin:12px 0}small{font:14px system-ui}article{border-top:1px solid #888}</style><h1>Local font loading and glyph samples</h1><small>English, precomposed Vietnamese and decomposed Vietnamese; regular 400. Figtree Vietnamese is a negative control.</small><main></main></html>',
  );
  const loaded = await page.evaluate(
    async ({ manifest, origin }) => {
      const results = [];
      for (const specimen of manifest.specimens) {
        const family = `Gallery-${specimen.id}`;
        const face = new FontFace(family, `url("${origin}/${encodeURI(specimen.file)}")`, {
          weight: specimen.weight,
          style: specimen.style,
        });
        await face.load();
        document.fonts.add(face);
        const article = document.createElement('article');
        const heading = document.createElement('h2');
        heading.textContent = specimen.family;
        article.append(heading);
        for (const [language, text] of Object.entries(manifest.coverageSamples)) {
          const label = document.createElement('small');
          label.textContent = language;
          const sample = document.createElement('p');
          sample.id = `${specimen.id}-${language}`;
          sample.lang = language.startsWith('vi') ? 'vi' : 'en';
          sample.style.fontFamily = `"${family}", serif`;
          sample.style.fontWeight = '400';
          sample.textContent = text;
          article.append(label, sample);
        }
        document.querySelector('main').append(article);
        results.push({
          id: specimen.id,
          status: face.status,
          fontFaceCheck: document.fonts.check(`400 24px "${family}"`),
        });
      }
      await document.fonts.ready;
      return results;
    },
    { manifest, origin },
  );
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const documentNode = await cdp.send('DOM.getDocument');
  const renderMappings = [];
  for (const specimen of manifest.specimens) {
    for (const language of Object.keys(manifest.coverageSamples)) {
      const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: documentNode.root.nodeId,
        selector: `#${specimen.id}-${language}`,
      });
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      renderMappings.push({ id: specimen.id, language, fonts });
    }
  }
  const viewports = [];
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    viewports.push({ width, scrollWidth });
    if (scrollWidth > width) throw new Error(`Font sample overflow at ${width}`);
    await page.screenshot({ path: path.join(root, `browser-${width}.png`), fullPage: true });
  }
  if (loaded.some((item) => item.status !== 'loaded' || !item.fontFaceCheck))
    throw new Error('Font loading failed');
  const unexpectedFallback = renderMappings.filter((mapping) => {
    const specimen = manifest.specimens.find((item) => item.id === mapping.id);
    return (
      specimen.languages.includes(mapping.language) &&
      (!mapping.fonts.length || mapping.fonts.some((font) => !font.isCustomFont))
    );
  });
  const report = {
    browser: await browser.version(),
    scope:
      'Actual Chromium FontFace load and CDP per-node platform font mappings at regular 400; local-only requests.',
    limitations:
      'Single Chromium/Linux host; glyph counts reflect shaping and may compose NFD input. No proof of full scripts, all weights, other engines/OS, or visual quality.',
    loaded,
    renderMappings,
    viewports,
    requests,
    unexpectedFallback,
  };
  await writeFile(path.join(root, 'browser-check.json'), `${JSON.stringify(report, null, 2)}\n`);
  if (unexpectedFallback.length)
    throw new Error('Declared language sample used fallback; inspect browser-check.json');
  console.log(JSON.stringify({ loaded, viewports, requests: requests.length }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
