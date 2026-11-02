/**
 * Northline Transfer — Simulated Money Transfer Application
 * Handles entry, validation, dynamic fee/currency calculations,
 * review confirmation, recoverable failure simulation, retry, and success.
 */

(function () {
  'use strict';

  // Fictional Fixture Data (Grounded source of truth)
  const FIXTURE = {
    brand: 'Northline Transfer',
    fictional: true,
    referenceDate: '2026-11-01',
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

  // State
  let currentRecipient = FIXTURE.recipient;
  let currentAmount = FIXTURE.initialAmount;
  let confirmationAttempts = 0;

  // DOM Elements
  const stepEntry = document.getElementById('step-entry');
  const stepReview = document.getElementById('step-review');
  const stepSuccess = document.getElementById('step-success');

  const stepIndicator1 = document.getElementById('step-indicator-1');
  const stepIndicator2 = document.getElementById('step-indicator-2');
  const stepIndicator3 = document.getElementById('step-indicator-3');

  const transferForm = document.getElementById('transfer-form');
  const recipientInput = document.getElementById('recipient-input');
  const amountInput = document.getElementById('amount-input');
  const entryAlert = document.getElementById('entry-alert');

  // Entry live breakdown elements
  const entrySumAmount = document.getElementById('entry-sum-amount');
  const entrySumFee = document.getElementById('entry-sum-fee');
  const entrySumTotal = document.getElementById('entry-sum-total');
  const entrySumReceive = document.getElementById('entry-sum-receive');

  // Review step elements
  const revRecipient = document.getElementById('rev-recipient');
  const revSentAmount = document.getElementById('rev-sent-amount');
  const revFee = document.getElementById('rev-fee');
  const revTotalDebited = document.getElementById('rev-total-debited');
  const revAmountReceived = document.getElementById('rev-amount-received');
  const revDeliveryEstimate = document.getElementById('rev-delivery-estimate');

  const statusFeedback = document.getElementById('transfer-status-feedback');
  const statusTitle = document.getElementById('status-title');
  const statusText = document.getElementById('status-text');

  const btnEdit = document.getElementById('btn-edit');
  const btnConfirm = document.getElementById('btn-confirm');
  const btnRetry = document.getElementById('btn-retry');

  // Formatters
  function formatUSD(val) {
    return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }

  function formatVND(val) {
    return `${Math.round(val).toLocaleString('en-US')} VND`;
  }

  // Update calculation values on the entry screen
  function updateEntryCalculations() {
    const rawVal = parseFloat(amountInput.value);
    if (!isNaN(rawVal) && rawVal > 0) {
      const fee = FIXTURE.feeUSD;
      const total = rawVal + fee;
      const receive = rawVal * FIXTURE.exchangeRateVNDPerUSD;

      entrySumAmount.textContent = formatUSD(rawVal);
      entrySumFee.textContent = formatUSD(fee);
      entrySumTotal.textContent = formatUSD(total);
      entrySumReceive.textContent = formatVND(receive);
    }
  }

  // Populate Review Details
  function populateReviewScreen() {
    const fee = FIXTURE.feeUSD;
    const total = currentAmount + fee;
    const receive = currentAmount * FIXTURE.exchangeRateVNDPerUSD;

    revRecipient.textContent = currentRecipient;
    revSentAmount.textContent = formatUSD(currentAmount);
    revFee.textContent = formatUSD(fee);
    revTotalDebited.textContent = formatUSD(total);
    revAmountReceived.textContent = formatVND(receive);
    revDeliveryEstimate.textContent = FIXTURE.deliveryEstimate;
  }

  // Switch to Entry View
  function showEntryStep() {
    stepEntry.hidden = false;
    stepReview.hidden = true;
    if (stepSuccess) stepSuccess.hidden = true;

    stepIndicator1.className = 'step step-active';
    stepIndicator1.setAttribute('aria-current', 'step');
    stepIndicator2.className = 'step';
    stepIndicator2.removeAttribute('aria-current');
    stepIndicator3.className = 'step';
    stepIndicator3.removeAttribute('aria-current');

    // Keep inputs preserved
    recipientInput.value = currentRecipient;
    amountInput.value = currentAmount;
    updateEntryCalculations();
    amountInput.focus();
  }

  // Switch to Review View
  function showReviewStep() {
    populateReviewScreen();

    stepEntry.hidden = true;
    stepReview.hidden = false;
    if (stepSuccess) stepSuccess.hidden = true;

    stepIndicator1.className = 'step step-complete';
    stepIndicator1.removeAttribute('aria-current');
    stepIndicator2.className = 'step step-active';
    stepIndicator2.setAttribute('aria-current', 'step');
    stepIndicator3.className = 'step';
    stepIndicator3.removeAttribute('aria-current');

    // Reset status feedback unless in retry cycle
    if (confirmationAttempts === 0) {
      statusFeedback.hidden = true;
      btnConfirm.hidden = false;
      btnRetry.hidden = true;
    }
  }

  // Validation
  function validateEntry() {
    entryAlert.hidden = true;
    entryAlert.textContent = '';
    recipientInput.setAttribute('aria-invalid', 'false');
    amountInput.setAttribute('aria-invalid', 'false');

    const recVal = recipientInput.value.trim();
    if (!recVal) {
      entryAlert.hidden = false;
      entryAlert.textContent = 'Please enter a valid recipient name.';
      recipientInput.setAttribute('aria-invalid', 'true');
      recipientInput.focus();
      return false;
    }

    const amtVal = parseFloat(amountInput.value);
    if (isNaN(amtVal) || amtVal < FIXTURE.minimumUSD || amtVal > FIXTURE.maximumUSD) {
      entryAlert.hidden = false;
      entryAlert.textContent = `Amount must be between $${FIXTURE.minimumUSD.toFixed(2)} and $${FIXTURE.maximumUSD.toFixed(2)} USD. Entered values were retained.`;
      amountInput.setAttribute('aria-invalid', 'true');
      amountInput.focus();
      return false;
    }

    currentRecipient = recVal;
    currentAmount = amtVal;
    return true;
  }

  // Form submission (Review action)
  transferForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateEntry()) {
      showReviewStep();
    }
  });

  // Amount input listener for live breakdown update
  amountInput.addEventListener('input', function () {
    updateEntryCalculations();
  });

  // Edit details action on review screen
  btnEdit.addEventListener('click', function () {
    showEntryStep();
  });

  // Confirmation handling
  function handleConfirmation() {
    if (confirmationAttempts === 0) {
      // First confirmation must return a recoverable simulated failure
      confirmationAttempts = 1;

      statusFeedback.hidden = false;
      statusFeedback.className = 'status-banner status-banner-error';
      statusFeedback.setAttribute('role', 'alert');

      statusTitle.textContent = 'Simulated Transfer Failed (Recoverable)';
      statusText.innerHTML = 'A temporary simulated connection timeout occurred during payment verification. <strong>No real money was moved and your entered details have been preserved.</strong> Please retry your transfer or edit details.';

      btnConfirm.hidden = true;
      btnRetry.hidden = false;
      btnRetry.focus();
    } else {
      // Retry succeeds
      handleSuccess();
    }
  }

  // Success handling
  function handleSuccess() {
    confirmationAttempts++;

    statusFeedback.hidden = false;
    statusFeedback.className = 'status-banner status-banner-success';
    statusFeedback.setAttribute('role', 'status');

    statusTitle.textContent = 'Simulated Transfer Confirmed';
    statusText.innerHTML = `Transfer of <strong>${formatUSD(currentAmount)}</strong> to <strong>${currentRecipient}</strong> (${formatVND(currentAmount * FIXTURE.exchangeRateVNDPerUSD)}) has been simulated successfully. Reference: <strong>SIM-839201</strong>.<br><small class="status-disclaimer">Notice: This is a simulation with fictional data. No real money was moved and no real account was connected.</small>`;

    btnConfirm.hidden = true;
    btnRetry.hidden = true;

    stepIndicator2.className = 'step step-complete';
    stepIndicator2.removeAttribute('aria-current');
    stepIndicator3.className = 'step step-active';
    stepIndicator3.setAttribute('aria-current', 'step');

    // Add a restart button if not already present
    let restartBtn = document.getElementById('btn-restart');
    if (!restartBtn) {
      restartBtn = document.createElement('button');
      restartBtn.id = 'btn-restart';
      restartBtn.type = 'button';
      restartBtn.className = 'btn btn-primary';
      restartBtn.textContent = 'Start Another Simulated Transfer';
      restartBtn.style.marginTop = '16px';
      restartBtn.addEventListener('click', function () {
        confirmationAttempts = 0;
        currentRecipient = FIXTURE.recipient;
        currentAmount = FIXTURE.initialAmount;
        restartBtn.remove();
        showEntryStep();
      });
      statusFeedback.parentNode.appendChild(restartBtn);
    }
  }

  btnConfirm.addEventListener('click', handleConfirmation);
  btnRetry.addEventListener('click', handleSuccess);

  // Initialize view
  updateEntryCalculations();
})();
