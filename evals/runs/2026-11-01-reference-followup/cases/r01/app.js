(() => {
  'use strict';
  // Local fictional fixture values; no network or account connections.
  const fee = 2.5, rate = 25000;
  const $ = id => document.getElementById(id);
  const usd = n => 'USD ' + n.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
  const vnd = n => (n * rate).toLocaleString('en-US', {maximumFractionDigits:0}) + ' VND';
  let attempted = false;
  let pending = false;
  const value = () => Number($('amount').value);
  function preview() {
    const n = value(), valid = $('amount').value !== '' && Number.isFinite(n) && n >= 1 && n <= 1000;
    $('entry-total').textContent = valid ? usd(n + fee) : '—';
    $('entry-receive').textContent = valid ? vnd(n) : '—';
  }
  function error(id, message) {
    $(id + '-error').textContent = message;
    $(id + '-error').hidden = !message;
    $(id).setAttribute('aria-invalid', String(!!message));
  }
  function edit(target = 'recipient') {
    if(pending) return;
    $('review').hidden = true; $('entry').hidden = false;
    $('step-one').setAttribute('aria-current', 'step'); $('step-two').removeAttribute('aria-current');
    $(target).focus();
  }
  $('amount').addEventListener('input', () => {preview(); error('amount', '');});
  $('recipient').addEventListener('input', () => error('recipient', ''));
  $('transfer-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('recipient').value.trim(), n = value();
    const badName = !name;
    const badAmount = !$('amount').value || !Number.isFinite(n) || n < 1 || n > 1000 || !Number.isInteger(Math.round(n * 1e8) / 1e6);
    error('recipient', badName ? 'Enter the recipient’s full name.' : '');
    error('amount', badAmount ? 'Enter an amount from USD 1.00 to USD 1,000.00, with up to two decimal places.' : '');
    if(badName || badAmount) {$(badName ? 'recipient' : 'amount').focus(); return;}
    $('review-recipient').textContent = name;
    $('review-amount').textContent = usd(n); $('review-total').textContent = usd(n + fee); $('review-receive').textContent = vnd(n);
    $('entry').hidden = true; $('review').hidden = false;
    $('transfer-status').hidden = true;
    $('confirm').hidden = false; $('retry').hidden = true; $('review-actions').hidden = false; $('restart').hidden = true;
    $('step-two').setAttribute('aria-current','step'); $('step-one').removeAttribute('aria-current');
    $('review-title').textContent = 'Check before you confirm'; $('review-title').focus();
  });
  function confirm() {
    if(pending) return;
    pending = true;
    ['confirm','retry','edit','edit-recipient'].forEach(id => $(id).disabled = true);
    const status = $('transfer-status'); status.hidden = false; status.className = ''; status.textContent = 'Running your simulation…';
    window.setTimeout(() => {
      pending = false;
      ['confirm','retry','edit','edit-recipient'].forEach(id => $(id).disabled = false);
      if(!attempted) {
        attempted = true;
        status.innerHTML = '<strong>Simulation couldn’t complete</strong>This is a simulated temporary failure. Your details are saved. No money was moved. Try again with the same details, or edit your transfer.';
        $('confirm').hidden = true; $('retry').hidden = false;
      } else {
        status.className = 'success';
        status.innerHTML = '<strong>Simulated transfer complete</strong>No money was moved. This was a fictional transfer; no real delivery is scheduled.';
        $('review-title').textContent = 'Simulation complete';
        $('review-actions').hidden = true; $('restart').hidden = false; $('edit-recipient').hidden = true;
      }
      status.focus();
    }, 550);
  }
  $('confirm').addEventListener('click', confirm); $('retry').addEventListener('click', confirm);
  $('edit').addEventListener('click', () => edit()); $('edit-recipient').addEventListener('click', () => edit());
  $('restart').addEventListener('click', () => {attempted = false; $('edit-recipient').hidden = false; edit();});
  preview();
})();
