const NM = 'file:///mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/';
const pw = await import(NM + 'playwright/index.js');
console.log('playwright keys:', Object.keys(pw));
console.log('default keys:', pw.default ? Object.keys(pw.default) : 'no default');
const axe = await import(NM + '@axe-core/playwright/dist/index.js');
console.log('axe keys:', Object.keys(axe));
try {
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  console.log('chromium type:', typeof chromium);
  console.log('exe:', chromium && chromium.executablePath && chromium.executablePath());
} catch (e) { console.log('ERR', e.message); }
