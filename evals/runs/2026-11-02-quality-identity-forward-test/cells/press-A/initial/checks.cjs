const fs = require('fs');
const path = require('path');
const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
const root = __dirname;
const out = path.join(root, 'checks-final');
fs.mkdirSync(out, {recursive:true});
const findings = {started:new Date().toISOString(), widths:[], consoleErrors:[], failures:[]};
const assert = (value,message) => {if(!value) throw new Error(message);};
(async()=>{
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
 for (const width of [320,390,1440]) {
  const context = await browser.newContext({viewport:{width,height:900}});
  const page = await context.newPage();
  page.on('pageerror', e=>findings.consoleErrors.push(String(e)));
  await page.goto('file://'+path.join(root,'index.html'));
  const result = {width,states:[],behavior:[]}; findings.widths.push(result);
  async function checkpoint(state) {
   const measure=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,scrollY,focus:document.activeElement.id||document.activeElement.name||document.activeElement.tagName,focusRect:{top:document.activeElement.getBoundingClientRect().top,bottom:document.activeElement.getBoundingClientRect().bottom},buttons:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.trim(),width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}));
   assert(measure.documentWidth<=width,'Horizontal overflow '+state+' '+width);
   measure.buttons.forEach(b=>assert(b.left>=0&&b.right<=width,'Unreachable button '+b.text));
   result.states.push({state,...measure});
   await page.screenshot({path:path.join(out,`${width}-${state}.png`),fullPage:true});
   await page.screenshot({path:path.join(out,`${width}-${state}-viewport.png`)});
  }
  await checkpoint('choose');
  assert(await page.locator('input[name="session"]:disabled').count()===1,'Expected one full slot');
  await page.locator('input[name="session"]').first().check();
  await page.locator('input[name="date"][value="2026-11-11"]').check();
  assert(await page.locator('input[name="session"]:checked').count()===0,'Date change retained a selected session');
  assert(await page.locator('input[name="session"]:disabled').count()===0,'Wednesday includes a full slot');
  await page.locator('input[name="session"]').last().check();
  for(const v of ['0','1.5','4']) { await page.locator('#participants').fill(v);assert(!await page.locator('#participants').evaluate(e=>e.checkValidity()),'Invalid participants accepted '+v); }
  await page.locator('#participants').fill('3');
  assert(!await page.locator('#booking-form').evaluate(e=>e.checkValidity()),'Missing induction accepted');
  await page.locator('#induction').check();
  await page.getByRole('button',{name:'Review session'}).click();
  assert(await page.locator('#review').isVisible(),'Review missing');
  assert((await page.locator('#review-data').textContent()).includes('Wednesday 11 November 2026'),'Wrong date');
  assert((await page.locator('#review-data').textContent()).includes('14:00–15:30'),'Wrong time');
  assert((await page.locator('#review-data').textContent()).includes('3 participants'),'Wrong participant count');
  await checkpoint('review');
  await page.getByRole('button',{name:'Edit session'}).click();
  assert(await page.locator('#participants').inputValue()==='3','Participant draft lost');
  assert(await page.locator('#induction').isChecked(),'Induction draft lost');
  assert(await page.locator('input[name="session"]:checked').inputValue()==='14:00–15:30','Session draft lost');
  await page.getByRole('button',{name:'Review session'}).click();
  await page.getByRole('button',{name:'Confirm reservation'}).click();
  assert(await page.locator('#reservation-error').isVisible(),'First confirmation did not fail');
  assert(await page.locator('#reservation-error').evaluate(e=>e===document.activeElement),'Error did not receive focus');
  await checkpoint('failure');
  const errorRect=await page.locator('#reservation-error').boundingBox();
  assert(errorRect.y>=0&&errorRect.y+errorRect.height<=900,'Focused error not fully in viewport');
  await page.keyboard.press('Tab');
  assert(await page.locator('#edit').evaluate(e=>e===document.activeElement),'Keyboard recovery edit action inaccessible');
  await page.keyboard.press('Tab');
  assert(await page.locator('#confirm').evaluate(e=>e===document.activeElement),'Keyboard retry action inaccessible');
  try {
   const AxeBuilder=require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/@axe-core/playwright').default;
   const a=await new AxeBuilder({page}).analyze();
   result.axe={violations:a.violations,incomplete:a.incomplete,passes:a.passes.length};
  }catch(e){result.axe={unassessed:String(e)};}
  await page.getByRole('button',{name:'Try reservation again'}).click();
  assert(await page.locator('#success').isVisible(),'Retry did not succeed');
  assert((await page.locator('#success-data').textContent()).includes('3 participants'),'Retry changed choices');
  assert((await page.locator('#success').textContent()).includes('No real booking or payment occurred.'),'Outcome disclaimer missing');
  assert(await page.locator('#reservation-id').textContent()==='MPR-DEMO-1111-1400','Reservation id wrong');
  await checkpoint('success');
  result.behavior=['full slot disabled','date change clears session','whole number range validated','induction required','review shows chosen facts','edit retains draft','first confirm fails and focuses recovery','retry succeeds with same choices','reservation identified and demo outcome stated'];
  await context.close();
 }
 await browser.close();
 findings.ended=new Date().toISOString();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(findings,null,2));
 console.log(JSON.stringify({widths:findings.widths.map(r=>({width:r.width,states:r.states.map(s=>s.state),axeViolations:r.axe?.violations?.map(v=>v.id),axeIncomplete:r.axe?.incomplete?.map(v=>v.id),axeUnassessed:r.axe?.unassessed,behavior:r.behavior})),consoleErrors:findings.consoleErrors},null,2));
})().catch(e=>{findings.failures.push(e.stack);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(findings,null,2));console.error(e.stack);process.exitCode=1;});
