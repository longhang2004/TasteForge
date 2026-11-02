import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runCell } from './browser.mjs';

const result = await runCell('press-B', process.argv[2] || 'initial', process.argv[3] || 'initial-01', async ({page, capture, check}) => {
  await check('full session cannot be reserved', async () => assert.equal(await page.locator('input[name=session]:disabled').count(), 1));
  const first=page.locator('input[name=session]').first();
  await first.focus(); await page.keyboard.press('Space');
  await page.locator('#date').selectOption('2026-11-11');
  await check('date change clears stale selected slot', async () => assert.equal(await page.locator('input[name=session]:checked').count(),0));
  await page.locator('input[name=session]').last().check();
  for(const value of ['0','1.5','4']) {
    await page.locator('#participants').fill(value);
    await page.getByRole('button',{name:'Review session'}).click();
    await check(`invalid participants ${value} blocked`,async()=>{
      assert.equal(await page.locator('#participants').evaluate(e=>e.checkValidity()),false);
      assert(await page.locator('#choose').isVisible());
    });
  }
  await capture('invalid');
  await page.locator('#participants').fill('3');
  await page.getByRole('button',{name:'Review session'}).click();
  await check('induction required before review',async()=>assert(await page.locator('#choose').isVisible()));
  await page.locator('#induction').check();
  await page.getByRole('button',{name:'Review session'}).click();
  await check('review has chosen facts fee exclusions and time zone',async()=>{
    const text=(await page.locator('#review').innerText()).replaceAll(',','');
    for(const fact of ['Wednesday 11 November 2026','14:00–15:30','USD 18','Paper and ink are not included','ICT'])assert(text.includes(fact),fact);
    assert.equal(await page.locator('#review-details').evaluate(e=>[...e.querySelectorAll('div')].find(r=>r.querySelector('dt')?.textContent==='Participants')?.querySelector('dd')?.textContent),'3');
  });
  await capture('review');
  await page.getByRole('button',{name:'Edit session'}).click();
  await check('edit retains participants slot and induction',async()=>{
    assert.equal(await page.locator('#participants').inputValue(),'3');
    assert(await page.locator('#induction').isChecked());
    assert.equal(await page.locator('input[name=session]:checked').inputValue(),'14:00');
  });
  await capture('edit');
  await page.getByRole('button',{name:'Review session'}).click();
  await page.getByRole('button',{name:'Confirm reservation'}).click();
  await check('first confirm fails and focuses recovery',async()=>{
    assert(await page.locator('#failure').isVisible());
    assert(await page.locator('#failure').evaluate(e=>e===document.activeElement));
  });
  await capture('failure');
  await page.keyboard.press('Tab');
  await check('keyboard reaches retry',async()=>assert.equal(await page.evaluate(()=>document.activeElement.id),'confirm'));
  await page.keyboard.press('Enter');
  await check('retry succeeds with retained facts and honest outcome',async()=>{
    const text=await page.locator('#success').innerText();
    for(const fact of ['14:00–15:30','USD 18'])assert(text.includes(fact),fact);
    assert.match(text,/No real booking or payment/i);
    assert.equal(await page.locator('#success-details').evaluate(e=>[...e.querySelectorAll('div')].find(r=>r.querySelector('dt')?.textContent==='Participants')?.querySelector('dd')?.textContent),'3');
  });
  await capture('success');
},fileURLToPath(import.meta.url));
if(result.failures.length)process.exitCode=1;
