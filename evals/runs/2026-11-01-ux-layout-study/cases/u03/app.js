const form=document.querySelector('#purchase-form');
const quantity=document.querySelector('#quantity');
const money=value=>`USD ${value.toFixed(2)}`;
function update(){const count=Number(quantity.value);document.querySelector('#subtotal-label').textContent=`${count} ${count===1?'piece':'pieces'}`;document.querySelector('#subtotal').textContent=money(count*68);document.querySelector('#total').textContent=money(count*68+8);document.querySelector('#cart-status').textContent='';}
quantity.addEventListener('change',update);quantity.addEventListener('input',update);
form.addEventListener('change',event=>{if(event.target.name==='glaze')document.querySelector('#cart-status').textContent='';});
form.addEventListener('submit',event=>{event.preventDefault();const glaze=form.elements.glaze.value;const count=Number(quantity.value);if(!['iron','sand'].includes(glaze)||!Number.isInteger(count)||count<1||count>4)return;document.querySelector('#cart-status').textContent=`Added to your simulated cart: ${count} × Everyday Teapot in ${glaze==='iron'?'Iron':'Sand'}. Total including shipping: ${money(count*68+8)}. No order has been placed.`;});
