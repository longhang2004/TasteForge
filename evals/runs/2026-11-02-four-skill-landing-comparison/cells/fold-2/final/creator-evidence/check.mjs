import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/package.json');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const root=process.cwd(),out=path.join(root,'creator-evidence/attempt-01');
const report={started:new Date().toISOString(),checks:[],consoleErrors:[],pageErrors:[]};
let browser,server;
const record=async(page,name)=>{const value=await page.evaluate(()=>({width:innerWidth,scrollX,scrollY,activeElement:document.activeElement.id||document.activeElement.tagName,feedback:document.querySelector('#feedback').textContent,total:document.querySelector('#total').textContent,overflow:document.documentElement.scrollWidth>innerWidth}));report.checks.push({name,...value});return value};
try{
 server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root))throw Error('invalid path');const data=await fs.readFile(file);const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf'})[ext]||'application/octet-stream');res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
 page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});page.on('pageerror',e=>report.pageErrors.push(e.message));
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(url);await page.evaluate(()=>document.fonts.ready);await record(page,`initial-${width}`);await page.screenshot({path:path.join(out,`initial-${width}.png`),fullPage:true});if(width===390){const cta=await page.locator('.hero-action .cta').boundingBox();report.checks.push({name:'primary-action-first-screen-390',visible:cta.y+cta.height<=844,box:cta})}}
 await page.setViewportSize({width:390,height:844});await page.goto(url);await page.keyboard.press('Tab');report.checks.push({name:'keyboard-first-tab',focusedText:await page.locator(':focus').innerText()});await page.keyboard.press('Enter');await record(page,'skip-link-after-enter');
 await page.getByRole('link',{name:'Reserve a kit',exact:false}).first().click();await page.waitForTimeout(700);await record(page,'cta-after-action');
 await page.locator('#reserve').click();await record(page,'empty-email-invalid');
 await page.locator('#edition').selectOption('Ridge');await page.locator('#quantity').fill('3');await page.locator('#email').fill('mai@example.com');await page.locator('#reserve').click();await record(page,'ridge-three-invalid');
 report.checks.push({name:'night-disabled',disabled:await page.locator('#edition option[value=Night]').isDisabled()});
 await page.locator('#edition').selectOption('Harbor');await page.locator('#quantity').fill('2');await record(page,'harbor-two-cost');
 await page.locator('#reserve').click();await record(page,'first-valid-error');await page.screenshot({path:path.join(out,'error-390.png'),fullPage:false});
 report.checks.push({name:'failure-preserves-inputs',edition:await page.locator('#edition').inputValue(),quantity:await page.locator('#quantity').inputValue(),email:await page.locator('#email').inputValue()});
 await page.locator('#retry').click();await record(page,'retry-success');await page.screenshot({path:path.join(out,'success-390.png'),fullPage:false});
 const axe=await new AxeBuilder({page}).analyze();await fs.writeFile(path.join(out,'axe-success-390.json'),JSON.stringify(axe,null,2));report.checks.push({name:'axe-success-390',violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 await page.locator('#quantity').fill('1');await record(page,'change-clears-success');
 await page.setViewportSize({width:1440,height:1000});await page.goto(url);const axeDesktop=await new AxeBuilder({page}).analyze();await fs.writeFile(path.join(out,'axe-initial-1440.json'),JSON.stringify(axeDesktop,null,2));report.checks.push({name:'axe-initial-1440',violations:axeDesktop.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const reducedPage=await reduced.newPage();await reducedPage.goto(url);report.checks.push({name:'reduced-motion',styles:await reducedPage.locator('.tagline-word').first().evaluate(el=>({opacity:getComputedStyle(el).opacity,transition:getComputedStyle(el).transitionDuration,scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior}))});await reduced.close();
}catch(error){report.rawFailure={name:error.name,message:error.message,stack:error.stack};process.exitCode=1}
finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));report.ended=new Date().toISOString();await fs.writeFile(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))}
