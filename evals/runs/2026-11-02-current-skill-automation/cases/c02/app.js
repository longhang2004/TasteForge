/* Fictional local simulation. No network or account connection. */
const fixture = {recipient:'Nguyễn Thị Minh Anh Trường', initialAmount:250, feeUSD:2.5, exchangeRateVNDPerUSD:25000, minimumUSD:1, maximumUSD:1000};
const $ = id => document.getElementById(id);
const usd = value => `USD ${value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const vnd = value => `${value.toLocaleString('en-US',{maximumFractionDigits:0})} VND`;
let attempts = 0;
let details = {recipient:fixture.recipient,amount:fixture.initialAmount};
function updateQuote(){
  const amount = Number($('amount').value);
  const valid = $('amount').value.trim() !== '' && Number.isFinite(amount) && amount >= 1 && amount <= 1000;
  $('quote-amount').textContent = valid ? usd(amount) : '—';
  $('quote-total').textContent = valid ? usd(amount+fixture.feeUSD) : '—';
  $('quote-received').textContent = valid ? vnd(amount*fixture.exchangeRateVNDPerUSD) : '— VND';
}
function fieldError(id,message){$(id+'-error').textContent=message;$(id+'-error').hidden=!message;if(message)$(id).setAttribute('aria-invalid','true');else $(id).removeAttribute('aria-invalid');}
function focusTitle(id){$(id).focus();}
$('amount').addEventListener('input',()=>{updateQuote();fieldError('amount','');});
$('recipient').addEventListener('input',()=>fieldError('recipient',''));
$('transfer-form').addEventListener('submit',event=>{
  event.preventDefault();
  const recipient=$('recipient').value.trim(); const amount=Number($('amount').value);
  const recipientError=!recipient?'Enter the recipient’s full name.':'';
  const amountError=$('amount').value.trim()===''||!Number.isFinite(amount)||amount<1||amount>1000?'Enter an amount from USD 1.00 to USD 1,000.00.':'';
  fieldError('recipient',recipientError);fieldError('amount',amountError);
  if(recipientError||amountError){$(recipientError?'recipient':'amount').focus();return;}
  details={recipient,amount};
  $('review-recipient').textContent=recipient;$('review-amount').textContent=usd(amount);$('review-total').textContent=usd(amount+fixture.feeUSD);$('review-received').textContent=vnd(amount*fixture.exchangeRateVNDPerUSD);
  $('entry-screen').hidden=true;$('review-screen').hidden=false;
  $('step-entry').removeAttribute('aria-current');$('step-review').setAttribute('aria-current','step');
  $('outcome').hidden=true;$('confirm-button').hidden=false;$('retry-button').hidden=true;$('edit-button').hidden=false;$('confirmation-note').hidden=false;
  focusTitle('review-title');
});
$('edit-button').addEventListener('click',()=>{
  $('review-screen').hidden=true;$('entry-screen').hidden=false;
  $('step-review').removeAttribute('aria-current');$('step-entry').setAttribute('aria-current','step');
  focusTitle('entry-title');
});
function confirm(){
  attempts++;
  const outcome=$('outcome');outcome.hidden=false;
  if(attempts===1){
    outcome.className='error';outcome.innerHTML='<strong>The simulation couldn’t complete.</strong><p>This is a recoverable simulated failure. Your details are saved. No money moved. Try again with the same details.</p>';
    $('confirm-button').hidden=true;$('retry-button').hidden=false;$('retry-button').focus();
  }else{
    outcome.className='success';outcome.innerHTML='<strong>Simulated transfer complete.</strong><p>Your practice transfer succeeded. No money was moved and no real account was connected.</p>';
    $('confirm-button').hidden=true;$('retry-button').hidden=true;$('edit-button').hidden=true;$('confirmation-note').hidden=true;
    $('review-title').textContent='Simulation complete.';
    $('review-title').focus();
  }
}
$('confirm-button').addEventListener('click',confirm);$('retry-button').addEventListener('click',confirm);updateQuote();
