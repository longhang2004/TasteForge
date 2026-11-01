const form = document.querySelector('#order');
const quantity = document.querySelector('#quantity');
const status = document.querySelector('#cart-status');
const variants = {iron:{name:'Iron',stock:4},sand:{name:'Sand',stock:7},ash:{name:'Ash',stock:0}};
function selection(){return {glaze:form.elements.glaze.value, count:Number(quantity.value)};}
function update(){const {count}=selection();document.querySelector('#calculation').textContent=`${count} × $68`;document.querySelector('#subtotal').textContent=`$${count*68}`;document.querySelector('#total').textContent=`$${count*68+8}`;status.textContent='';}
form.addEventListener('change',update);
form.addEventListener('submit',event=>{event.preventDefault();const {glaze,count}=selection();const variant=variants[glaze];if(!variant||!Number.isInteger(count)||count<1||count>4||count>variant.stock){status.textContent='Please choose an available glaze and a quantity from 1 to 4.';return;}status.textContent=`Added to simulated cart: ${count} × Everyday Teapot in ${variant.name}. Total $${count*68+8} USD, including $8 domestic shipping. No order has been placed.`;});
