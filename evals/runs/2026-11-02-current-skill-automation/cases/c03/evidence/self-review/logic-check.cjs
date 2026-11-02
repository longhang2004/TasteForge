const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const fixture = JSON.parse(fs.readFileSync('fixture.json', 'utf8'));
for (const hook of ['glaze-iron', 'glaze-ash', 'glaze-sand', 'quantity', 'add-to-cart', 'cart-status']) {
  assert.ok(html.includes(`data-testid="${hook}"`));
}
assert.match(html, /data-testid="glaze-ash" disabled/);
assert.match(html, /data-testid="glaze-iron" checked/);
let glaze = 'iron';
const events = {};
const nodes = {
  '#quantity': { value: '1' },
  '[data-testid="cart-status"]': { textContent: '' },
  '#item-description': {}, '#subtotal': {}, '#order-total': {}
};
nodes['#purchase-form'] = {
  querySelector: () => ({ value: glaze }),
  addEventListener: (name, callback) => { events[name] = callback; }
};
vm.runInNewContext(fs.readFileSync('app.js', 'utf8'), {
  document: { querySelector: selector => nodes[selector] }
});
assert.equal(nodes['#order-total'].textContent, 'USD 76.00');
assert.equal(nodes['#item-description'].textContent, 'Iron × 1');
glaze = 'sand'; nodes['#quantity'].value = '2'; events.change();
assert.equal(nodes['#order-total'].textContent, `USD ${(fixture.priceUSD * 2 + fixture.shippingUSD).toFixed(2)}`);
events.submit({ preventDefault() {} });
assert.match(nodes['[data-testid="cart-status"]'].textContent, /Sand × 2/);
assert.match(nodes['[data-testid="cart-status"]'].textContent, /USD 144.00/);
glaze = 'ash'; events.submit({ preventDefault() {} });
assert.match(nodes['[data-testid="cart-status"]'].textContent, /choose an available glaze/);
console.log('PASS: hooks and initial Iron selection; Ash disabled in HTML; initial USD 76.00; Sand × 2 USD 144.00 and cart confirmation; unavailable-glaze submit guard.');
console.log('Scope: Node VM with minimal DOM stubs, not browser interaction or accessibility testing.');
