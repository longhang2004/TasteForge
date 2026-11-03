const transfer = {
  brand: 'Northline Transfer',
  fictional: true,
  sender: 'Alex Morgan',
  sourceAccount: 'Everyday USD ••1042',
  recipient: 'Nguyễn Thị Minh Anh Trường',
  destination: 'Việt Nam',
  sendCurrency: 'USD',
  receiveCurrency: 'VND',
  initialAmount: 250,
  feeUSD: 2.5,
  exchangeRateVNDPerUSD: 25000,
  minimumUSD: 1,
  maximumUSD: 1000,
  deliveryEstimate: 'By 3 November 2026, illustrative estimate',
  sampleDataDisclosure: 'Simulation with fictional data. No money is moved and no real account is connected.'
};

const app = document.querySelector('#app');
let recipient = transfer.recipient;
let amount = String(transfer.initialAmount);
let step = 'entry';
let attempts = 0;
let status = null;

const icon = (name) => {
  const paths = {
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    bank: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M3 11h18M7 15h3M6 3h12l3 4H3l3-4Z"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const vnd = (value) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} ₫`;
const parsedAmount = () => Number(amount);
const total = () => parsedAmount() + transfer.feeUSD;

function shell() {
  return `<header class="topbar"><div class="topbar-inner">
    <div class="brand"><span class="brand-mark">${icon('arrow')}</span><span>${transfer.brand}</span></div>
    <div class="secure">${icon('shield')} <span>Secure transfer review</span></div>
  </div></header>
  <div class="layout">
    <section class="maincol" aria-live="polite">
      <p class="eyebrow">Send money · ${transfer.destination}</p>
      <h1>${step === 'entry' ? 'Send with confidence.' : step === 'success' ? 'Transfer complete.' : 'Review your transfer.'}</h1>
      <p class="intro">${step === 'entry' ? 'Check your recipient and amount. We’ll show the full cost before you confirm.' : step === 'success' ? 'Your simulated transfer is complete. Review the summary below.' : 'Take a moment to confirm the details and total cost before continuing.'}</p>
      <div class="steps" aria-label="Transfer progress">
        <div class="step ${step === 'entry' ? 'active' : 'done'}"><span class="step-num">${step === 'entry' ? '1' : icon('check')}</span><span>Enter details</span></div>
        <span class="step-rule"></span>
        <div class="step ${step !== 'entry' ? 'active' : ''}"><span class="step-num">2</span><span>Review &amp; confirm</span></div>
      </div>
      ${step === 'entry' ? entryCard() : reviewCard()}
    </section>
    <aside class="aside" aria-label="Transfer account and estimate">
      <div class="aside-panel">
        <h2 class="aside-title">Your transfer</h2>
        <div class="account"><span class="account-icon">${icon('bank')}</span><div><div class="account-label">Sending from</div><div class="account-name">${transfer.sourceAccount}</div></div></div>
        <div class="aside-row"><span>Delivery estimate</span><strong>By 3 Nov</strong></div>
        <div class="aside-row"><span>Exchange rate</span><strong>1 USD = 25,000 VND</strong></div>
        <div class="aside-note">${transfer.deliveryEstimate}</div>
      </div>
      <div class="disclosure">${icon('shield')}<span>${transfer.sampleDataDisclosure}</span></div>
    </aside>
  </div>
  <footer class="footer"><span>© 2026 ${transfer.brand}</span><span>Illustrative sample experience</span></footer>`;
}

function entryCard() {
  const invalid = status?.kind === 'validation';
  return `<div class="card">
    <div class="card-head"><div><h2 class="card-title">Transfer details</h2><p class="card-subtitle">Enter where you’re sending money and how much.</p></div></div>
    <div class="field">
      <div class="label-row"><label for="recipient">Recipient’s full name</label></div>
      <div class="input-wrap">${icon('person')}<input id="recipient" data-testid="recipient" type="text" autocomplete="name" maxlength="120" value="${escapeHTML(recipient)}" aria-describedby="recipient-note"></div>
      <p class="under-note" id="recipient-note">Enter the name exactly as it appears on their bank account.</p>
    </div>
    <div class="field">
      <div class="label-row"><label for="amount">You send</label><span class="optional">Limit ${money(transfer.minimumUSD)}–${money(transfer.maximumUSD)}</span></div>
      <div class="input-wrap amount-wrap"><span class="currency">USD</span><input id="amount" data-testid="amount" type="number" min="${transfer.minimumUSD}" max="${transfer.maximumUSD}" step="0.01" inputmode="decimal" value="${escapeHTML(amount)}" aria-describedby="amount-note"></div>
      <p class="under-note" id="amount-note">${money(transfer.feeUSD)} transfer fee is added to your amount. No hidden fees.</p>
    </div>
    <div class="field">
      <div class="label-row"><label>Sending to</label></div>
      <div class="destination"><span class="destination-main"><span class="flag" aria-hidden="true">★</span><span>${transfer.destination}</span></span><span class="dest-currency">Receives in ${transfer.receiveCurrency}</span></div>
    </div>
    <div class="inline-error ${invalid ? 'show' : ''}" data-testid="transfer-status" role="alert">${invalid ? escapeHTML(status.message) : ''}</div>
    <div class="form-actions"><span class="form-hint">${icon('shield')} Total cost shown before confirmation</span><button class="primary" type="button" data-testid="review-transfer">Review transfer ${icon('arrow')}</button></div>
  </div>`;
}

function reviewCard() {
  const isFailure = status?.kind === 'failure';
  const isSuccess = step === 'success';
  const amountValue = parsedAmount();
  const received = amountValue * transfer.exchangeRateVNDPerUSD;
  return `<div class="card">
    <div class="card-head"><div><h2 class="card-title">${isSuccess ? 'Transfer summary' : 'Review details'}</h2><p class="card-subtitle">${isSuccess ? 'This is a simulated transfer record.' : 'Please make sure everything looks right.'}</p></div></div>
    ${isFailure ? `<div class="status show error" data-testid="transfer-status" role="alert"><div class="status-title">${icon('alert')} Transfer not completed</div>Something went wrong in this simulation. Your details are saved. Try again when you’re ready.</div>` : ''}
    ${isSuccess ? `<div class="status show success" data-testid="transfer-status" role="status"><div class="status-title">${icon('check')} Simulated transfer successful</div>No money was moved. This sample app is not connected to a real account.</div>` : ''}
    <div class="recipient-card"><div class="recipient-top"><div><p class="recipient-label">Recipient</p><h3 class="recipient-name">${escapeHTML(recipient)}</h3><div class="country"><span class="flag" aria-hidden="true">★</span> ${transfer.destination}</div></div></div></div>
    <div class="review-amount"><div><p class="review-caption">You send</p><p class="review-big">${money(amountValue)} <span style="font-size:12px;font-weight:600">USD</span></p></div><div class="receive"><p class="review-caption">Recipient gets</p><p class="review-big">${vnd(received)}</p></div></div>
    <div class="breakdown">
      <div class="row"><span class="row-label">Transfer amount</span><strong>${money(amountValue)} USD</strong></div>
      <div class="row"><span class="row-label">Transfer fee</span><strong>${money(transfer.feeUSD)} USD</strong></div>
      <div class="row total"><span class="row-label">Total debited</span><strong>${money(total())} USD</strong></div>
      <div class="row"><span class="row-label">Exchange rate</span><strong>1 USD = 25,000 VND</strong></div>
      <div class="estimate">${icon('clock')} Estimated delivery: <strong>${transfer.deliveryEstimate}</strong></div>
    </div>
    <div class="review-actions">
      ${isSuccess ? '<span class="form-hint">' + icon('check') + ' No money was moved</span>' : '<button class="secondary" type="button" data-testid="edit-transfer">Edit details</button>'}
      ${isFailure ? `<button class="primary" type="button" data-testid="retry-transfer">Try again ${icon('arrow')}</button>` : isSuccess ? '' : `<button class="primary" type="button" data-testid="confirm-transfer">Confirm simulated transfer ${icon('arrow')}</button>`}
    </div>
  </div>`;
}

function render() {
  app.innerHTML = shell();
  const recipientInput = app.querySelector('[data-testid="recipient"]');
  const amountInput = app.querySelector('[data-testid="amount"]');
  if (recipientInput) recipientInput.addEventListener('input', (event) => { recipient = event.target.value; });
  if (amountInput) amountInput.addEventListener('input', (event) => { amount = event.target.value; });
  app.querySelector('[data-testid="review-transfer"]')?.addEventListener('click', () => {
    const value = parsedAmount();
    if (!recipient.trim()) {
      status = { kind: 'validation', message: 'Please enter the recipient’s full name.' };
      render(); app.querySelector('[data-testid="recipient"]').focus(); return;
    }
    if (!Number.isFinite(value) || value < transfer.minimumUSD || value > transfer.maximumUSD) {
      status = { kind: 'validation', message: `Enter an amount from ${money(transfer.minimumUSD)} to ${money(transfer.maximumUSD)}. Your other details are saved.` };
      render(); app.querySelector('[data-testid="amount"]').focus(); return;
    }
    status = null; step = 'review'; render();
  });
  app.querySelectorAll('[data-testid="edit-transfer"]').forEach((button) => button.addEventListener('click', () => { status = null; step = 'entry'; render(); app.querySelector('[data-testid="amount"]').focus(); }));
  const confirm = app.querySelector('[data-testid="confirm-transfer"]');
  const retry = app.querySelector('[data-testid="retry-transfer"]');
  const runAttempt = () => {
    attempts += 1;
    if (attempts === 1) { status = { kind: 'failure' }; render(); }
    else { status = { kind: 'success' }; step = 'success'; render(); }
  };
  confirm?.addEventListener('click', runAttempt);
  retry?.addEventListener('click', runAttempt);
}

render();
