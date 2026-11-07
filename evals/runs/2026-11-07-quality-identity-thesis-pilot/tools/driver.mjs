// Locator-agnostic task driver for the freight and archive cells.
//
// Both conditions (lean R1, candidate R2) were authored independently, so their
// DOM differs. Every helper below therefore discovers controls through
// accessibility roles and associated labels rather than one cell's ids, and polls
// briefly for the app to settle instead of assuming a synchronous re-render.
// Polling waits for the page; it never asserts on a condition's behalf, so the
// same code path remains fair to every cell.
//
// Nothing here restyles or patches a creator's output.

const norm = (value) => (value ?? '').replace(/\s+/g, ' ').trim();

/** Repeat fn until it returns a truthy value, then return it. */
export async function poll(fn, { timeout = 5000, interval = 60, what = 'condition' } = {}) {
  const deadline = Date.now() + timeout;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(
    `${what} not met within ${timeout}ms${lastError ? `: ${lastError.message}` : ''}`,
  );
}

async function isVisible(locator) {
  return locator.isVisible().catch(() => false);
}

/** Text a control is presented with: label, wrapper label, aria-label, landmark. */
async function controlText(control) {
  return norm(
    await control.evaluate((el) => {
      const parts = [];
      if (el.id) parts.push(el.id);
      if (el.value) parts.push(String(el.value));
      parts.push(el.getAttribute('aria-label') ?? '');
      for (const label of el.labels ? Array.from(el.labels) : []) {
        parts.push(label.textContent ?? '');
      }
      const wrapping = el.closest('label');
      if (wrapping) parts.push(wrapping.textContent ?? '');
      const fieldset = el.closest('fieldset');
      if (fieldset) {
        const legend = fieldset.querySelector('legend');
        if (legend) parts.push(legend.textContent ?? '');
      }
      const item = el.closest('li, article, tr, [data-id], .card, .item');
      if (item) parts.push(item.textContent ?? '');
      return parts.join(' ');
    }),
  );
}

/** Full visible text of the current surface. */
export async function visibleText(page) {
  return norm(await page.locator('body').innerText());
}

/** Wait until the visible page text satisfies `pattern`. */
export async function waitForText(page, pattern, what = `text ${pattern}`) {
  return poll(
    async () => {
      const text = await visibleText(page);
      return pattern.test(text) ? text : null;
    },
    { what },
  );
}

/** Text and attributes that identify a control itself, ignoring its container. */
async function ownText(control) {
  return norm(
    await control.evaluate((el) => {
      const parts = [el.id ?? '', String(el.value ?? ''), el.getAttribute('aria-label') ?? ''];
      // Identity is often carried by a data-* attribute rather than id/value.
      for (const attribute of Array.from(el.attributes ?? [])) {
        if (/^(data-|aria-label$|name$)/.test(attribute.name)) parts.push(attribute.value);
      }
      for (const name of Object.keys(el.dataset ?? {})) parts.push(el.dataset[name]);
      for (const label of el.labels ? Array.from(el.labels) : []) parts.push(label.textContent ?? '');
      const wrapping = el.closest('label');
      if (wrapping) parts.push(wrapping.textContent ?? '');
      return parts.join(' ');
    }),
  );
}

/**
 * Selectable control for a catalogue/consignment id, whatever the cell calls it.
 *
 * A control is matched on its OWN identity first (id, value, aria-label, label
 * text). Only if no control identifies itself is a row/container match accepted,
 * because a container's text holds every record and would otherwise select the
 * wrong option.
 */
export async function selectableForId(page, id) {
  const escaped = id.replace(/[-]/g, '[- ]?');
  const byId = new RegExp(escaped);
  return poll(
    async () => {
      const controls = [
        ...(await collect(page.locator('input[type="radio"], input[type="checkbox"]'))),
        ...(await collect(page.locator('option'))),
        ...(await collect(page.getByRole('button', { name: byId }))),
        ...(await collect(page.getByRole('link', { name: byId }))),
      ];
      for (const control of controls) {
        if ((await ownText(control)).includes(id)) return control;
      }
      // Fallback: a whole row is the control (e.g. a clickable table row or list
      // item). Require the row to name exactly this id and no other record id, so a
      // sibling row can never be selected for the wrong record.
      for (const row of await collect(page.locator('tr, li, article'))) {
        const identity = await ownText(row);
        if (/\b[A-Z]{2}-\d{2,3}\b/.test(identity) && !identity.includes(id)) continue;
        const text = await controlText(row);
        const ids = text.match(/\b[A-Z]{2}-\d{2,3}\b/g) ?? [];
        if (ids.length === 1 && ids[0] === id) return row;
      }
      return null;
    },
    { what: `selectable control for ${id}` },
  );
}

async function collect(locator) {
  const found = [];
  const count = await locator.count();
  for (let i = 0; i < count; i += 1) {
    const candidate = locator.nth(i);
    if (await isVisible(candidate)) found.push(candidate);
  }
  return found;
}

/** Bring the requested consignment into view/selection. */
export async function selectConsignment(page, id) {
  const control = await selectableForId(page, id);
  const tag = await control.evaluate((el) => el.tagName.toLowerCase());
  const type = await control.getAttribute('type');
  if (tag === 'input' && (type === 'radio' || type === 'checkbox')) {
    const checked = await control.isChecked().catch(() => false);
    if (!checked) await control.check().catch(async () => control.click());
  } else if (tag === 'option') {
    await page.locator('select').first().selectOption({ element: control });
  } else {
    await control.click();
  }
  return control;
}

/** Release/Hold decision control by its presented name. */
export async function decisionControl(page, word) {
  const loose = new RegExp(word, 'i');
  return poll(
    async () => {
      for (const group of [
        page.getByRole('radio', { name: loose }),
        page.getByRole('button', { name: loose }),
      ]) {
        const count = await group.count();
        for (let i = 0; i < count; i += 1) {
          const candidate = group.nth(i);
          if (await isVisible(candidate)) return candidate;
        }
      }
      // Radios carry no text node; scan their presented labels instead.
      const radios = page.locator('input[type="radio"]');
      const count = await radios.count();
      for (let i = 0; i < count; i += 1) {
        const candidate = radios.nth(i);
        if (!(await isVisible(candidate))) continue;
        if (loose.test(await controlText(candidate))) return candidate;
      }
      return null;
    },
    { what: `${word} decision control` },
  );
}

/**
 * Activate a control the way a person would.
 *
 * A radio/checkbox may be a visually hidden native input (1x1px, opacity 0) that is
 * covered by its label's styled span. Clicking the input directly is blocked by
 * the covering element, so the label — the thing actually on screen — is used.
 */
export async function pressControl(control) {
  const tag = await control.evaluate((el) => el.tagName.toLowerCase());
  const type = await control.getAttribute('type');
  if (tag === 'input' && (type === 'radio' || type === 'checkbox')) {
    const hidden = await control.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return (
        Number(s.opacity) === 0 ||
        s.visibility === 'hidden' ||
        (r.width <= 2 && r.height <= 2) ||
        s.clipPath !== 'none'
      );
    });
    if (hidden) {
      const label = control.locator('xpath=ancestor-or-self::label[1]');
      if (await label.count()) {
        await label.first().scrollIntoViewIfNeeded().catch(() => {});
        await label.first().click({ timeout: 4000 });
        return;
      }
    }
    await control.scrollIntoViewIfNeeded().catch(() => {});
    const checked = await control.check().then(
      () => true,
      () => false,
    );
    if (!checked) await control.click({ timeout: 4000, force: false }).catch(async () => {
      await control.evaluate((el) => el.click());
    });
  } else {
    await control.scrollIntoViewIfNeeded().catch(() => {});
    await control.click({ timeout: 4000 });
  }
}

/** Choose a decision and confirm it actually took effect. */
export async function chooseDecision(page, word) {
  const control = await decisionControl(page, word);
  await pressControl(control);
  await poll(
    async () => {
      const checked = await page
        .locator('input[type="radio"]:checked')
        .evaluateAll((nodes) =>
          nodes.map((node) => `${node.value} ${node.labels?.[0]?.textContent ?? ''}`),
        );
      return checked.some((value) => new RegExp(word, 'i').test(value));
    },
    { what: `${word} to be selected`, timeout: 3000 },
  );
}

/**
 * Attempt to release consignment `id` and report what the page actually did.
 *
 * Two designs are both valid: disable the Release control, or accept the choice but
 * refuse to advance with an explanation. The harness therefore measures the
 * OUTCOME (could the operator get a release through?) instead of requiring one
 * particular control state. Requires the note to be filled by the caller.
 */
export async function attemptRelease(page, id, note) {
  await selectConsignment(page, id);
  const control = await decisionControl(page, 'Release');
  const controlDisabled = await control.isDisabled().catch(() => false);
  const ariaDisabled = (await control.getAttribute('aria-disabled')) === 'true';
  if (!controlDisabled && !ariaDisabled) {
    await pressControl(control).catch(() => {});
  }
  const selected = await poll(
    async () => {
      const checked = await page
        .locator('input[type="radio"]:checked')
        .evaluateAll((nodes) =>
          nodes.map((node) => `${node.value} ${node.labels?.[0]?.textContent ?? ''}`),
        );
      return checked.some((value) => /release/i.test(value)) ? true : null;
    },
    { what: 'release selection', timeout: 1500 },
  ).catch(() => false);
  const field = await noteField(page);
  await field.fill(note).catch(() => {});
  const before = await visibleText(page);
  // Advancement is detected by the review stage's own actions, not by page text:
  // a stepper label ("Recorded") is always present and would read as progress.
  const reviewActions = async () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('button, [role="button"]'))
        .filter((node) => node.offsetParent)
        .some((node) => /^\s*(submit|confirm)\b|\bedit (the )?decision\b/i.test(
          (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
        )),
    );
  await (await buttonNamed(page, /review|continue|next/i)).click().catch(() => {});
  const advanced = await poll(reviewActions, { what: 'review stage actions', timeout: 4000 }).catch(
    () => false,
  );
  const after = await visibleText(page);
  const blockedText =
    before.match(/release[^.]{0,200}blocked[^.]{0,240}|blocked[^.]{0,200}release[^.]{0,240}/i)?.[0] ??
    after.match(/release[^.]{0,200}blocked[^.]{0,240}|blocked[^.]{0,200}release[^.]{0,240}/i)?.[0] ??
    '';
  return { controlDisabled: controlDisabled || ariaDisabled, selected, advanced, blockedText };
}

/**
 * True when the page refuses Release. A natively disabled or aria-disabled
 * control counts; otherwise the control is pressed and the outcome observed.
 */
export async function isReleaseBlocked(page) {
  let control;
  try {
    control = await decisionControl(page, 'Release');
  } catch {
    // Some cells express the block as text instead of a disabled control.
    const text = await visibleText(page);
    if (/release[^.]*(unavailable|blocked|not possible|cannot)|must be held/i.test(text)) return true;
    throw new Error('No Release control and no stated release block');
  }
  if (await control.isDisabled().catch(() => false)) return true;
  if ((await control.getAttribute('aria-disabled')) === 'true') return true;
  if (
    await control
      .evaluate((el) => el.closest('fieldset')?.disabled === true)
      .catch(() => false)
  )
    return true;
  // Not statically disabled. Press it normally and decide from the effect: a page
  // that accepts the Release choice has NOT blocked Release. Forcing the click is
  // not evidence either way, so it is deliberately not used.
  const pressed = await control.click({ timeout: 2000 }).then(
    () => true,
    () => false,
  );
  if (!pressed) return true; // The page refused the interaction itself.
  const selected = await poll(
    async () => {
      const checked = await page
        .locator('input[type="radio"]:checked')
        .evaluateAll((nodes) =>
          nodes.map((node) => `${node.value} ${node.labels?.[0]?.textContent ?? ''}`),
        );
      return checked.some((value) => /release/i.test(value)) ? true : null;
    },
    { what: 'release selection outcome', timeout: 1500 },
  ).catch(() => false);
  return !selected;
}

/** Which of release/hold is currently chosen, by presented label. */
export async function readDecisions(page) {
  const radios = page.locator('input[type="radio"]:checked');
  const chosen = [];
  for (let i = 0; i < (await radios.count()); i += 1) {
    const text = await controlText(radios.nth(i));
    if (/release/i.test(text)) chosen.push('release');
    if (/\bhold\b/i.test(text)) chosen.push('hold');
  }
  return chosen;
}

/** The task's note field, resolved whenever it is needed. */
export async function noteField(page) {
  return poll(
    async () => {
      for (const locator of [
        page.locator('textarea:visible'),
        page.getByLabel(/note/i),
        page.locator('input[type="text"]:visible'),
      ]) {
        const count = await locator.count();
        for (let i = 0; i < count; i += 1) {
          const candidate = locator.nth(i);
          if (await isVisible(candidate)) return candidate;
        }
      }
      return null;
    },
    { what: 'note field' },
  );
}

/**
 * First visible button whose accessible name, id, class or data attributes match
 * `pattern`. Cells label controls differently (text, id, aria-label), so every
 * affordance is considered before giving up.
 */
export async function buttonNamed(page, pattern) {
  return poll(
    async () => {
      for (const locator of [
        page.getByRole('button', { name: pattern }),
        page.getByRole('link', { name: pattern }),
        page.locator('button').filter({ hasText: pattern }),
        page.locator('[role="button"]').filter({ hasText: pattern }),
      ]) {
        const count = await locator.count();
        for (let i = 0; i < count; i += 1) {
          const candidate = locator.nth(i);
          if (await isVisible(candidate)) return candidate;
        }
      }
      // Fall back to any visible interactive element whose own identity matches.
      for (const candidate of [
        ...(await collectVisible(page.locator('button, a, [role="button"]'))),
      ]) {
        const identity = await candidate.evaluate((el) =>
          [
            el.id ?? '',
            el.className?.toString() ?? '',
            el.getAttribute('aria-label') ?? '',
            ...Object.keys(el.dataset ?? {}).map((key) => `${key}=${el.dataset[key]}`),
          ].join(' '),
        );
        if (pattern.test(identity)) return candidate;
      }
      return null;
    },
    { what: `visible button ${pattern}` },
  );
}

/** All visible interactive elements matching the selector. */
export async function collectVisible(locator) {
  const found = [];
  const count = await locator.count();
  for (let i = 0; i < count; i += 1) {
    const candidate = locator.nth(i);
    if (await isVisible(candidate)) found.push(candidate);
  }
  return found;
}

/** Horizontal overflow of the document at the current width. */
export async function overflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflowPx: Math.max(
      0,
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  }));
}

/** Which reading values of a consignment exceed its declared limit. */
export function excursionsOf(readings, limit) {
  return readings.filter((value) => value > limit);
}

export const normalize = norm;

export const FREIGHT = {
  'HC-114': {
    product: 'Line-caught mackerel',
    limit: -1.0,
    readings: [-2.1, -1.8, -0.4, -1.6],
    weight: '42.5',
    dock: 'Dock B',
  },
  'HC-118': {
    product: 'Blue mussels',
    limit: 2.0,
    readings: [1.2, 1.6, 1.9, 1.4],
    weight: '18.0',
    dock: 'Dock A',
  },
  'HC-121': {
    product: 'Sea bream',
    limit: 0.0,
    readings: [0.3, 0.2, -0.2, 0.1],
    weight: '61.2',
    dock: 'Dock C',
  },
  'HC-126': {
    product: 'Squid',
    limit: -0.5,
    readings: [-1.4, -1.1, -1.2, -1.3],
    weight: '27.4',
    dock: 'Dock A',
  },
};

export const ARCHIVE = [
  { id: 'LS-02', series: 'Field Surveys', medium: 'Hand-tinted glass' },
  { id: 'LS-07', series: 'Craft Teaching', medium: 'Black-and-white glass' },
  { id: 'LS-11', series: 'Field Surveys', medium: 'Black-and-white glass' },
  { id: 'LS-14', series: 'Craft Teaching', medium: 'Hand-tinted glass' },
  { id: 'LS-19', series: 'Field Surveys', medium: 'Hand-tinted glass' },
];
