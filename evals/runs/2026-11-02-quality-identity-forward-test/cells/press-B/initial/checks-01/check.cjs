const fs=require('fs'),path=require('path');
const {chromium}=require(process.cwd()+'/examples/inventory-workbench/tools/node_modules/playwright');
const {AxeBuilder}=require(process.cwd()+'/examples/inventory-workbench/tools/node_modules/@axe-core/playwright');
const out=path.resolve('evals/runs/2026-11-02-quality-identity-forward-test/cells/press-B/initial');
(async()=>{const browser=await chromium.launch({headless:true});const report={started:new Date().toISOString(),checks:[],failures:[],axe:[],errors:[]};for(const width of [320,390,1440]){const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));const check=async(name,fn)=>{try{await fn();report.checks.push({width,name,pass:true})}catch(e){report.failures.push({width,name,error:String(e)})}};await page.goto('file://'+out+'/index.html');
const screen=async(state)=>{await page.screenshot({path:out+'/checks-01/'+width+'-'+state+'.png',fullPage:true});const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,focus:document.activeElement?.id}));if(geometry.scroll>geometry.width)report.failures.push({width,state,horizontalOverflow:geometry});const axe=await new AxeBuilder({page}).analyze();report.axe.push({width,state,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:axe.incomplete.map(v=>v.id)});};
await screen('choose');
await check('full slot disabled',async()=>{if(!await page.locator('input[value="11:00"]').isDisabled())throw Error('Full slot enabled')});
await page.locator('input[value="14:00"]').check();await page.selectOption('#date','2026-11-11');
await check('date change clears selection',async()=>{if(await page.locator('input[name=session]:checked').count())throw Error('Stale selection')});
await page.locator('input[value="14:00"]').check();await page.fill('#participants','2.5');
await check('fraction rejected',async()=>{if(await page.locator('#participants').evaluate(e=>e.checkValidity()))throw Error('Fraction valid')});
await page.fill('#participants','3');await page.check('#induction');await page.getByRole('button',{name:'Review session'}).click();
await check('review details',async()=>{const s=await page.locator('#review-details').innerText();for(const v of ['Wednesday, 11 November 2026','14:00–15:30 ICT','3','USD 18'])if(!s.includes(v))throw Error('Missing '+v)});
await screen('review');
await page.getByRole('button',{name:'Edit session'}).click();
await check('edit retains all choices',async()=>{if(await page.inputValue('#date')!=='2026-11-11'||await page.inputValue('#participants')!=='3'||!await page.isChecked('#induction')||!await page.isChecked('input[value="14:00"]'))throw Error('Draft changed')});
await page.getByRole('button',{name:'Review session'}).click();await page.getByRole('button',{name:'Confirm reservation'}).click();
await check('first confirm fails with focused recovery',async()=>{if(!await page.isVisible('#failure')||await page.evaluate(()=>document.activeElement.id)!=='failure')throw Error('Failure feedback not focused');if(!await page.isVisible('#review'))throw Error('Review lost')});await screen('error');
await page.getByRole('button',{name:'Retry reservation'}).click();
await check('retry succeeds with same choices and demo disclosure',async()=>{if(!await page.isVisible('#success'))throw Error('No success');const s=await page.locator('#success').innerText();for(const v of ['MP-261111-1400','Wednesday, 11 November 2026','14:00–15:30 ICT','USD 18','No real booking or payment occurred.'])if(!s.includes(v))throw Error('Missing '+v)});await screen('success');await context.close()}
report.ended=new Date().toISOString();fs.writeFileSync(out+'/checks-01/raw-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();if(report.failures.length||report.errors.length||report.axe.some(a=>a.violations.length))process.exitCode=1})().catch(e=>{console.error(e);process.exit(2)});

