// Northline Transfer - Money Transfer Flow (Simulated)
(function () {
  'use strict';

  // Source of truth from fixture.json
  const CONFIG = {
    brand: "Northline Transfer",
    fictional: true,
    referenceDate: "2026-11-01",
    sender: "Alex Morgan",
    sourceAccount: "Everyday USD ••1042",
    defaultRecipient: "Nguyễn Thị Minh Anh Trường",
    destination: "Việt Nam",
    sendCurrency: "USD",
    receiveCurrency: "VND",
    initialAmount: 250,
    feeUSD: 2.50,
    exchangeRateVNDPerUSD: 25000,
    minimumUSD: 1,
    maximumUSD: 1000,
    deliveryEstimate: "By 3 November 2026, illustrative estimate",
    failureScenario: "The first simulated confirmation fails recoverably. Retrying succeeds. Preserve the entered recipient and amount.",
    sampleDataDisclosure: "Simulation with fictional data. No money is moved and no real account is connected."
  };

  // Application state
  const state = {
    recipient: CONFIG.defaultRecipient,
    amount: CONFIG.initialAmount.toString(),
    step: 'entry', // 'entry' | 'review' | 'failure' | 'success'
    confirmationAttempts: 0,
    validationError: null,
    isProcessing: false
  };

  const appEl = document.getElementById('app');

  function calculateTransfer(amountVal) {
    const num = parseFloat(amountVal);
    const valid = !isNaN(num) && num >= CONFIG.minimumUSD && num <= CONFIG.maximumUSD;
    const sent = isNaN(num) ? 0 : num;
    const fee = CONFIG.feeUSD;
    const total = valid ? sent + fee : 0;
    const receivedVND = valid ? Math.round(sent * CONFIG.exchangeRateVNDPerUSD) : 0;
    return {
      isValid: valid,
      sentAmount: sent,
      fee: fee,
      totalDebited: total,
      receivedVND: receivedVND
    };
  }

  function formatUSD(amount) {
    return '$' + Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' USD';
  }

  function formatVND(amount) {
    return Number(amount).toLocaleString('en-US') + ' VND';
  }

  function render() {
    if (!appEl) return;

    if (state.step === 'entry') {
      renderEntryStep();
    } else if (state.step === 'review') {
      renderReviewStep(false);
    } else if (state.step === 'failure') {
      renderReviewStep(true);
    } else if (state.step === 'success') {
      renderSuccessStep();
    }
  }

  function renderEntryStep() {
    const calc = calculateTransfer(state.amount);

    appEl.innerHTML = `
      <div class="card form-card">
        <div class="card-header">
          <div class="step-indicator" aria-label="Step 1 of 2: Enter transfer details">
            <span class="step-badge active">1. Details</span>
            <span class="step-divider" aria-hidden="true">&rarr;</span>
            <span class="step-badge">2. Review</span>
          </div>
          <h1 class="card-title">Send money to Việt Nam</h1>
          <p class="card-subtitle">Transparent rates and guaranteed fee breakdown for occasional transfers.</p>
        </div>

        ${state.validationError ? `
          <div class="error-banner" role="alert" tabindex="-1" id="entry-error">
            <svg class="icon error-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="error-content">
              <strong>Please check your transfer details</strong>
              <p>${escapeHTML(state.validationError)}</p>
            </div>
          </div>
        ` : ''}

        <form id="transfer-entry-form" novalidate>
          <div class="account-summary-box">
            <div class="summary-row-label">Funding Account</div>
            <div class="summary-row-value">
              <strong>${escapeHTML(CONFIG.sourceAccount)}</strong>
              <span class="sender-name"> &bull; ${escapeHTML(CONFIG.sender)}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="recipient-field" class="form-label">
              Recipient full name (Việt Nam)
              <span class="required-indicator" aria-hidden="true">*</span>
            </label>
            <div class="input-wrapper">
              <input
                id="recipient-field"
                data-testid="recipient"
                class="text-input"
                type="text"
                autocomplete="name"
                required
                value="${escapeHTML(state.recipient)}"
                placeholder="e.g. Nguyễn Thị Minh Anh Trường"
                aria-describedby="recipient-hint"
              />
            </div>
            <p id="recipient-hint" class="field-hint">Supports full Vietnamese diacritics and legal names.</p>
          </div>

          <div class="form-group">
            <label for="amount-field" class="form-label">
              Amount to send (USD)
              <span class="required-indicator" aria-hidden="true">*</span>
            </label>
            <div class="amount-input-group">
              <span class="currency-prefix" aria-hidden="true">$</span>
              <input
                id="amount-field"
                data-testid="amount"
                class="text-input amount-input"
                type="number"
                step="any"
                min="${CONFIG.minimumUSD}"
                max="${CONFIG.maximumUSD}"
                required
                value="${escapeHTML(state.amount)}"
                placeholder="250.00"
                aria-describedby="amount-hint"
              />
              <span class="currency-suffix">USD</span>
            </div>
            <div id="amount-hint" class="field-hint-split">
              <span>Limit: $${CONFIG.minimumUSD}.00 &ndash; $${CONFIG.maximumUSD.toLocaleString('en-US')}.00 USD</span>
              <span class="flat-fee-pill">Flat fee: $${CONFIG.feeUSD.toFixed(2)} USD</span>
            </div>
          </div>

          <div class="breakdown-preview" aria-live="polite">
            <h2 class="preview-title">Live Transfer Summary</h2>
            <div class="preview-row">
              <span class="label">Send amount:</span>
              <span class="value" id="preview-send">${calc.isValid ? formatUSD(calc.sentAmount) : '&mdash;'}</span>
            </div>
            <div class="preview-row">
              <span class="label">Transfer fee (flat):</span>
              <span class="value" id="preview-fee">$${CONFIG.feeUSD.toFixed(2)} USD</span>
            </div>
            <div class="preview-row preview-total">
              <span class="label">Total to be debited:</span>
              <span class="value total-emphasis" id="preview-total">${calc.isValid ? formatUSD(calc.totalDebited) : '&mdash;'}</span>
            </div>
            <div class="preview-row conversion-row">
              <span class="label">Recipient receives:</span>
              <span class="value receive-emphasis" id="preview-receive">${calc.isValid ? formatVND(calc.receivedVND) : '&mdash;'}</span>
            </div>
            <div class="exchange-rate-badge">
              <span class="rate-icon">&asymp;</span> Guaranteed rate: 1 USD = 25,000 VND &bull; Estimated delivery: 3 Nov 2026
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              data-testid="review-transfer"
              class="btn btn-primary btn-block"
            >
              Continue to Review &rarr;
            </button>
          </div>
        </form>
      </div>
    `;

    bindEntryEvents();
  }

  function bindEntryEvents() {
    const form = document.getElementById('transfer-entry-form');
    const recipientInput = document.getElementById('recipient-field');
    const amountInput = document.getElementById('amount-field');

    if (!form || !recipientInput || !amountInput) return;

    // Real-time calculation update on amount input
    amountInput.addEventListener('input', (e) => {
      state.amount = e.target.value;
      updateLiveSummary();
    });

    recipientInput.addEventListener('input', (e) => {
      state.recipient = e.target.value;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentRecipient = recipientInput.value.trim();
      const currentAmountStr = amountInput.value.trim();
      const numAmount = parseFloat(currentAmountStr);

      state.recipient = recipientInput.value; // retain exactly as entered
      state.amount = currentAmountStr;

      // Validation
      if (!currentRecipient) {
        state.validationError = "Recipient name is required. Please enter a valid recipient.";
        render();
        const errBanner = document.getElementById('entry-error');
        if (errBanner) errBanner.focus();
        return;
      }

      if (isNaN(numAmount) || numAmount < CONFIG.minimumUSD || numAmount > CONFIG.maximumUSD) {
        state.validationError = `Transfer amount must be between $${CONFIG.minimumUSD}.00 and $${CONFIG.maximumUSD.toLocaleString('en-US')}.00 USD.`;
        render();
        const errBanner = document.getElementById('entry-error');
        if (errBanner) errBanner.focus();
        return;
      }

      // Valid: clear error and advance to review
      state.validationError = null;
      state.step = 'review';
      render();
    });
  }

  function updateLiveSummary() {
    const calc = calculateTransfer(state.amount);
    const sendEl = document.getElementById('preview-send');
    const totalEl = document.getElementById('preview-total');
    const receiveEl = document.getElementById('preview-receive');

    if (sendEl) sendEl.textContent = calc.isValid ? formatUSD(calc.sentAmount) : '—';
    if (totalEl) totalEl.textContent = calc.isValid ? formatUSD(calc.totalDebited) : '—';
    if (receiveEl) receiveEl.textContent = calc.isValid ? formatVND(calc.receivedVND) : '—';
  }

  function renderReviewStep(isFailureState) {
    const calc = calculateTransfer(state.amount);

    appEl.innerHTML = `
      <div class="card review-card">
        <div class="card-header">
          <div class="step-indicator" aria-label="Step 2 of 2: Review transfer details">
            <span class="step-badge done">&check; 1. Details</span>
            <span class="step-divider" aria-hidden="true">&rarr;</span>
            <span class="step-badge active">2. Review &amp; Confirm</span>
          </div>
          <h1 class="card-title">Review transfer details</h1>
          <p class="card-subtitle">Verify recipient, fees, and guaranteed payout before completing your transfer.</p>
        </div>

        ${isFailureState ? `
          <div class="status-banner status-failure" data-testid="transfer-status" role="alert" tabindex="-1" id="failure-banner">
            <div class="status-icon-wrap" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="status-text-content">
              <h2 class="status-heading">Transfer could not be processed</h2>
              <p class="status-detail">Simulated connection timeout: No funds were debited from Everyday USD &bull;&bull;1042. Your transfer details have been preserved. You can safely retry or edit.</p>
            </div>
          </div>
        ` : ''}

        <div class="review-details-table">
          <div class="review-section">
            <h2 class="section-title">Recipient &amp; Destination</h2>
            <div class="review-row" data-field="recipient">
              <span class="review-label">Recipient</span>
              <span class="review-value recipient-highlight">${escapeHTML(state.recipient)}</span>
            </div>
            <div class="review-row" data-field="destination">
              <span class="review-label">Destination</span>
              <span class="review-value">${escapeHTML(CONFIG.destination)}</span>
            </div>
            <div class="review-row" data-field="source-account">
              <span class="review-label">Funding account</span>
              <span class="review-value">${escapeHTML(CONFIG.sourceAccount)} (${escapeHTML(CONFIG.sender)})</span>
            </div>
          </div>

          <div class="review-section">
            <h2 class="section-title">Cost Breakdown</h2>
            <div class="review-row" data-field="sent-amount">
              <span class="review-label">Sent amount</span>
              <span class="review-value">${formatUSD(calc.sentAmount)}</span>
            </div>
            <div class="review-row" data-field="fee">
              <span class="review-label">Fee</span>
              <span class="review-value">$${CONFIG.feeUSD.toFixed(2)} USD</span>
            </div>
            <div class="review-row review-highlight-row" data-field="total-debited">
              <span class="review-label">Total debited</span>
              <span class="review-value total-debited-value">${formatUSD(calc.totalDebited)}</span>
            </div>
          </div>

          <div class="review-section">
            <h2 class="section-title">Delivery &amp; Conversion</h2>
            <div class="review-row" data-field="amount-received">
              <span class="review-label">Amount received</span>
              <span class="review-value received-highlight">${formatVND(calc.receivedVND)}</span>
            </div>
            <div class="review-row" data-field="exchange-rate">
              <span class="review-label">Exchange rate</span>
              <span class="review-value">1 USD = ${CONFIG.exchangeRateVNDPerUSD.toLocaleString('en-US')} VND</span>
            </div>
            <div class="review-row" data-field="delivery-estimate">
              <span class="review-label">Delivery estimate</span>
              <span class="review-value estimate-value">${escapeHTML(CONFIG.deliveryEstimate)}</span>
            </div>
          </div>
        </div>

        <div class="simulation-note-box">
          <svg class="info-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>Fictional simulation &bull; Confirming will not debit any real bank account.</span>
        </div>

        <div class="review-actions">
          <button
            type="button"
            data-testid="edit-transfer"
            id="btn-edit"
            class="btn btn-secondary"
          >
            &larr; Edit details
          </button>

          ${isFailureState ? `
            <button
              type="button"
              data-testid="retry-transfer"
              id="btn-retry"
              class="btn btn-primary"
            >
              Retry transfer
            </button>
          ` : `
            <button
              type="button"
              data-testid="confirm-transfer"
              id="btn-confirm"
              class="btn btn-primary"
            >
              Confirm transfer
            </button>
          `}
        </div>
      </div>
    `;

    bindReviewEvents(isFailureState);
  }

  function bindReviewEvents(isFailureState) {
    const editBtn = document.getElementById('btn-edit');
    const confirmBtn = document.getElementById('btn-confirm');
    const retryBtn = document.getElementById('btn-retry');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        state.validationError = null;
        state.step = 'entry';
        render();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        state.confirmationAttempts++;
        if (state.confirmationAttempts === 1) {
          // First attempt fails recoverably as contracted
          state.step = 'failure';
          render();
          const banner = document.getElementById('failure-banner');
          if (banner) banner.focus();
        } else {
          // Subsequent attempt succeeds
          state.step = 'success';
          render();
        }
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        state.confirmationAttempts++;
        state.step = 'success';
        render();
      });
    }
  }

  function renderSuccessStep() {
    const calc = calculateTransfer(state.amount);
    const simRef = "NLT-SIM-" + Math.floor(100000 + Math.random() * 900000);

    appEl.innerHTML = `
      <div class="card success-card">
        <div class="status-banner status-success" data-testid="transfer-status" role="status" tabindex="-1" id="success-banner">
          <div class="status-icon-wrap" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="status-text-content">
            <h1 class="status-heading">Transfer simulation successful</h1>
            <p class="status-detail">Alex Morgan successfully scheduled a simulated transfer of ${formatUSD(calc.sentAmount)} to ${escapeHTML(state.recipient)}.</p>
          </div>
        </div>

        <div class="receipt-box">
          <div class="receipt-header">
            <span class="receipt-badge">Simulation Receipt</span>
            <span class="receipt-ref">Ref: ${simRef}</span>
          </div>

          <div class="receipt-items">
            <div class="receipt-row">
              <span class="receipt-label">Recipient</span>
              <span class="receipt-value recipient-highlight">${escapeHTML(state.recipient)}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Amount sent</span>
              <span class="receipt-value">${formatUSD(calc.sentAmount)}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Transfer fee</span>
              <span class="receipt-value">$${CONFIG.feeUSD.toFixed(2)} USD</span>
            </div>
            <div class="receipt-row receipt-total">
              <span class="receipt-label">Total debited</span>
              <span class="receipt-value total-debited-value">${formatUSD(calc.totalDebited)}</span>
            </div>
            <div class="receipt-row receipt-highlight-row">
              <span class="receipt-label">Amount received</span>
              <span class="receipt-value received-highlight">${formatVND(calc.receivedVND)}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Delivery estimate</span>
              <span class="receipt-value">${escapeHTML(CONFIG.deliveryEstimate)}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Funding account</span>
              <span class="receipt-value">${escapeHTML(CONFIG.sourceAccount)}</span>
            </div>
          </div>
        </div>

        <div class="simulation-note-box">
          <svg class="info-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>${escapeHTML(CONFIG.sampleDataDisclosure)}</span>
        </div>

        <div class="success-actions">
          <button
            type="button"
            id="btn-reset"
            class="btn btn-secondary btn-block"
          >
            Start another simulated transfer
          </button>
        </div>
      </div>
    `;

    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.recipient = CONFIG.defaultRecipient;
        state.amount = CONFIG.initialAmount.toString();
        state.step = 'entry';
        state.confirmationAttempts = 0;
        state.validationError = null;
        render();
      });
    }

    const banner = document.getElementById('success-banner');
    if (banner) banner.focus();
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render on DOM load
  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    render();
  }
})();
