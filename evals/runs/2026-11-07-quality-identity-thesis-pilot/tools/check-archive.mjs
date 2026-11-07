import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runCell } from './browser.mjs';
import {
  ARCHIVE,
  buttonNamed,
  collectVisible,
  normalize,
  overflow,
  poll,
  pressControl,
  selectableForId,
  visibleText,
  waitForText,
} from './driver.mjs';

// Matched acceptance for the Lantern Slide Lecture Archive slice.
//
// Assertions encode the prompt's supplied records and required behaviour, and use
// accessibility roles/labels so both conditions face the same facts. Actions are
// followed by a bounded wait for the app to settle: sampling an intermediate
// render frame would misreport a working page. No creator file is edited here.
const FIELD_SURVEYS = ['LS-02', 'LS-11', 'LS-19'];
const CRAFT_TEACHING = ['LS-07', 'LS-14'];

async function searchField(page) {
  const field = await poll(
    async () => {
      for (const locator of [
        page.getByRole('searchbox'),
        page.locator('input[type="search"]'),
        page.getByLabel(/search/i),
        page.locator('input[type="text"]'),
      ]) {
        const count = await locator.count();
        for (let i = 0; i < count; i += 1) {
          const candidate = locator.nth(i);
          if (await candidate.isVisible().catch(() => false)) return candidate;
        }
      }
      return null;
    },
    { what: 'search field' },
  );
  await field.scrollIntoViewIfNeeded().catch(() => {});
  return field;
}

async function openRecord(page, id) {
  const control = await selectableForId(page, id);
  // Bring the record into the viewport first: an entry far down the list has
  // off-screen coordinates, and a click there would land on another element.
  await control.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(120);
  const clicked = await control.click({ timeout: 3000 }).then(
    () => true,
    () => false,
  );
  if (!clicked) await control.evaluate((el) => el.click());
  // Wait for a detail surface: one that names the record AND exposes record
  // metadata. The list also names records, so naming alone is not enough.
  await poll(
    async () => {
      const text = await visibleText(page);
      const named = text.includes(id);
      const detail = /back to results|record [0-9]+ of|condition note|plate size|record id/i.test(
        text,
      );
      return named && detail ? text : null;
    },
    { what: `detail view for ${id}`, timeout: 8000 },
  );
}

/** Visible record order, read from the page text. */
async function resultOrder(page, ids) {
  const text = await visibleText(page);
  return ids
    .map((id) => ({ id, at: text.indexOf(id) }))
    .filter((entry) => entry.at !== -1)
    .sort((a, b) => a.at - b.at)
    .map((entry) => entry.id);
}

/** Apply a series filter value and wait until it has taken effect. */
async function applySeries(page, series, expectedVisible) {
  const control = await poll(
    async () => {
      const radios = page.locator('input[type="radio"]');
      const radioCount = await radios.count();
      for (let i = 0; i < radioCount; i += 1) {
        const candidate = radios.nth(i);
        if (!(await candidate.isVisible().catch(() => false))) continue;
        const presented = normalize(
          await candidate.evaluate(
            (el) =>
              `${el.value} ${el.labels?.[0]?.textContent ?? ''} ${
                el.closest('label')?.textContent ?? ''
              }`,
          ),
        );
        if (presented.includes(series)) return candidate;
      }
      const options = page.locator('option').filter({ hasText: series });
      if (await options.count()) return options.first();
      const buttons = page.getByRole('button', { name: new RegExp(`^\\s*${series}`, 'i') });
      if (await buttons.count()) return buttons.first();
      return null;
    },
    { what: `series filter ${series}` },
  );
  const tag = await control.evaluate((el) => el.tagName.toLowerCase());
  await control.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(100);
  if (tag === 'option') await page.locator('select').first().selectOption({ element: control });
  else await pressControl(control);
  await poll(
    async () => {
      const text = await visibleText(page);
      return expectedVisible.every((id) => text.includes(id)) ? text : null;
    },
    { what: `filter ${series} applied` },
  );
}

export const archiveTask = () => async ({ page, width, capture, check }) => {
  // --- entry: all five declared records and their facts are reachable ------
  await check('all five declared records are shown with their facts', async () => {
    const text = await visibleText(page);
    for (const record of ARCHIVE) {
      assert(text.includes(record.id), `missing ${record.id}`);
      assert(text.includes(record.series), `missing series ${record.series}`);
      assert(text.includes(record.medium), `missing medium for ${record.id}`);
    }
    for (const date of ['1924', '1931', '1936']) assert(text.includes(date), `missing date ${date}`);
    assert(text.includes('8.3'), 'plate size missing');
  });
  await check('the matching count is shown', async () => {
    const text = await visibleText(page);
    assert(/showing|\b5\b/i.test(text), 'no matching count');
    assert(/5/.test(text), 'count does not state five records');
  });

  // --- series filter -------------------------------------------------------
  await applySeries(page, 'Field Surveys', ['LS-02', 'LS-11', 'LS-19']);
  await check('Series filter limits results to Field Surveys', async () => {
    const text = await visibleText(page);
    for (const id of FIELD_SURVEYS) assert(text.includes(id), `${id} should be shown`);
    for (const id of CRAFT_TEACHING) assert(!text.includes(id), `${id} should be filtered out`);
  });
  await capture('filter-field-surveys');

  // --- search combined with the filter, then the empty state --------------
  const search = await searchField(page);
  await search.fill('weir');
  await check('search keeps only the matching record within the filter', async () => {
    const text = await waitForText(page, /LS-11/, 'LS-11 result');
    assert(!/LS-07/.test(text), 'LS-07 should not match "weir"');
  });
  await capture('search-weir');

  await search.fill('zzzz-no-such-record');
  await check('an empty result set offers a clear reset', async () => {
    const text = (
      await waitForText(
        page,
        /no (records|results|matches)|nothing (matches|found)|0 records/i,
        'empty state',
      )
    ).toLowerCase();
    assert(/no (records|results|matches)|nothing (matches|found)|0 records/.test(text), 'no empty message');
    const reset = page.getByRole('button', { name: /reset|clear/i });
    assert((await reset.count()) > 0, 'no reset control offered');
  });
  await capture('empty');

  (await buttonNamed(page, /reset|clear/i)).click();
  await check('reset restores the result set', async () => {
    await waitForText(page, /LS-02/, 'results restored');
    const refreshed = await searchField(page);
    assert.equal((await refreshed.inputValue()).trim(), '', 'reset left the query in place');
  });

  // --- return path: query, filter, order and focus retained ---------------
  await applySeries(page, 'All', ['LS-02']);
  await (await searchField(page)).fill('Coastal');
  await check('search for Coastal keeps the Field Surveys copies', async () => {
    await waitForText(page, /LS-02/, 'LS-02 in Coastal results');
  });
  const beforeOrder = await resultOrder(page, ['LS-02', 'LS-19']);
  await openRecord(page, 'LS-19');

  await check('detail shows LS-19 metadata, condition and the schematic disclaimer', async () => {
    const text = await visibleText(page);
    assert(text.includes('LS-19'), 'detail missing the record id');
    assert(/duplicate/i.test(text), 'detail does not identify the duplicate');
    assert(/LS-02/.test(text), 'detail does not relate LS-19 to LS-02');
    assert(/undated/i.test(text), 'detail does not state the undated catalogue date');
    // The duplicate must also be cross-referenced to LS-02 in the same surface.
    assert(/second copy of LS-02|copy of LS-02|duplicate of LS-02/i.test(text), 'no LS-02 cross-reference');
    assert(/schematic|placeholder|not the archival/i.test(text), 'no schematic-placeholder disclaimer');
    assert(/condition|emulsion lifting/i.test(text), 'condition note not shown');
  });
  await capture('detail-duplicate');

  await check('LS-19 is not presented as a separate photograph or new discovery', async () => {
    const text = (await visibleText(page)).toLowerCase();
    assert(
      /second copy|duplicate (of|record)|not a (different|separate) photograph/.test(text),
      'LS-19 could read as a distinct photograph',
    );
    // Only an affirmative claim counts. A negated one ("not a new discovery") is
    // the honest statement the prompt asks for, so negation is excluded first.
    const affirmative = text
      .replace(/\b(not|never|no|isn't|is not|nor)\b[^.]{0,60}/g, ' ')
      .replace(/\b(n't)\b[^.]{0,60}/g, ' ');
    assert(
      !/new (discovery|acquisition)|newly (discovered|catalogued)|first (known|record)/.test(
        affirmative,
      ),
      'LS-19 presented as new',
    );
  });

  // The control may be a link, a button, or a button whose label starts with an
  // arrow glyph; all three mean "return to the results". Record openers are
  // excluded so "open record" can never be mistaken for a back control.
  const back = await poll(
    async () => {
      const candidates = await collectVisible(page.locator('button, a, [role="button"]'));
      for (const candidate of candidates) {
        const identity = await candidate.evaluate((el) =>
          [
            el.id ?? '',
            el.className?.toString() ?? '',
            el.getAttribute('aria-label') ?? '',
            el.textContent ?? '',
          ]
            .join(' ')
            .replace(/\s+/g, ' '),
        );
        if (/open record/i.test(identity)) continue;
        if (/\b(back|return)\b|←|‹|«/i.test(identity)) return candidate;
      }
      return null;
    },
    { what: 'back-to-results control' },
  );
  await back.click();
  await check('returning retains query, filter, order and focus', async () => {
    await waitForText(page, /LS-02/, 'results after returning');
    const refreshed = await searchField(page);
    assert.equal(await refreshed.inputValue(), 'Coastal', 'query not retained');
    const afterOrder = await resultOrder(page, ['LS-02', 'LS-19']);
    assert.deepEqual(afterOrder, beforeOrder, `result order changed: ${beforeOrder} -> ${afterOrder}`);
    const focused = await poll(
      async () => {
        const state = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName ?? null,
            text: `${el?.textContent ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, 160),
            closest: el?.closest('[data-open], .record, li, button')?.outerHTML.slice(0, 300) ?? '',
          };
        });
        return /LS-19/.test(state.text) || /LS-19/.test(state.closest) ? state : null;
      },
      { what: 'focus returned to the opened record', timeout: 3000 },
    );
    assert(/LS-19/.test(focused.text) || /LS-19/.test(focused.closest), 'focus not restored');
  });
  await capture('return');

  // --- long title survives narrow widths ---------------------------------
  await (await searchField(page)).fill('cross-section');
  await check('the long title is readable at this width', async () => {
    await waitForText(page, /River weir cross-section/, 'long title');
  });
  await check(`no horizontal overflow at ${width}px`, async () => {
    const geometry = await overflow(page);
    assert.equal(geometry.overflowPx, 0, `overflow ${geometry.overflowPx}px`);
  });
};

// Only run when executed directly; per-cell wrappers import archiveTask.
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  const cell = process.argv[2] || 'archive-R1';
  const result = await runCell(
    cell,
    process.argv[3] || 'initial',
    process.argv[4] || 'initial-01',
    archiveTask(),
    fileURLToPath(import.meta.url),
  );
  if (result.failures.length) process.exitCode = 1;
}
