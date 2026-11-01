const fs=require('fs');const vm=require('vm');const assert=require('assert');
const listeners={};const form={elements:{glaze:{value:'iron'}},addEventListener:(name,cb)=>listeners[name]=cb};const nodes={'#order':form,'#quantity':{value:'1'},'#cart-status':{textContent:''},'#calculation':{},'#subtotal':{},'#total':{}};
vm.runInNewContext(fs.readFileSync('app.js','utf8'),{document:{querySelector:s=>nodes[s]}});
listeners.change();assert.equal(nodes['#total'].textContent,'$76');
form.elements.glaze.value='sand';nodes['#quantity'].value='2';listeners.change();assert.equal(nodes['#total'].textContent,'$144');listeners.submit({preventDefault(){}});assert.match(nodes['#cart-status'].textContent,/2 × Everyday Teapot in Sand/);assert.match(nodes['#cart-status'].textContent,/\$144/);
form.elements.glaze.value='ash';listeners.submit({preventDefault(){}});assert.match(nodes['#cart-status'].textContent,/choose an available glaze/);
const html=fs.readFileSync('index.html','utf8');assert.match(html,/data-testid="glaze-ash" disabled/);for(const id of ['glaze-iron','glaze-sand','quantity','add-to-cart','cart-status'])assert(html.includes(`data-testid="${id}"`));
console.log('PASS: initial $76; Sand × 2 gives $144 and confirmation; Ash rejected; required hooks present. Source-level mocked DOM test only.');
