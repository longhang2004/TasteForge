(() => {
  const fixture = {
    recipient: "Nguyễn Thị Minh Anh Trường",
    sender: "Alex Morgan",
    sourceAccount: "Everyday USD ••1042",
    destination: "Việt Nam",
    initialAmount: 250,
    feeUSD: 2.5,
    exchangeRateVNDPerUSD: 25000,
    minimumUSD: 1,
    maximumUSD: 1000,
    deliveryEstimate: "By 3 November 2026",
    sampleDataDisclosure: "Simulation with fictional data. No money is moved and no real account is connected."
  };
  const $ = (selector) => document.querySelector(selector);
  const form = $("#transfer-form");
  const recipientInput = $("#recipient");
  const amountInput = $("#amount");
  const views = ["#entry-view", "#review-view", "#failure-view", "#success-view"].map($);
  const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const usdFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  let hasFailedOnce = false;

  function amount() { return Number(amountInput.value); }
  function receiveAmount() { return Math.round(amount() * fixture.exchangeRateVNDPerUSD); }
  function formatUsd(value) { return `${usdFormat.format(value)} USD`; }
  function formatVnd(value) { return `${numberFormat.format(value)} VND`; }

  function showView(id, focusSelector) {
    views.forEach((view) => { view.hidden = view.id !== id; });
    const entry = id === "entry-view";
    const review = id === "review-view";
    $("#step-one").classList.toggle("is-current", entry);
    $("#step-one").classList.toggle("is-done", review || ["failure-view", "success-view"].includes(id));
    $("#step-two").classList.toggle("is-current", review || ["failure-view", "success-view"].includes(id));
    if (focusSelector) $(focusSelector).focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setError(input, message, errorSelector) {
    const error = $(errorSelector);
    error.textContent = message;
    error.classList.toggle("is-visible", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate() {
    let firstInvalid = null;
    const recipient = recipientInput.value.trim();
    if (!recipient) {
      setError(recipientInput, "Enter the recipient’s full name.", "#recipient-error");
      firstInvalid = recipientInput;
    } else {
      setError(recipientInput, "", "#recipient-error");
    }
    const value = amount();
    if (!amountInput.value || !Number.isFinite(value)) {
      setError(amountInput, "Enter an amount to send.", "#amount-error");
      firstInvalid ??= amountInput;
    } else if (value < fixture.minimumUSD) {
      setError(amountInput, "Enter at least $1.00 USD.", "#amount-error");
      firstInvalid ??= amountInput;
    } else if (value > fixture.maximumUSD) {
      setError(amountInput, "The maximum sample amount is $1,000.00 USD.", "#amount-error");
      firstInvalid ??= amountInput;
    } else {
      setError(amountInput, "", "#amount-error");
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  function renderReview() {
    const recipient = recipientInput.value.trim();
    const sent = amount();
    const received = receiveAmount();
    $("#review-recipient").textContent = recipient;
    $("#review-send").textContent = formatUsd(sent);
    $("#review-total").textContent = formatUsd(sent + fixture.feeUSD);
    $("#review-receive").textContent = formatVnd(received);
    $("#live-receive").innerHTML = `${numberFormat.format(received)} <small>VND</small>`;
    $("#failure-recipient").textContent = recipient;
    $("#failure-amount").textContent = formatUsd(sent);
    $("#success-receive").textContent = formatVnd(received);
  }

  function goToReview() {
    if (!validate()) return;
    renderReview();
    showView("review-view", "#review-title");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    goToReview();
  });

  [recipientInput, amountInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (input === recipientInput && input.value.trim()) setError(input, "", "#recipient-error");
      if (input === amountInput && amountInput.value && amount() >= fixture.minimumUSD && amount() <= fixture.maximumUSD) setError(input, "", "#amount-error");
      if (input === amountInput && amountInput.value && amount() >= fixture.minimumUSD && amount() <= fixture.maximumUSD) {
        const estimate = Math.round(amount() * fixture.exchangeRateVNDPerUSD);
        $("#live-receive").innerHTML = `${numberFormat.format(estimate)} <small>VND</small>`;
      }
    });
  });

  $("[data-testid='edit-transfer']").addEventListener("click", () => showView("entry-view", "#recipient"));
  $("#back-to-details").addEventListener("click", () => showView("entry-view", "#recipient"));
  $("#edit-after-failure").addEventListener("click", () => showView("entry-view", "#recipient"));

  function simulateSuccess() {
    if (!validate()) {
      showView("entry-view", "#amount");
      return;
    }
    renderReview();
    showView("success-view", "#success-title");
  }

  $("[data-testid='confirm-transfer']").addEventListener("click", () => {
    if (!validate()) {
      showView("entry-view", "#amount");
      return;
    }
    renderReview();
    if (!hasFailedOnce) {
      hasFailedOnce = true;
      showView("failure-view", "#failure-title");
      return;
    }
    simulateSuccess();
  });

  $("[data-testid='retry-transfer']").addEventListener("click", simulateSuccess);
  $("#start-over").addEventListener("click", () => {
    recipientInput.value = fixture.recipient;
    amountInput.value = fixture.initialAmount;
    setError(recipientInput, "", "#recipient-error");
    setError(amountInput, "", "#amount-error");
    hasFailedOnce = false;
    renderReview();
    showView("entry-view", "#recipient");
  });
})();
