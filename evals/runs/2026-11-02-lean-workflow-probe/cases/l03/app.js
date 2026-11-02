/**
 * Northline Transfer — Simulated Money Transfer Review Flow
 * Follows fixture.json contract and task.md requirements.
 */

(function () {
  'use strict';

  const FIXTURE = {
    brand: "Northline Transfer",
    fictional: true,
    referenceDate: "2026-11-01",
    sender: "Alex Morgan",
    sourceAccount: "Everyday USD ••1042",
    recipient: "Nguyễn Thị Minh Anh Trường",
    destination: "Việt Nam",
    sendCurrency: "USD",
    receiveCurrency: "VND",
    initialAmount: 250,
    feeUSD: 2.5,
    exchangeRateVNDPerUSD: 25000,
    minimumUSD: 1,
    maximumUSD: 1000,
    deliveryEstimate: "By 3 November 2026, illustrative estimate",
    failureScenario: "The first simulated confirmation fails recoverably. Retrying succeeds. Preserve the entered recipient and amount.",
    sampleDataDisclosure: "Simulation with fictional data. No money is moved and no real account is connected."
  };

  const state = {
    step: 'entry', // 'entry' | 'review' | 'success'
    recipient: FIXTURE.recipient,
    amount: String(FIXTURE.initialAmount),
    feeUSD: FIXTURE.feeUSD,
    exchangeRate: FIXTURE.exchangeRateVNDPerUSD,
    deliveryEstimate: FIXTURE.deliveryEstimate,
    confirmAttempts: 0,
    hasFailed: false,
    validationError: null,
    statusFeedback: null
  };

  const appEl = document.getElementById('app');

  function formatUSD(num) {
    return '$' + Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
  }

  function formatVND(num) {
    return Number(num).toLocaleString('en-US') + ' VND';
  }

  function calculate(amountNum) {
    const fee = state.feeUSD;
    const totalDebited = amountNum + fee;
    const amountReceived = amountNum * state.exchangeRate;
    return {
      fee,
      totalDebited,
      amountReceived
    };
  }

  function validate() {
    const trimmed = (state.recipient || '').trim();
    if (!trimmed) {
      return { valid: false, error: 'Please enter a valid recipient name.' };
    }
    const num = parseFloat(state.amount);
    if (isNaN(num) || num < FIXTURE.minimumUSD || num > FIXTURE.maximumUSD) {
      return {
        valid: false,
        error: `Transfer amount must be between $${FIXTURE.minimumUSD}.00 and $${FIXTURE.maximumUSD}.00 USD.`
      };
    }
    return { valid: true, amountNum: num, recipient: trimmed };
  }

  function render() {
    if (state.step === 'entry') {
      renderEntry();
    } else if (state.step === 'review') {
      renderReview();
    } else if (state.step === 'success') {
      renderSuccess();
    }
  }

  function renderStepper(currentStep) {
    return `
      <nav class="stepper" aria-label="Transfer progress">
        <div class="step-indicator ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}">
          <span class="step-circle" aria-hidden="true">${currentStep > 1 ? '✓' : '1'}</span>
          <span class="step-label">Details</span>
        </div>
        <div class="step-divider" aria-hidden="true"></div>
        <div class="step-indicator ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}">
          <span class="step-circle" aria-hidden="true">${currentStep > 2 ? '✓' : '2'}</span>
          <span class="step-label">Review & Confirm</span>
        </div>
      </nav>
    `;
  }

  function renderEntry() {
    const rawNum = parseFloat(state.amount);
    const validNum = !isNaN(rawNum) && rawNum >= FIXTURE.minimumUSD && rawNum <= FIXTURE.maximumUSD ? rawNum : FIXTURE.initialAmount;
    const calc = calculate(validNum);

    appEl.innerHTML = `
      ${renderStepper(1)}

      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Send money to Việt Nam</h1>
          <p class="card-subtitle">Fast, transparent simulated transfers with guaranteed upfront rates.</p>
        </div>

        ${state.validationError ? `
          <div class="status-box status-error" data-testid="transfer-status" role="alert">
            <div class="status-headline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Invalid input</span>
            </div>
            <p class="status-message">${state.validationError}</p>
          </div>
        ` : ''}

        <form id="transfer-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="recipient-input">Recipient full name</label>
            <input
              id="recipient-input"
              class="form-input ${state.validationError && !state.recipient.trim() ? 'has-error' : ''}"
              type="text"
              name="recipient"
              data-testid="recipient"
              value="${escapeHtml(state.recipient)}"
              placeholder="e.g. Nguyễn Thị Minh Anh Trường"
              autocomplete="off"
              required
            />
            <p class="form-hint">Destination country: Việt Nam. Supports full Vietnamese diacritics.</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="amount-input">You send (USD)</label>
            <div class="input-currency-wrapper">
              <span class="currency-prefix" aria-hidden="true">$</span>
              <input
                id="amount-input"
                class="form-input ${state.validationError && (isNaN(rawNum) || rawNum < 1 || rawNum > 1000) ? 'has-error' : ''}"
                type="number"
                step="any"
                min="1"
                max="1000"
                name="amount"
                data-testid="amount"
                value="${escapeHtml(state.amount)}"
                placeholder="250.00"
                required
              />
              <span class="currency-suffix" aria-hidden="true">USD</span>
            </div>
            <p class="form-hint">Allowed range: $1.00 USD to $1,000.00 USD per simulated transfer.</p>
          </div>

          <!-- Upfront visible fee calculation breakdown -->
          <div class="calc-preview" aria-live="polite">
            <div class="calc-title">
              <span>Upfront Cost Breakdown</span>
              <span style="font-weight: 500; font-size: 0.8rem; color: var(--tf-color-muted);">Guaranteed fee</span>
            </div>
            <div class="calc-row">
              <span>Transfer fee (flat)</span>
              <span class="calc-value">${formatUSD(calc.fee)}</span>
            </div>
            <div class="calc-row">
              <span>Exchange rate</span>
              <span class="calc-value">1 USD = 25,000 VND</span>
            </div>
            <div class="calc-row highlight">
              <span>Total you pay (debited)</span>
              <span class="calc-value" id="calc-preview-total">${formatUSD(calc.totalDebited)}</span>
            </div>
            <div class="calc-row receive-highlight">
              <span>Recipient receives (est.)</span>
              <span class="calc-value" id="calc-preview-received">${formatVND(calc.amountReceived)}</span>
            </div>
          </div>

          <div class="action-group">
            <button type="submit" class="btn btn-primary" data-testid="review-transfer">
              Review Transfer
            </button>
          </div>

          <div class="security-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Simulation mode: Review step lets you inspect all fees and exchange rates before confirming.</span>
          </div>
        </form>
      </div>
    `;

    // Bind event listeners
    const form = document.getElementById('transfer-form');
    const recipientInput = document.getElementById('recipient-input');
    const amountInput = document.getElementById('amount-input');

    recipientInput.addEventListener('input', (e) => {
      state.recipient = e.target.value;
      if (state.validationError) {
        state.validationError = null;
      }
    });

    amountInput.addEventListener('input', (e) => {
      state.amount = e.target.value;
      if (state.validationError) {
        state.validationError = null;
      }
      // Update live preview
      const num = parseFloat(e.target.value);
      if (!isNaN(num) && num >= FIXTURE.minimumUSD && num <= FIXTURE.maximumUSD) {
        const c = calculate(num);
        const totalEl = document.getElementById('calc-preview-total');
        const recvEl = document.getElementById('calc-preview-received');
        if (totalEl) totalEl.textContent = formatUSD(c.totalDebited);
        if (recvEl) recvEl.textContent = formatVND(c.amountReceived);
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = validate();
      if (!res.valid) {
        state.validationError = res.error;
        renderEntry();
        const errBanner = document.querySelector('.status-box.status-error');
        if (errBanner) {
          errBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }
      state.validationError = null;
      state.step = 'review';
      render();
    });
  }

  function renderReview() {
    const num = parseFloat(state.amount) || FIXTURE.initialAmount;
    const calc = calculate(num);

    appEl.innerHTML = `
      ${renderStepper(2)}

      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Review transfer details</h1>
          <p class="card-subtitle">Verify recipient, fees, and total debit before completing your simulated transfer.</p>
        </div>

        ${state.hasFailed ? `
          <div class="status-box status-error" data-testid="transfer-status" role="alert">
            <div class="status-headline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span>Transfer failed (Simulated network timeout)</span>
            </div>
            <p class="status-message">
              The simulated transfer connection timed out. No money has been moved and your details are preserved.
            </p>
            <p class="status-note">
              You can retry the transfer now or edit the details if needed.
            </p>
          </div>
        ` : ''}

        <div class="review-section">
          <ul class="review-list">
            <li class="review-item">
              <span class="review-label">Recipient</span>
              <span class="review-value recipient-name">${escapeHtml(state.recipient)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Destination</span>
              <span class="review-value">Việt Nam</span>
            </li>
            <li class="review-item">
              <span class="review-label">Source account</span>
              <span class="review-value">${escapeHtml(FIXTURE.sourceAccount)} (${escapeHtml(FIXTURE.sender)})</span>
            </li>
            <li class="review-item">
              <span class="review-label">Sent amount</span>
              <span class="review-value">${formatUSD(num)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Transfer fee</span>
              <span class="review-value">${formatUSD(calc.fee)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Exchange rate</span>
              <span class="review-value">1 USD = 25,000 VND</span>
            </li>
            <li class="review-item emphasis">
              <span class="review-label">Total debited</span>
              <span class="review-value">${formatUSD(calc.totalDebited)}</span>
            </li>
            <li class="review-item payout">
              <span class="review-label">Amount received</span>
              <span class="review-value">${formatVND(calc.amountReceived)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Delivery estimate</span>
              <span class="review-value">${escapeHtml(state.deliveryEstimate)}</span>
            </li>
          </ul>
        </div>

        <div class="action-group action-row">
          ${state.hasFailed ? `
            <button type="button" class="btn btn-primary" id="btn-retry" data-testid="retry-transfer">
              Retry Transfer
            </button>
          ` : `
            <button type="button" class="btn btn-primary" id="btn-confirm" data-testid="confirm-transfer">
              Confirm Transfer
            </button>
          `}
          <button type="button" class="btn btn-secondary" id="btn-edit" data-testid="edit-transfer">
            Edit details
          </button>
        </div>

        <div class="security-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>${escapeHtml(FIXTURE.sampleDataDisclosure)}</span>
        </div>
      </div>
    `;

    // Event bindings
    const btnConfirm = document.getElementById('btn-confirm');
    const btnRetry = document.getElementById('btn-retry');
    const btnEdit = document.getElementById('btn-edit');

    if (btnConfirm) {
      btnConfirm.addEventListener('click', handleConfirm);
    }
    if (btnRetry) {
      btnRetry.addEventListener('click', handleRetry);
    }
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        state.step = 'entry';
        state.validationError = null;
        render();
      });
    }
  }

  function handleConfirm() {
    state.confirmAttempts++;
    if (state.confirmAttempts === 1) {
      // First confirmation must return a recoverable simulated failure
      state.hasFailed = true;
      render();
      const statusBox = document.querySelector('[data-testid="transfer-status"]');
      if (statusBox) {
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // Retry succeeds
      state.hasFailed = false;
      state.step = 'success';
      render();
    }
  }

  function handleRetry() {
    state.confirmAttempts++;
    state.hasFailed = false;
    state.step = 'success';
    render();
  }

  function renderSuccess() {
    const num = parseFloat(state.amount) || FIXTURE.initialAmount;
    const calc = calculate(num);

    appEl.innerHTML = `
      <nav class="stepper" aria-label="Transfer progress">
        <div class="step-indicator completed">
          <span class="step-circle" aria-hidden="true">✓</span>
          <span class="step-label">Details</span>
        </div>
        <div class="step-divider" aria-hidden="true"></div>
        <div class="step-indicator completed">
          <span class="step-circle" aria-hidden="true">✓</span>
          <span class="step-label">Confirmed</span>
        </div>
      </nav>

      <div class="card">
        <div class="status-box status-success" data-testid="transfer-status" role="status">
          <div class="status-headline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Simulated transfer submitted successfully!</span>
          </div>
          <p class="status-message">
            Your simulated transfer of <strong>${formatUSD(num)}</strong> to <strong>${escapeHtml(state.recipient)}</strong> has been scheduled.
          </p>
          <p class="status-note">
            Simulation Reference: <strong>SIM-20261101-7294</strong> • No real money was debited or transferred.
          </p>
        </div>

        <div class="review-section">
          <ul class="review-list">
            <li class="review-item">
              <span class="review-label">Recipient</span>
              <span class="review-value recipient-name">${escapeHtml(state.recipient)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Destination</span>
              <span class="review-value">Việt Nam</span>
            </li>
            <li class="review-item">
              <span class="review-label">Source account</span>
              <span class="review-value">${escapeHtml(FIXTURE.sourceAccount)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Sent amount</span>
              <span class="review-value">${formatUSD(num)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Transfer fee</span>
              <span class="review-value">${formatUSD(calc.fee)}</span>
            </li>
            <li class="review-item emphasis">
              <span class="review-label">Total debited</span>
              <span class="review-value">${formatUSD(calc.totalDebited)}</span>
            </li>
            <li class="review-item payout">
              <span class="review-label">Amount received</span>
              <span class="review-value">${formatVND(calc.amountReceived)}</span>
            </li>
            <li class="review-item">
              <span class="review-label">Delivery estimate</span>
              <span class="review-value">${escapeHtml(state.deliveryEstimate)}</span>
            </li>
          </ul>
        </div>

        <div class="action-group">
          <button type="button" class="btn btn-secondary" id="btn-reset">
            Start new simulated transfer
          </button>
        </div>

        <div class="security-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>${escapeHtml(FIXTURE.sampleDataDisclosure)}</span>
        </div>
      </div>
    `;

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.step = 'entry';
        state.recipient = FIXTURE.recipient;
        state.amount = String(FIXTURE.initialAmount);
        state.confirmAttempts = 0;
        state.hasFailed = false;
        state.validationError = null;
        render();
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
