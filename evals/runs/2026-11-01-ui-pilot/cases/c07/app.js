const initial = { recipient: 'Nguyễn Thị Minh Anh Trường', amount: 250 };
const fee = 2.5;
const rate = 25000;
const form = document.querySelector('#transfer-form');
const recipientInput = document.querySelector('#recipient');
const amountInput = document.querySelector('#amount');
const entry = document.querySelector('#entry-panel');
const review = document.querySelector('#review-panel');
const result = document.querySelector('#result-panel');
const status = document.querySelector('#status');
let attempts = 0;

recipientInput.value = initial.recipient;
amountInput.value = initial.amount;
document.querySelector('#delivery-estimate').textContent = 'By 3 November 2026, illustrative estimate';

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
function setStatus(message) { status.textContent = message; status.hidden = !message; }
function showEntry() {
  setStatus('');
  entry.hidden = false; review.hidden = true; result.hidden = true;
  document.querySelector('#step-label').textContent = 'YOUR DETAILS';
  document.querySelector('#card-title').textContent = 'Where should it go?';
  document.querySelector('.step.active').innerHTML = '<i>1</i> Details';
  recipientInput.focus();
}
function showReview() {
  const recipient = recipientInput.value.trim();
  const amount = Number(amountInput.value);
  const error = document.querySelector('#error-message');
  error.hidden = true;
  if (!recipient) {
    error.textContent = 'Enter the recipient’s full name to continue.';
    error.hidden = false; recipientInput.focus(); setStatus(error.textContent); return;
  }
  if (!Number.isFinite(amount) || amount < 1 || amount > 1000) {
    error.textContent = 'Enter an amount between $1 and $1,000.';
    error.hidden = false; amountInput.focus(); setStatus(error.textContent); return;
  }
  document.querySelector('#review-recipient').textContent = recipient;
  document.querySelector('#receive-amount').textContent = new Intl.NumberFormat('vi-VN').format(amount * rate);
  document.querySelector('#send-amount').textContent = money(amount);
  document.querySelector('#fee-amount').textContent = money(fee);
  document.querySelector('#total-amount').textContent = money(amount + fee);
  entry.hidden = true; result.hidden = true; review.hidden = false;
  document.querySelector('#step-label').textContent = 'CHECK BEFORE SENDING';
  document.querySelector('#card-title').textContent = 'Your transfer summary';
  document.querySelector('.step.active').innerHTML = '<i>2</i> Review';
  document.querySelector('#confirm').focus();
  setStatus(`Reviewing ${money(amount)} plus ${money(fee)} fee for ${recipient}.`);
}
function confirmTransfer() {
  attempts += 1;
  entry.hidden = true; review.hidden = true; result.hidden = false;
  if (attempts === 1) {
    document.querySelector('#failure-result').hidden = false;
    document.querySelector('#success-result').hidden = true;
    setStatus('Simulated confirmation failed. Your details are saved; no money was moved. Retry is available.');
    document.querySelector('#retry').focus();
  } else {
    document.querySelector('#failure-result').hidden = true;
    document.querySelector('#success-result').hidden = false;
    document.querySelector('#success-recipient').textContent = recipientInput.value.trim();
    document.querySelector('#success-total').textContent = money(Number(amountInput.value) + fee);
    document.querySelector('#step-label').textContent = 'SIMULATION COMPLETE';
    document.querySelector('#card-title').textContent = 'All done';
    document.querySelector('.step.active').innerHTML = '<i>✓</i> Complete';
    setStatus('Simulated transfer confirmed. No money was moved.');
    document.querySelector('#start-over').focus();
  }
}
form.addEventListener('submit', event => { event.preventDefault(); showReview(); });
document.querySelector('#edit-transfer').addEventListener('click', showEntry);
document.querySelector('#back-to-edit').addEventListener('click', showEntry);
document.querySelector('#confirm').addEventListener('click', confirmTransfer);
document.querySelector('#retry').addEventListener('click', confirmTransfer);
document.querySelector('#return-review').addEventListener('click', () => {
  result.hidden = true; review.hidden = false; document.querySelector('#confirm').focus();
});
document.querySelector('#start-over').addEventListener('click', () => {
  attempts = 0; recipientInput.value = initial.recipient; amountInput.value = initial.amount;
  showEntry(); setStatus('New sample transfer.');
});
