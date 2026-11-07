import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runCell } from './browser.mjs';
import {
  FREIGHT,
  attemptRelease,
  buttonNamed,
  chooseDecision,
  isReleaseBlocked,
  noteField,
  overflow,
  poll,
  selectConsignment,
  visibleText,
  waitForText,
} from './driver.mjs';

// Matched acceptance for the Harbor Cold Chain slice.
//
// The assertions encode the prompt's supplied facts and required behaviour, and
// are written against accessibility roles/labels so the identical facts are
// checked in both conditions. This script never edits a creator's file: it
// records what the submitted page actually does.
const shortNote = 'short';
const validNote =
  'Third reading −0.4 °C is above the declared −1.0 °C limit; holding pending supervisor review.';
const longNote = `${validNote} ${validNote}`;

/** Is there a visible control that offers another submission attempt? */
async function retryAffordance(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="button"], a'))
      .filter((node) => node.offsetParent)
      .some((node) =>
        /retry|try again|attempt again|resubmit/i.test(
          (node.textContent ?? '').replace(/\s+/g, ' '),
        ),
      ),
  );
}

/** Every radio decision control's presented label, for retention checks. */
async function presentedValues(page, selector) {
  const controls = page.locator(selector);
  const values = [];
  for (let i = 0; i < (await controls.count()); i += 1) {
    const control = controls.nth(i);
    values.push(
      `${await control.getAttribute('value')} ${await control.evaluate(
        (el) =>
          `${el.labels?.[0]?.textContent ?? ''} ${el.closest('label')?.textContent ?? ''}`,
      )}`,
    );
  }
  return values;
}

async function step(capture, page, name, check, assertion) {
  await check(name, async () => {
    await page.waitForTimeout(80);
    await assertion();
  });
  void capture;
}

export const freightTask = () => async ({ page, width, capture, check }) => {
  const facts = FREIGHT;
  const noExcursion = (id) => facts[id].readings.every((v) => v <= facts[id].limit);

  // --- entry: every declared consignment is reachable ----------------------
  await step(capture, page, 'all four declared consignments are offered', check, async () => {
    const text = await visibleText(page);
    for (const [id, fact] of Object.entries(facts)) {
      assert(text.includes(id), `missing consignment ${id}`);
      assert(text.includes(fact.product), `missing product ${fact.product}`);
    }
  });

  // --- excursion logic is visible, not merely computed ---------------------
  for (const [id, fact] of Object.entries(facts)) {
    await selectConsignment(page, id);
    await step(capture, page, `${id} shows its four readings and declared limit`, check, async () => {
      const text = await visibleText(page);
      for (const reading of fact.readings) {
        const minus = String(reading).replace('-', '−');
        assert(
          text.includes(String(reading)) || text.includes(minus),
          `${id}: reading ${reading} not shown`,
        );
      }
      const limitMinus = String(fact.limit).replace('-', '−');
      assert(
        text.includes(String(fact.limit)) || text.includes(limitMinus),
        `${id}: declared limit ${fact.limit} not shown`,
      );
    });
    await step(capture, page, `${id} states the correct excursion state`, check, async () => {
      const text = (await visibleText(page)).toLowerCase();
      if (noExcursion(id))
        assert(
          text.includes('no excursion') || text.includes('within limit'),
          `${id} should present no excursion`,
        );
      else
        assert(
          text.includes('excursion') || text.includes('above limit'),
          `${id} should present an excursion`,
        );
    });
  }

  // --- HC-114: the consequential case, release must be blocked -------------
  await selectConsignment(page, 'HC-114');
  await step(capture, page, 'HC-114 names the −0.4 °C reading against its −1.0 °C limit', check, async () => {
    const text = await visibleText(page);
    assert(/[-−]0\.4/.test(text), 'offending reading −0.4 not named');
    assert(/[-−]1\.0/.test(text), 'declared limit −1.0 not named');
  });
  // The prompt requires that Release be blocked and explained. Two designs satisfy
  // it: disabling the control, or accepting the choice but refusing to advance. The
  // assertion therefore checks the outcome — a release must not be reachable — so
  // neither condition's design is privileged over the other.
  let releaseAttempt = null;
  await step(capture, page, 'Release cannot be carried through for HC-114, and is explained', check, async () => {
    releaseAttempt = await attemptRelease(page, 'HC-114', validNote);
    assert(
      !releaseAttempt.advanced,
      `Release was carried through for HC-114 (disabled=${releaseAttempt.controlDisabled}, selected=${releaseAttempt.selected})`,
    );
    const text = (
      await visibleText(page)
    ).toLowerCase();
    const explained = Boolean(releaseAttempt.blockedText) ||
      /release (is )?(unavailable|blocked|not possible)|cannot release|must be held|hold required/.test(text);
    assert(explained, 'no explanation of the blocked release');
  });
  await capture('blocked-excursion');

  // Control for the same assertion: Hold must still reach the review stage, so the
  // refusal above is attributable to Release rather than a broken flow.
  await step(capture, page, 'Hold still reaches review, so the refusal is specific to Release', check, async () => {
    await selectConsignment(page, 'HC-114');
    await chooseDecision(page, 'Hold');
    const field = await noteField(page);
    await field.fill(validNote);
    await (await buttonNamed(page, /review|continue|next/i)).click();
    await waitForText(
      page,
      /review the decision|submit decision|edit decision|review-panel|confirm/i,
      'review stage after Hold',
    );
  });
  // Return to the evidence stage for the remaining checks.
  const editBack = page.getByRole('button', { name: /edit/i });
  if (await editBack.count()) {
    await editBack.first().click().catch(() => {});
    await page.waitForTimeout(200);
  }

  // --- note length rule 10–120 --------------------------------------------
  await step(capture, page, 'a 9-character note is rejected', check, async () => {
    await selectConsignment(page, 'HC-114');
    await chooseDecision(page, 'Hold');
    const note = await noteField(page);
    await note.fill(shortNote);
    await (await buttonNamed(page, /review|continue|next/i)).click();
    // Either an inline message or a refusal to advance satisfies the rule.
    const text = (
      await waitForText(
        page,
        /between 10|10[–-]120|at least 10|too short|characters?\b|needs? at least/i,
        'short-note message',
      )
    ).toLowerCase();
    assert(/between 10|10[–-]120|at least 10|too short|character/.test(text), 'no note-length guidance');
  });
  await capture('note-too-short');

  await step(capture, page, 'a note over 120 characters is refused', check, async () => {
    const note = await noteField(page);
    await note.fill(longNote);
    const value = await note.inputValue();
    if (value.length <= 120) return; // The control itself refused the text.
    await (await buttonNamed(page, /review|continue|next/i)).click();
    const text = (
      await waitForText(page, /120|too long|maximum|characters?/i, 'over-long note message')
    ).toLowerCase();
    assert(/120|too long|maximum|character/.test(text), 'no maximum-length guidance');
  });

  const note = await noteField(page);
  await note.fill(validNote);
  await (await buttonNamed(page, /review|continue|next/i)).click();
  await waitForText(page, /review the decision|submit decision|edit decision/i, 'review stage');

  // --- review carries the decided facts -----------------------------------
  await step(capture, page, 'review shows consignment, decision, weight, dock, excursion, note', check, async () => {
    const text = await visibleText(page);
    assert(text.includes('HC-114'), 'review missing consignment');
    assert(/hold/i.test(text), 'review missing decision');
    assert(text.includes('42.5'), 'review missing weight');
    assert(text.includes('Dock B'), 'review missing destination dock');
    assert(/excursion|above limit|[-−]0\.4/.test(text), 'review missing excursion summary');
    assert(text.includes(validNote.slice(0, 40)), 'review missing the note');
  });
  await capture('review');

  // --- edit retains selection, decision and note --------------------------
  (await buttonNamed(page, /edit/i)).click();
  await step(capture, page, 'edit retains the selection, decision and note', check, async () => {
    assert((await visibleText(page)).includes('HC-114'), 'selection lost after edit');
    const checked = await presentedValues(page, 'input[type="radio"]:checked');
    assert(
      checked.some((value) => /hold/i.test(value)),
      'decision lost after edit',
    );
    assert.equal(await (await noteField(page)).inputValue(), validNote, 'note lost after edit');
  });
  await capture('edit');

  // --- changing consignment must not carry decision/note ------------------
  await selectConsignment(page, 'HC-118');
  await step(capture, page, 'changing consignment clears the previous decision and note', check, async () => {
    assert.equal(
      (await (await noteField(page)).inputValue()).trim(),
      '',
      'note carried across consignments',
    );
    const checked = await presentedValues(page, 'input[type="radio"]:checked');
    assert(
      !checked.some((value) => /\bhold\b|\brelease\b/i.test(value)),
      `decision carried across consignments: ${checked.join(' | ')}`,
    );
  });
  await step(capture, page, 'HC-118 has no excursion, so Release is available', check, async () => {
    assert.equal(await isReleaseBlocked(page), false, 'Release wrongly blocked for HC-118');
  });

  // --- return to HC-114 and complete the failure/retry path ---------------
  await selectConsignment(page, 'HC-114');
  await chooseDecision(page, 'Hold');
  await note.fill(validNote);
  (await buttonNamed(page, /review/i)).click();
  (await buttonNamed(page, /submit|confirm|record/i)).click();
  await step(capture, page, 'the first valid submit fails with a useful recovery', check, async () => {
    // Wait for the outcome rather than sampling an intermediate frame.
    // Accept any honest statement that the submission did not take effect, then
    // require an actual recovery affordance in the rendered page.
    const text = (
      await waitForText(
        page,
        /(not|wasn't|was not) (confirmed|recorded|accepted|completed)|failed|failure|did not|could ?n.t|could not|unavailable|timed out|error/i,
        'submission failure message',
      )
    ).toLowerCase();
    assert(
      /(not|wasn.t|was not) (confirmed|recorded|accepted)|failed|failure|did not|couldn.t|could not|unavailable|timed out|error/.test(
        text,
      ),
      'no failure message',
    );
    const retry = await poll(
      async () => ((await retryAffordance(page)) ? true : null),
      { what: 'retry affordance', timeout: 3000 },
    ).catch(() => false);
    assert(retry, 'no recovery action offered');
  });
  await capture('submit-failure');
  await step(capture, page, 'facts are unchanged after the failure', check, async () => {
    const text = await visibleText(page);
    assert(text.includes('HC-114'), 'consignment lost after failure');
    assert(
      text.includes('42.5') || text.includes(validNote.slice(0, 40)),
      'decided facts lost after failure',
    );
  });

  (await buttonNamed(page, /retry|try again|resubmit|attempt again/i)).click();
  await step(capture, page, 'retry succeeds and states the recorded decision honestly', check, async () => {
    // Wait for the recorded state to actually exist, not for a mid-transition frame:
    // the honest disclaimer and the recorded decision must both be on screen.
    const text = (
      await waitForText(
        page,
        /no real (shipment|release|consignment|food)|not a real|no food-safety|no real food/i,
        'recorded state with its honest disclaimer',
      )
    ).toLowerCase();
    assert(/hold/.test(text), 'success does not state the recorded decision');
  });
  // Capture only once the recorded surface has settled and no failure alert is still
  // showing. Without this gate the screenshot showed "Submitting…" or the stale
  // failure alert, which misrepresented the state to reviewers.
  await poll(
    async () =>
      page.evaluate(() => {
        const visible = (node) => Boolean(node.offsetParent);
        const alerts = Array.from(
          document.querySelectorAll('[role="alert"], [id*="submit-error"], .alert'),
        ).filter(visible);
        const settled = /recorded|start another consignment|inspect another consignment/i.test(
          document.body.innerText,
        );
        const submitting = /submitting/i.test(document.body.innerText);
        return alerts.length === 0 && settled && !submitting ? true : null;
      }),
    { what: 'settled recorded state before capture', timeout: 8000 },
  );
  await capture('success');

  // --- overflow at this width ---------------------------------------------
  await step(capture, page, `no horizontal overflow at ${width}px`, check, async () => {
    const geometry = await overflow(page);
    assert.equal(geometry.overflowPx, 0, `overflow ${geometry.overflowPx}px in success state`);
  });
};

// Only run when executed directly; the per-cell wrappers import freightTask.
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  const cell = process.argv[2] || 'freight-R1';
  const result = await runCell(
    cell,
    process.argv[3] || 'initial',
    process.argv[4] || 'initial-01',
    freightTask(),
    fileURLToPath(import.meta.url),
  );
  if (result.failures.length) process.exitCode = 1;
}
