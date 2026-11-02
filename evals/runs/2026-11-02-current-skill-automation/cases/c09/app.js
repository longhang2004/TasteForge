/**
 * Northline Transfer — Simulated Money Transfer Review Flow
 * Case C09 Evaluation Implementation
 */

(function () {
  'use strict';

  // Source of truth matching fixture.json
  const CONFIG = {
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

  // State management
  const state = {
    recipient: CONFIG.recipient,
    amount: CONFIG.initialAmount,
    confirmAttempts: 0,
    step: 'entry' // 'entry' | 'review'
  };

  // DOM Elements
  const stepEntry = document.getElementById('step-entry');
  const stepReview = document.getElementById('step-review');
  const navStep1 = document.getElementById('nav-step-1');
  const navStep2 = document.getElementById('nav-step-2');

  const entryForm = document.getElementById('entry-form');
  const recipientInput = document.getElementById('recipient-input');
  const amountInput = document.getElementById('amount-input');
  const recipientError = document.getElementById('recipient-error');
  const amountError = document.getElementById('amount-error');
  const entryFeedbackSlot = document.getElementById('entry-feedback-slot');

  const entryLiveSent = document.getElementById('entry-live-sent');
  const entryLiveFee = document.getElementById('entry-live-fee');
  const entryLiveTotal = document.getElementById('entry-live-total');
  const entryLiveRate = document.getElementById('entry-live-rate');
  const entryLiveReceived = document.getElementById('entry-live-received');
  const entryLiveEstimate = document.getElementById('entry-live-estimate');

  const reviewFeedbackSlot = document.getElementById('review-feedback-slot');
  const reviewStageTag = document.getElementById('review-stage-tag');
  const reviewRecipientVal = document.getElementById('review-recipient-val');
  const reviewSentVal = document.getElementById('review-sent-val');
  const reviewFeeVal = document.getElementById('review-fee-val');
  const reviewTotalVal = document.getElementById('review-total-val');
  const reviewReceivedVal = document.getElementById('review-received-val');
  const reviewEstimateVal = document.getElementById('review-estimate-val');

  const btnEditDetails = document.getElementById('btn-edit-details');
  const btnConfirmTransfer = document.getElementById('btn-confirm-transfer');
  const reviewActions = document.getElementById('review-actions');

  // Formatters
  function formatUSD(amount) {
    if (isNaN(amount) || amount === null) return '$0.00 USD';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }

  function formatVND(amount) {
    if (isNaN(amount) || amount === null) return '0 VND';
    return `${Math.round(amount).toLocaleString('en-US')} VND`;
  }

  // Update live calculation box in entry step
  function updateEntryLiveCalculations() {
    const rawVal = parseFloat(amountInput.value);
    const isValidAmount = !isNaN(rawVal) && rawVal >= CONFIG.minimumUSD && rawVal <= CONFIG.maximumUSD;

    if (isValidAmount) {
      const fee = CONFIG.feeUSD;
      const total = rawVal + fee;
      const received = rawVal * CONFIG.exchangeRateVNDPerUSD;

      entryLiveSent.textContent = formatUSD(rawVal);
      entryLiveFee.textContent = formatUSD(fee);
      entryLiveTotal.textContent = formatUSD(total);
      entryLiveRate.textContent = `1 USD = ${CONFIG.exchangeRateVNDPerUSD.toLocaleString('en-US')} VND`;
      entryLiveReceived.textContent = formatVND(received);
      entryLiveEstimate.textContent = CONFIG.deliveryEstimate;
    } else if (!isNaN(rawVal) && rawVal > 0) {
      // Show calculated values even if out of range, for transparency
      const fee = CONFIG.feeUSD;
      entryLiveSent.textContent = formatUSD(rawVal);
      entryLiveFee.textContent = formatUSD(fee);
      entryLiveTotal.textContent = formatUSD(rawVal + fee);
      entryLiveRate.textContent = `1 USD = ${CONFIG.exchangeRateVNDPerUSD.toLocaleString('en-US')} VND`;
      entryLiveReceived.textContent = formatVND(rawVal * CONFIG.exchangeRateVNDPerUSD);
      entryLiveEstimate.textContent = CONFIG.deliveryEstimate;
    }
  }

  // Validation
  function validateEntryForm() {
    let isValid = true;
    recipientError.innerHTML = '';
    amountError.innerHTML = '';
    entryFeedbackSlot.innerHTML = '';
    recipientInput.classList.remove('input-error');
    amountInput.classList.remove('input-error');

    const trimmedRecipient = recipientInput.value.trim();
    if (!trimmedRecipient) {
      isValid = false;
      recipientInput.classList.add('input-error');
      recipientError.textContent = 'Please enter a recipient name.';
      recipientInput.setAttribute('aria-invalid', 'true');
    } else {
      recipientInput.removeAttribute('aria-invalid');
    }

    const rawAmount = amountInput.value.trim();
    const parsedAmount = parseFloat(rawAmount);

    if (rawAmount === '' || isNaN(parsedAmount)) {
      isValid = false;
      amountInput.classList.add('input-error');
      amountError.textContent = 'Please enter a valid transfer amount.';
      amountInput.setAttribute('aria-invalid', 'true');
    } else if (parsedAmount < CONFIG.minimumUSD || parsedAmount > CONFIG.maximumUSD) {
      isValid = false;
      amountInput.classList.add('input-error');
      amountError.textContent = `Amount must be between $${CONFIG.minimumUSD.toFixed(2)} and $${CONFIG.maximumUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`;
      amountInput.setAttribute('aria-invalid', 'true');
    } else {
      amountInput.removeAttribute('aria-invalid');
    }

    if (!isValid) {
      // Provide visible feedback hook if requested by automated tests
      const msg = amountInput.classList.contains('input-error')
        ? (amountError.textContent || 'Invalid amount entered.')
        : (recipientError.textContent || 'Invalid recipient entered.');

      entryFeedbackSlot.innerHTML = `
        <div class="feedback-banner feedback-error" data-testid="transfer-status" role="alert">
          <span class="feedback-heading">Input validation error</span>
          <p class="feedback-text">${msg}</p>
        </div>
      `;
    }

    return isValid;
  }

  // Populate review view with current state
  function populateReviewView() {
    const amount = state.amount;
    const fee = CONFIG.feeUSD;
    const total = amount + fee;
    const received = amount * CONFIG.exchangeRateVNDPerUSD;

    reviewRecipientVal.textContent = state.recipient;
    reviewSentVal.textContent = formatUSD(amount);
    reviewFeeVal.textContent = formatUSD(fee);
    reviewTotalVal.textContent = formatUSD(total);
    reviewReceivedVal.textContent = formatVND(received);
    reviewEstimateVal.textContent = CONFIG.deliveryEstimate;
  }

  // Switch to review view
  function goToReviewStep() {
    state.step = 'review';
    state.recipient = recipientInput.value.trim();
    state.amount = parseFloat(amountInput.value);

    populateReviewView();

    // If returning from edit, reset buttons and feedback for fresh review
    reviewFeedbackSlot.innerHTML = '';
    reviewStageTag.textContent = 'Pending verification';
    reviewStageTag.className = 'status-indicator-tag';
    btnConfirmTransfer.hidden = false;
    btnEditDetails.hidden = false;

    stepEntry.hidden = true;
    stepReview.hidden = false;

    navStep1.classList.remove('is-active');
    navStep1.removeAttribute('aria-current');
    navStep2.classList.add('is-active');
    navStep2.setAttribute('aria-current', 'step');

    // Scroll top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Switch back to entry view
  function goToEntryStep() {
    state.step = 'entry';

    stepReview.hidden = true;
    stepEntry.hidden = false;

    navStep2.classList.remove('is-active');
    navStep2.removeAttribute('aria-current');
    navStep1.classList.add('is-active');
    navStep1.setAttribute('aria-current', 'step');

    // Retain inputs
    recipientInput.value = state.recipient;
    amountInput.value = state.amount;
    updateEntryLiveCalculations();

    // Scroll top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
    amountInput.focus();
  }

  // Render Recoverable Failure State
  function renderFailureState() {
    reviewStageTag.textContent = 'Simulated failure';
    reviewStageTag.className = 'status-indicator-tag is-failed';

    const sentFormatted = formatUSD(state.amount);

    reviewFeedbackSlot.innerHTML = `
      <div class="feedback-banner feedback-error" data-testid="transfer-status" role="alert">
        <span class="feedback-badge">Simulated failure (recoverable)</span>
        <h2 class="feedback-heading">Transfer connection timed out</h2>
        <p class="feedback-text">
          A temporary simulation gateway timeout occurred while processing this transfer.
          <strong>No funds were debited</strong> from ${CONFIG.sourceAccount}, and your details for
          <strong>${state.recipient}</strong> (${sentFormatted}) are preserved. Please retry your transfer.
        </p>
        <div class="feedback-action-bar">
          <button type="button" class="btn btn-warning" id="btn-retry-action" data-testid="retry-transfer">
            Retry Transfer
          </button>
        </div>
      </div>
    `;

    // Hide original confirm button while retry is active
    btnConfirmTransfer.hidden = true;

    // Attach retry handler
    const retryBtn = document.getElementById('btn-retry-action');
    if (retryBtn) {
      retryBtn.addEventListener('click', handleConfirmation);
      retryBtn.focus();
    }
  }

  // Render Success State
  function renderSuccessState() {
    reviewStageTag.textContent = 'Simulated success';
    reviewStageTag.className = 'status-indicator-tag is-success';

    const sentFormatted = formatUSD(state.amount);
    const totalFormatted = formatUSD(state.amount + CONFIG.feeUSD);
    const receivedFormatted = formatVND(state.amount * CONFIG.exchangeRateVNDPerUSD);

    reviewFeedbackSlot.innerHTML = `
      <div class="feedback-banner feedback-success" data-testid="transfer-status" role="status">
        <span class="feedback-badge">Transfer Confirmed (Simulation)</span>
        <h2 class="feedback-heading">Transfer Initiated Successfully</h2>
        <p class="feedback-text">
          Your simulated transfer of <strong>${sentFormatted}</strong> (${receivedFormatted}) to
          <strong>${state.recipient}</strong> in ${CONFIG.destination} has been scheduled.
        </p>
        <ul class="feedback-details-list">
          <li><strong>Estimated delivery:</strong> ${CONFIG.deliveryEstimate}</li>
          <li><strong>Total debited:</strong> ${totalFormatted} (includes flat fee ${formatUSD(CONFIG.feeUSD)})</li>
          <li><strong>Source account:</strong> ${CONFIG.sender} • ${CONFIG.sourceAccount}</li>
          <li><strong>Important:</strong> ${CONFIG.sampleDataDisclosure}</li>
        </ul>
        <div class="feedback-action-bar">
          <button type="button" class="btn btn-primary" id="btn-new-transfer">
            Start Another Transfer
          </button>
        </div>
      </div>
    `;

    // Update action controls
    btnConfirmTransfer.hidden = true;
    btnEditDetails.hidden = true;

    const newTransferBtn = document.getElementById('btn-new-transfer');
    if (newTransferBtn) {
      newTransferBtn.addEventListener('click', function () {
        // Reset state
        state.confirmAttempts = 0;
        state.recipient = CONFIG.recipient;
        state.amount = CONFIG.initialAmount;
        recipientInput.value = CONFIG.recipient;
        amountInput.value = CONFIG.initialAmount;

        reviewFeedbackSlot.innerHTML = '';
        reviewStageTag.textContent = 'Pending verification';
        reviewStageTag.className = 'status-indicator-tag';
        btnConfirmTransfer.hidden = false;
        btnEditDetails.hidden = false;

        goToEntryStep();
      });
      newTransferBtn.focus();
    }
  }

  // Handle Confirmation (1st attempt fails, retry succeeds)
  function handleConfirmation() {
    if (state.confirmAttempts === 0) {
      state.confirmAttempts = 1;
      renderFailureState();
    } else {
      state.confirmAttempts++;
      renderSuccessState();
    }
  }

  // Event Listeners
  amountInput.addEventListener('input', function () {
    updateEntryLiveCalculations();
    amountInput.classList.remove('input-error');
    amountError.innerHTML = '';
    entryFeedbackSlot.innerHTML = '';
  });

  recipientInput.addEventListener('input', function () {
    recipientInput.classList.remove('input-error');
    recipientError.innerHTML = '';
  });

  const btnToReview = document.getElementById('btn-to-review');
  if (btnToReview) {
    btnToReview.addEventListener('click', function (e) {
      e.preventDefault();
      if (validateEntryForm()) {
        goToReviewStep();
      }
    });
  }

  entryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateEntryForm()) {
      goToReviewStep();
    }
  });

  btnEditDetails.addEventListener('click', function () {
    goToEntryStep();
  });

  btnConfirmTransfer.addEventListener('click', function () {
    handleConfirmation();
  });

  // Initial setup
  recipientInput.value = CONFIG.recipient;
  amountInput.value = CONFIG.initialAmount;
  updateEntryLiveCalculations();

})();
