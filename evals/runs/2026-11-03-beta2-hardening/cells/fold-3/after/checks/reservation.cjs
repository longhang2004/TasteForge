// Source-level state checks with a minimal DOM; not browser acceptance.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements = new Map();
let focused;
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    value: '', hidden: ['feedback', 'retry'].includes(id), textContent: '',
    attrs: {}, events: {}, classList: { remove() {}, toggle() {} },
    setAttribute(k, v) { this.attrs[k] = v; },
    removeAttribute(k) { delete this.attrs[k]; },
    addEventListener(k, fn) { this.events[k] = fn; },
    focus() { focused = id; },
    get validity() { return { valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value) }; }
  });
  return elements.get(id);
}
element('edition').value = 'Harbor';
element('quantity').value = '1';
const cta = { addEventListener(_, fn) { this.click = fn; } };
vm.runInNewContext(source, {
  document: { getElementById: element, querySelectorAll: () => [cta] },
  requestAnimationFrame: fn => fn()
});
const set = (id, value) => { element(id).value = value; element(id).events.input(); };
const submit = () => element('reservation-form').events.submit({ preventDefault() {} });
const message = () => element('feedback-message').textContent;
assert.ok(html.indexOf('<dl class="costs"') < html.indexOf('<div class="email-field">'));
assert.match(html, /value="Night" disabled/);
assert.equal(element('total').textContent, 'USD 58');
cta.click(); assert.equal(focused, 'edition');
set('quantity', '2'); assert.equal(element('subtotal').textContent, 'USD 106');
assert.equal(element('total').textContent, 'USD 111');
submit(); assert.equal(focused, 'email');
assert.match(element('email').attrs['aria-describedby'], /feedback-message/);
set('email', 'bad'); submit(); assert.match(message(), /valid email/);
set('email', 'mai@example.com');
set('quantity', '3'); set('edition', 'Ridge');
assert.equal(element('quantity').value, '3');
assert.equal(element('quantity').max, '2');
assert.equal(element('subtotal').textContent, '—');
assert.equal(element('total').textContent, '—');
submit(); assert.equal(focused, 'quantity'); assert.match(message(), /1 to 2/);
for (const value of ['', '0', '-1', '1.5', '4']) {
  set('quantity', value); assert.equal(element('total').textContent, '—');
  submit(); assert.equal(focused, 'quantity');
}
set('edition', 'Night'); set('quantity', '1'); submit();
assert.equal(focused, 'edition'); assert.equal(element('total').textContent, '—');
set('edition', 'Harbor'); set('quantity', '2'); submit();
assert.match(message(), /could not be completed/);
assert.equal(element('retry').hidden, false);
assert.equal(element('email').value, 'mai@example.com');
set('edition', 'Ridge');
assert.equal(element('retry').hidden, false);
assert.match(message(), /current edition/);
element('retry').events.click();
assert.match(message(), /Ridge × 2, total USD 111/);
assert.match(message(), /No real reservation or order was created; no payment or email was sent/);
assert.equal(element('retry').hidden, true);
assert.equal(element('email').value, 'mai@example.com');
set('edition', 'Harbor'); assert.equal(element('feedback').hidden, true);
submit(); assert.match(message(), /Harbor × 2, total USD 111/);
assert.equal(element('feedback').attrs.role, 'status');
assert.equal(focused, 'feedback');
console.log('PASS: cost/stock, required/invalid fields, CTA focus, retained edits, first valid failure, retry and exact success (minimal DOM; no browser checks).');
