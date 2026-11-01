// Warehouse Inventory Workspace for Northline Stockroom
// Offline deterministic simulation conforming to task.md contract

const FIXTURE_DATA = {
  brand: "Northline Stockroom",
  fictional: true,
  warehouse: "Warehouse A",
  snapshot: "1 November 2026, 09:00 ICT — fictional snapshot, not live inventory",
  items: [
    {
      sku: "CER-204",
      name: "Everyday Teapot — Sand",
      available: 3,
      reorderPoint: 12,
      shortage: 9,
      unit: "pieces",
      location: "A-02",
      incoming: 0
    },
    {
      sku: "LIN-115",
      name: "Khăn bàn Nguyễn Thị Minh Anh — Natural linen",
      available: 2,
      reorderPoint: 10,
      shortage: 8,
      unit: "pieces",
      location: "B-04",
      incoming: 4
    },
    {
      sku: "GLS-031",
      name: "Drinking glass — Clear",
      available: 24,
      reorderPoint: 12,
      shortage: 0,
      unit: "pieces",
      location: "C-01",
      incoming: 0
    },
    {
      sku: "CER-120",
      name: "Breakfast bowl — Iron",
      available: 4,
      reorderPoint: 8,
      shortage: 4,
      unit: "pieces",
      location: "A-05",
      incoming: 2
    },
    {
      sku: "PPR-010",
      name: "Gift wrap — Ochre",
      available: 18,
      reorderPoint: 8,
      shortage: 0,
      unit: "sheets",
      location: "D-02",
      incoming: 0
    }
  ],
  behavior: "Record a replenishment decision locally; this does not place an order or update a real warehouse. First save fails recoverably; retry succeeds. Retain selected item, entered quantity, search and shortage filter across return/error."
};

const state = {
  searchQuery: "",
  shortageOnly: false,
  selectedSku: null,
  step: "inspect", // "inspect" | "review" | "failed" | "success"
  quantities: {},  // sku -> string/number
  validationError: "",
  saveAttempts: 0, // 0 = first attempt will fail; >= 1 = retry succeeds
  recordedDecisions: {} // sku -> { quantity, unit }
};

function getItem(sku) {
  return FIXTURE_DATA.items.find((it) => it.sku === sku);
}

function getFilteredItems() {
  const query = state.searchQuery.trim().toLowerCase();
  return FIXTURE_DATA.items.filter((item) => {
    if (state.shortageOnly && item.shortage <= 0) {
      return false;
    }
    if (query) {
      const matchSku = item.sku.toLowerCase().includes(query);
      const matchName = item.name.toLowerCase().includes(query);
      if (!matchSku && !matchName) {
        return false;
      }
    }
    return true;
  });
}

function validateQuantity(value) {
  if (value === "" || value === null || value === undefined) {
    return { valid: false, error: "Quantity is required. Enter a whole integer between 1 and 50." };
  }
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) {
    return { valid: false, error: "Quantity must be a positive whole integer." };
  }
  const num = parseInt(str, 10);
  if (num < 1 || num > 50) {
    return { valid: false, error: "Quantity must be an integer between 1 and 50." };
  }
  return { valid: true, error: "" };
}

function selectItem(sku) {
  state.selectedSku = sku;
  state.step = "inspect";
  state.validationError = "";
  if (state.quantities[sku] === undefined) {
    const item = getItem(sku);
    state.quantities[sku] = item && item.shortage > 0 ? item.shortage : 1;
  }
  render();
  // On narrow screens, gently scroll inspector into view while retaining list above
  const inspectorEl = document.getElementById("inspector-section");
  if (inspectorEl && window.innerWidth < 960) {
    inspectorEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateQuantity(sku, value) {
  state.quantities[sku] = value;
  const res = validateQuantity(value);
  state.validationError = res.error;
  const reviewBtn = document.querySelector('[data-testid="review-decision"]');
  const errorEl = document.getElementById("quantity-error");
  if (reviewBtn) {
    reviewBtn.disabled = !res.valid;
  }
  if (errorEl) {
    errorEl.textContent = res.error;
    errorEl.style.display = res.valid ? "none" : "block";
  }
}

function handleReview() {
  const item = getItem(state.selectedSku);
  if (!item) return;
  const qty = state.quantities[item.sku];
  const res = validateQuantity(qty);
  if (!res.valid) {
    state.validationError = res.error;
    render();
    return;
  }
  state.step = "review";
  state.validationError = "";
  render();
}

function handleEdit() {
  state.step = "inspect";
  state.validationError = "";
  render();
}

function handleSave() {
  if (state.saveAttempts === 0) {
    // First simulated save must fail visibly and recoverably
    state.saveAttempts++;
    state.step = "failed";
    render();
  } else {
    // Retry succeeds
    commitSuccess();
  }
}

function handleRetry() {
  state.saveAttempts++;
  commitSuccess();
}

function commitSuccess() {
  const item = getItem(state.selectedSku);
  if (!item) return;
  const qty = parseInt(String(state.quantities[item.sku]).trim(), 10);
  state.recordedDecisions[item.sku] = {
    quantity: qty,
    unit: item.unit
  };
  state.step = "success";
  render();
}

function handleBackToList() {
  state.selectedSku = null;
  state.step = "inspect";
  state.validationError = "";
  render();
  // Scroll smoothly back to inventory list
  const listEl = document.getElementById("inventory-list-heading");
  if (listEl) {
    listEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function handleClearSearch() {
  state.searchQuery = "";
  render();
  const searchInput = document.querySelector('[data-testid="inventory-search"]');
  if (searchInput) {
    searchInput.focus();
  }
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const filteredItems = getFilteredItems();
  const selectedItem = getItem(state.selectedSku);
  const currentQuantity = selectedItem ? state.quantities[selectedItem.sku] : "";
  const validation = selectedItem ? validateQuantity(currentQuantity) : { valid: true, error: "" };

  const totalCount = FIXTURE_DATA.items.length;
  const matchCount = filteredItems.length;

  app.innerHTML = `
    <header class="app-header">
      <div class="header-main">
        <div class="brand-group">
          <span class="badge-tag">${escapeHtml(FIXTURE_DATA.warehouse)}</span>
          <h1 class="brand-title">${escapeHtml(FIXTURE_DATA.brand)}</h1>
        </div>
        <p class="workspace-subtitle">Warehouse Replenishment Decision Workspace</p>
      </div>
      <div class="snapshot-disclosure" role="region" aria-label="Fictitious data disclosure">
        <div class="disclosure-badge">Simulated Environment</div>
        <div class="disclosure-body">
          <span class="disclosure-time"><strong>Snapshot:</strong> ${escapeHtml(FIXTURE_DATA.snapshot)}</span>
          <span class="disclosure-note">Local decision simulation only. No purchase orders are placed and live warehouse stock is not modified.</span>
        </div>
      </div>
    </header>

    <div class="workspace-layout">
      <!-- Left Column / List Section: Always visible to retain list context -->
      <section class="list-section" aria-labelledby="inventory-list-heading">
        <div class="filter-toolbar">
          <div class="search-wrap">
            <label for="inventory-search" class="visually-hidden">Search items</label>
            <input
              type="search"
              id="inventory-search"
              data-testid="inventory-search"
              placeholder="Search by SKU or item name..."
              value="${escapeHtml(state.searchQuery)}"
              autocomplete="off"
            />
          </div>
          <div class="filter-wrap">
            <label class="toggle-control" for="shortage-only">
              <input
                type="checkbox"
                id="shortage-only"
                data-testid="shortage-only"
                ${state.shortageOnly ? "checked" : ""}
              />
              <span class="toggle-label">Shortages only <span class="tag-shortage-hint">(shortage &gt; 0)</span></span>
            </label>
          </div>
        </div>

        <div class="list-meta-bar">
          <h2 id="inventory-list-heading" class="section-title">
            Stock Inventory
            <span class="item-count">(${matchCount} of ${totalCount})</span>
          </h2>
          ${state.shortageOnly ? '<span class="filter-active-pill">Filter: Shortage &gt; 0</span>' : ""}
        </div>

        <div class="inventory-table-container">
          ${matchCount === 0 ? `
            <div class="empty-state" role="status">
              <p class="empty-message">No items match "<strong>${escapeHtml(state.searchQuery)}</strong>"${state.shortageOnly ? " with current shortage filter" : ""}.</p>
              <button type="button" class="btn btn-secondary" data-testid="clear-search">Clear search</button>
            </div>
          ` : `
            <div class="inventory-list-body" role="feed" aria-label="Warehouse Inventory Items">
              ${filteredItems.map((item) => {
                const isSelected = item.sku === state.selectedSku;
                const hasShortage = item.shortage > 0;
                const recorded = state.recordedDecisions[item.sku];

                return `
                  <article
                    class="inventory-row ${isSelected ? "is-selected" : ""} ${hasShortage ? "has-shortage" : ""}"
                    data-testid="inventory-row"
                    data-sku="${escapeHtml(item.sku)}"
                    aria-label="${escapeHtml(item.sku)} ${escapeHtml(item.name)}"
                  >
                    <div class="row-header-strip">
                      <div class="row-badges">
                        <code class="sku-code">${escapeHtml(item.sku)}</code>
                        <span class="pill-location">Loc: ${escapeHtml(item.location)}</span>
                        ${hasShortage
                          ? `<span class="pill-shortage">${item.shortage} ${escapeHtml(item.unit)} shortage</span>`
                          : `<span class="pill-ok">In stock</span>`
                        }
                      </div>
                      <div class="row-action-wrap">
                        <button
                          type="button"
                          class="btn-select ${isSelected ? "btn-active" : ""}"
                          data-testid="item-${escapeHtml(item.sku)}"
                          aria-label="Inspect ${escapeHtml(item.sku)}"
                        >
                          ${isSelected ? "Inspecting" : "Inspect"}
                        </button>
                      </div>
                    </div>

                    <div class="row-title-strip">
                      <strong class="item-title">${escapeHtml(item.name)}</strong>
                      ${recorded ? `<span class="badge-recorded">Replenishment Planned: ${recorded.quantity} ${recorded.unit}</span>` : ""}
                    </div>

                    <div class="row-metrics-strip">
                      <div class="metric-chip">
                        <span class="m-label">Available</span>
                        <span class="m-val"><strong>${item.available}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></span>
                      </div>
                      <div class="metric-chip">
                        <span class="m-label">Reorder Pt</span>
                        <span class="m-val"><strong>${item.reorderPoint}</strong></span>
                      </div>
                      <div class="metric-chip ${hasShortage ? "metric-shortage" : ""}">
                        <span class="m-label">Shortage</span>
                        <span class="m-val"><strong>${item.shortage}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></span>
                      </div>
                      <div class="metric-chip">
                        <span class="m-label">Incoming</span>
                        <span class="m-val"><strong>${item.incoming}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></span>
                      </div>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
          `}
        </div>
      </section>

      <!-- Right Column / Inspector & Replenishment Panel -->
      <section id="inspector-section" class="inspector-section ${selectedItem ? "has-selection" : ""}" aria-labelledby="inspector-heading">
        ${!selectedItem ? `
          <div class="empty-inspector">
            <h2 id="inspector-heading" class="inspector-empty-title">Stock Evidence &amp; Replenishment</h2>
            <p class="inspector-empty-text">Select any item from the inventory list to inspect physical stock evidence, reorder metrics, bin location, and record a simulated replenishment decision.</p>
            <div class="empty-hint-card">
              <strong>Operator Guide:</strong>
              <ul>
                <li>Items with <code>shortage &gt; 0</code> require replenishment attention.</li>
                <li>Incoming stock does not zero out calculated shortage in this fixture.</li>
                <li>Decisions are local simulations; no purchase orders are triggered.</li>
              </ul>
            </div>
          </div>
        ` : renderInspectorCard(selectedItem, currentQuantity, validation)}
      </section>
    </div>
  `;

  attachEventHandlers();
}

function renderInspectorCard(item, currentQuantity, validation) {
  const isInspect = state.step === "inspect";
  const isReview = state.step === "review";
  const isFailed = state.step === "failed";
  const isSuccess = state.step === "success";

  return `
    <div class="inspector-card">
      <div class="inspector-header">
        <div class="inspector-title-wrap">
          <div class="inspector-badges">
            <code class="inspector-sku">${escapeHtml(item.sku)}</code>
            <span class="pill-location">Location: ${escapeHtml(item.location)}</span>
            ${item.shortage > 0 ? `<span class="pill-shortage">Shortage: ${item.shortage} ${escapeHtml(item.unit)}</span>` : ""}
          </div>
          <h2 id="inspector-heading" class="inspector-item-name">${escapeHtml(item.name)}</h2>
        </div>
        <button type="button" class="btn btn-ghost" data-testid="back-to-list" aria-label="Return to inventory list">
          ← Back to list
        </button>
      </div>

      <!-- Evidence Panel: All five operational metrics -->
      <div class="evidence-panel" role="region" aria-label="Stock Evidence">
        <h3 class="evidence-heading">Physical Stock Evidence</h3>
        <dl class="evidence-grid">
          <div class="evidence-cell">
            <dt>Available Stock</dt>
            <dd><strong>${item.available}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></dd>
          </div>
          <div class="evidence-cell">
            <dt>Reorder Point</dt>
            <dd><strong>${item.reorderPoint}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></dd>
          </div>
          <div class="evidence-cell ${item.shortage > 0 ? "highlight-shortage" : ""}">
            <dt>Current Shortage</dt>
            <dd><strong>${item.shortage}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></dd>
          </div>
          <div class="evidence-cell">
            <dt>Incoming Quantity</dt>
            <dd><strong>${item.incoming}</strong> <span class="unit-label">${escapeHtml(item.unit)}</span></dd>
          </div>
          <div class="evidence-cell">
            <dt>Bin Location</dt>
            <dd><strong>${escapeHtml(item.location)}</strong></dd>
          </div>
          <div class="evidence-cell">
            <dt>Inventory Unit</dt>
            <dd><strong>${escapeHtml(item.unit)}</strong></dd>
          </div>
        </dl>
      </div>

      <!-- State Flow: Inspect/Edit -> Review -> Save Failure -> Success -->
      ${isInspect ? `
        <div class="decision-form" role="form" aria-label="Replenishment Decision Form">
          <h3 class="form-heading">Record Replenishment Decision</h3>
          <div class="form-field">
            <label for="decision-quantity" class="form-label">
              Replenishment Quantity (<span class="unit-text">${escapeHtml(item.unit)}</span>)
            </label>
            <p class="field-help">Allowed range: whole integer from 1 to 50 pieces.</p>
            <div class="input-action-row">
              <input
                type="number"
                id="decision-quantity"
                data-testid="decision-quantity"
                min="1"
                max="50"
                step="1"
                value="${escapeHtml(String(currentQuantity))}"
                class="quantity-input ${!validation.valid ? "input-invalid" : ""}"
                aria-describedby="quantity-error"
                required
              />
            </div>
            <div id="quantity-error" class="error-msg" role="alert" style="display: ${validation.valid ? "none" : "block"};">
              ${escapeHtml(validation.error)}
            </div>
          </div>

          <div class="action-footer">
            <button
              type="button"
              class="btn btn-primary"
              data-testid="review-decision"
              ${validation.valid ? "" : "disabled"}
            >
              Review decision
            </button>
            <button type="button" class="btn btn-secondary" data-testid="back-to-list">
              Back to list
            </button>
          </div>
        </div>
      ` : ""}

      ${isReview ? `
        <div class="review-box" role="region" aria-label="Review Decision">
          <h3 class="review-heading">Review Decision Before Committing</h3>
          <div class="review-summary-table">
            <div class="summary-row">
              <span class="summary-label">Selected Item:</span>
              <span class="summary-val"><strong>${escapeHtml(item.sku)}</strong> — ${escapeHtml(item.name)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Requested Replenishment:</span>
              <span class="summary-val highlight-qty"><strong>${escapeHtml(String(currentQuantity))}</strong> ${escapeHtml(item.unit)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Bin Location:</span>
              <span class="summary-val">${escapeHtml(item.location)}</span>
            </div>
          </div>

          <div class="review-notice-card" role="note">
            <strong class="notice-title">Operational Notice:</strong>
            <p>Recording this decision is an internal stock planning simulation only. <strong>This places no purchase order</strong> and will not generate external supplier actions.</p>
          </div>

          <div class="action-footer">
            <button type="button" class="btn btn-secondary" data-testid="edit-decision">
              Edit quantity
            </button>
            <button type="button" class="btn btn-primary" data-testid="save-decision">
              Save decision
            </button>
          </div>
        </div>
      ` : ""}

      ${isFailed ? `
        <div class="failure-state" role="region" aria-label="Save Failure">
          <div data-testid="decision-status" class="status-banner banner-error" role="alert">
            <div class="status-icon">⚠️</div>
            <div class="status-content">
              <strong>Simulated Save Error:</strong> Synchronization with the stockroom decision ledger failed. Please retry your submission.
            </div>
          </div>

          <div class="review-summary-table">
            <div class="summary-row">
              <span class="summary-label">Item:</span>
              <span class="summary-val">${escapeHtml(item.sku)} (${escapeHtml(item.name)})</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Pending Quantity:</span>
              <span class="summary-val"><strong>${escapeHtml(String(currentQuantity))}</strong> ${escapeHtml(item.unit)}</span>
            </div>
          </div>

          <div class="action-footer">
            <button type="button" class="btn btn-primary" data-testid="retry-decision">
              Retry decision
            </button>
            <button type="button" class="btn btn-secondary" data-testid="edit-decision">
              Edit quantity
            </button>
          </div>
        </div>
      ` : ""}

      ${isSuccess ? `
        <div class="success-state" role="region" aria-label="Decision Success">
          <div data-testid="decision-status" class="status-banner banner-success" role="status">
            <div class="status-icon">✓</div>
            <div class="status-content">
              <strong>Decision Recorded:</strong> Replenishment decision of <strong>${escapeHtml(String(currentQuantity))} ${escapeHtml(item.unit)}</strong> recorded for <strong>${escapeHtml(item.sku)}</strong>. Note: Recording a decision places no purchase order.
            </div>
          </div>

          <div class="review-summary-table">
            <div class="summary-row">
              <span class="summary-label">Item SKU:</span>
              <span class="summary-val">${escapeHtml(item.sku)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Item Name:</span>
              <span class="summary-val">${escapeHtml(item.name)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Replenishment Quantity:</span>
              <span class="summary-val highlight-qty"><strong>${escapeHtml(String(currentQuantity))}</strong> ${escapeHtml(item.unit)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Status:</span>
              <span class="summary-val"><span class="badge-status-recorded">Locally Recorded</span></span>
            </div>
          </div>

          <div class="action-footer">
            <button type="button" class="btn btn-secondary" data-testid="edit-decision">
              Edit quantity
            </button>
            <button type="button" class="btn btn-primary" data-testid="back-to-list">
              Back to list
            </button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function attachEventHandlers() {
  // Search input
  const searchInput = document.querySelector('[data-testid="inventory-search"]');
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
      // Keep focus and cursor in search box
      const refreshed = document.querySelector('[data-testid="inventory-search"]');
      if (refreshed) {
        refreshed.focus();
        refreshed.setSelectionRange(refreshed.value.length, refreshed.value.length);
      }
    });
  }

  // Shortage-only checkbox
  const shortageCheckbox = document.querySelector('[data-testid="shortage-only"]');
  if (shortageCheckbox) {
    shortageCheckbox.addEventListener("change", (e) => {
      state.shortageOnly = e.target.checked;
      render();
    });
  }

  // Clear search button
  const clearBtn = document.querySelector('[data-testid="clear-search"]');
  if (clearBtn) {
    clearBtn.addEventListener("click", handleClearSearch);
  }

  // Row and inspect button selection controls
  document.querySelectorAll("[data-testid=\"inventory-row\"]").forEach((row) => {
    const sku = row.getAttribute("data-sku");
    row.addEventListener("click", (e) => {
      // Don't trigger if user clicked directly on another interactive button inside
      if (e.target.closest("button")) return;
      selectItem(sku);
    });
  });

  document.querySelectorAll(".btn-select").forEach((btn) => {
    const testId = btn.getAttribute("data-testid") || "";
    if (testId.startsWith("item-")) {
      const sku = testId.replace("item-", "");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectItem(sku);
      });
    }
  });

  // Quantity input
  const qtyInput = document.querySelector('[data-testid="decision-quantity"]');
  if (qtyInput) {
    qtyInput.addEventListener("input", (e) => {
      if (state.selectedSku) {
        updateQuantity(state.selectedSku, e.target.value);
      }
    });
  }

  // Review decision button
  const reviewBtn = document.querySelector('[data-testid="review-decision"]');
  if (reviewBtn) {
    reviewBtn.addEventListener("click", handleReview);
  }

  // Edit decision button(s)
  document.querySelectorAll('[data-testid="edit-decision"]').forEach((btn) => {
    btn.addEventListener("click", handleEdit);
  });

  // Save decision button
  const saveBtn = document.querySelector('[data-testid="save-decision"]');
  if (saveBtn) {
    saveBtn.addEventListener("click", handleSave);
  }

  // Retry decision button
  const retryBtn = document.querySelector('[data-testid="retry-decision"]');
  if (retryBtn) {
    retryBtn.addEventListener("click", handleRetry);
  }

  // Back to list buttons
  document.querySelectorAll('[data-testid="back-to-list"]').forEach((btn) => {
    btn.addEventListener("click", handleBackToList);
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  render();
});
