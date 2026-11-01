const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const nodes = {};
const html = fs.readFileSync('index.html','utf8');
for(const match of html.matchAll(/id="([^"]+)"/g)) nodes[match[1]] = {value:'',hidden:false,textContent:'',className:'',disabled:false,handlers:{},attributes:{},addEventListener(t,f){this.handlers[t]=f},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},focus(){this.focused=true}};
nodes.recipient.value='Nguyễn Thị Minh Anh Trường'; nodes.amount.value='250';
const timers=[];
vm.runInNewContext(fs.readFileSync('app.js','utf8'),{document:{getElementById:id=>nodes[id]},window:{setTimeout:f=>timers.push(f)}});
const submit=()=>nodes['transfer-form'].handlers.submit({preventDefault(){}});
assert.equal(nodes['entry-total'].textContent,'USD 252.50');
assert.equal(nodes['entry-receive'].textContent,'6,250,000 VND');
for(const amount of ['0','1001','', '1.234']){nodes.amount.value=amount;submit();assert.equal(nodes.amount.attributes['aria-invalid'],'true');assert.equal(nodes.recipient.value,'Nguyễn Thị Minh Anh Trường')}
for(const amount of ['1','1000','250.01']){nodes.amount.value=amount;submit();assert.equal(nodes.amount.attributes['aria-invalid'],'false')}
nodes.recipient.value='';submit();assert.equal(nodes.recipient.attributes['aria-invalid'],'true');
nodes.recipient.value='Nguyễn Thị Minh Anh Trường';nodes.amount.value='250';submit();
assert.equal(nodes['review-total'].textContent,'USD 252.50');assert.equal(nodes['review-recipient'].textContent,nodes.recipient.value);
nodes.confirm.handlers.click();assert.equal(nodes.confirm.disabled,true);timers.shift()();
assert.match(nodes['transfer-status'].innerHTML,/temporary failure/);assert.equal(nodes.retry.hidden,false);
nodes.edit.handlers.click();assert.equal(nodes.amount.value,'250');assert.equal(nodes.recipient.value,'Nguyễn Thị Minh Anh Trường');submit();
nodes.confirm.handlers.click();timers.shift()();assert.match(nodes['transfer-status'].innerHTML,/Simulated transfer complete/);assert.equal(nodes['review-actions'].hidden,true);
for(const hook of ['recipient','amount','review-transfer','confirm-transfer','retry-transfer','transfer-status']) assert.ok(html.includes('data-testid="'+hook+'"'));
assert.ok(!/https?:\/\//.test(html + fs.readFileSync('styles.css','utf8') + fs.readFileSync('app.js','utf8')));
console.log('PASS: arithmetic, bounds, blank name, precision, preserved values, edit, pending, first failure, next success, hooks, local-only source. DOM stub, not browser rendering.');
