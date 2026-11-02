// Source-level handler checks with a minimal DOM stub, not a browser test.
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');const elements=new Map();
for(const match of html.matchAll(/id="([^"]+)"/g))elements.set(match[1],{value:'',hidden:false,textContent:'',innerHTML:'',className:'',attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},addEventListener(k,fn){this.handlers[k]=fn},focus(){this.focused=true}});
const get=id=>elements.get(id);get('recipient').value='Nguyễn Thị Minh Anh Trường';get('amount').value='250';
vm.runInNewContext(fs.readFileSync('app.js','utf8'),{document:{getElementById:get},console});
const click=id=>get(id).handlers.click();const submit=()=>get('transfer-form').handlers.submit({preventDefault(){}});
assert.equal(get('quote-total').textContent,'USD 252.50');assert.equal(get('quote-received').textContent,'6,250,000 VND');
for(const invalid of ['0','1001','']){get('amount').value=invalid;submit();assert.equal(get('amount').attrs['aria-invalid'],'true');assert.equal(get('recipient').value,'Nguyễn Thị Minh Anh Trường');}
get('amount').value='250';submit();assert.equal(get('review-recipient').textContent,'Nguyễn Thị Minh Anh Trường');assert.equal(get('review-total').textContent,'USD 252.50');
click('edit-button');assert.equal(get('amount').value,'250');assert.equal(get('recipient').value,'Nguyễn Thị Minh Anh Trường');
get('amount').value='400';submit();assert.equal(get('review-total').textContent,'USD 402.50');assert.equal(get('review-received').textContent,'10,000,000 VND');
click('confirm-button');assert.equal(get('outcome').className,'error');assert.equal(get('retry-button').hidden,false);assert.equal(get('amount').value,'400');
click('retry-button');assert.equal(get('outcome').className,'success');assert.match(get('outcome').innerHTML,/No money was moved/);assert.equal(get('retry-button').hidden,true);
console.log('PASS: initial totals, below/above/empty validation, retained recipient, review, retained edit, recalculated USD 400 values, first failure, retry success. Minimal DOM stub only; no browser keyboard/accessibility validation.');
