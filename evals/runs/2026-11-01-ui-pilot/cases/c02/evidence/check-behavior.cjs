const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes={};
function element(id){return nodes[id]??=( {id,value:'',hidden:false,attributes:{},events:{},textContent:'',addEventListener(type,fn){this.events[type]=fn},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},focus(){this.focused=true},replaceChildren(...children){this.children=children},append(...children){this.children=children}});}
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/id="([^"]+)"/g))element(m[1]);
element('recipient').value='Nguyễn Thị Minh Anh Trường';element('amount').value='250';
vm.runInNewContext(fs.readFileSync('app.js','utf8'),{document:{getElementById:element,createElement:()=>element('generated-'+Math.random())},setTimeout:fn=>fn()});
const click=id=>element(id).events.click();const submit=()=>element('transfer-form').events.submit({preventDefault(){}});
assert.equal(element('sum-total').textContent,'USD 252.50');assert.equal(element('sum-receive').textContent,'VND 6,250,000');
for(const bad of ['0','1001','']){element('amount').value=bad;submit();assert.equal(element('amount').attributes['aria-invalid'],'true');assert.equal(element('recipient').value,'Nguyễn Thị Minh Anh Trường');}
element('amount').value='250';submit();assert.equal(element('review').hidden,false);assert.equal(element('review-name').textContent,'Nguyễn Thị Minh Anh Trường');
click('confirm');assert.equal(element('feedback').hidden,false);assert.match(element('feedback').textContent,/could not/);assert.equal(element('amount').value,'250');assert.equal(element('recipient').value,'Nguyễn Thị Minh Anh Trường');
click('retry');assert.equal(element('success').hidden,false);assert.match(element('success-detail').textContent,/6,250,000/);
click('new-transfer');assert.equal(element('entry').hidden,false);
console.log('PASS: default cost, receive amount, lower/upper/empty validation, recipient retention, review, recoverable first confirmation, retry success, restart. Mock DOM behavior checks; not browser rendering or keyboard verification.');
