/**
 * Northline Stockroom - Warehouse Inventory Workspace
 * Fictional snapshot workspace for stock replenishment decisions.
 */

const FIXTURE = {
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

// Application state
const state = {
  searchQuery: "",
  shortageOnly: false,
  selectedSku: null,
  viewMode: "inspect", // 'inspect' | 'review' | 'outcome'
  quantities: {
    "CER-204": 9,
    "LIN-115": 8,
    "GLS-031": 1,
    "CER-120": 4,
    "PPR-010": 1
  },
  quantityError: "",
  saveFailedOnce: false,
  outcomeStatus: null, // null | 'error' | 'success'
  statusMessage: ""
};

function escapeHtml(str) {
  if (typeof str !== "string") return String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateQuantity(val) {
  const trimmed = String(val).trim();
  if (trimmed === "") {
    return { valid: false, error: "Quantity is required." };
  }
  const num = Number(trimmed);
  if (!Number.isInteger(num)) {
    return { valid: false, error: "Quantity must be a whole integer." };
  }
  if (num < 1 || num > 50) {
    return { valid: false, error: "Quantity must be between 1 and 50 pieces." };
  }
  return { valid: true, error: "" };
}

function getVisibleItems() {
  const query = state.searchQuery.trim().toLowerCase();
  return FIXTURE.items.filter(item => {
    // Shortage only filter shows strictly items with shortage > 0
    if (state.shortageOnly && item.shortage <= 0) {
      return false;
    }
    if (!query) {
      return true;
    }
    const matchSku = item.sku.toLowerCase().includes(query);
    const matchName = item.name.toLowerCase().includes(query);
    return matchSku || matchName;
  });
}

function render() {
  const appEl = document.getElementById("app");
  if (!appEl) return;

  const visibleItems = getVisibleItems();
  const selectedItem = FIXTURE.items.find(i => i.sku === state.selectedSku) || null;

  // Header and Snapshot disclosure
  const headerHtml = `
    <header class="app-header">
      <div class="brand-row">
        <div class="brand-title-wrap">
          <h1 class="brand-title">${escapeHtml(FIXTURE.brand)}</h1>
          <span class="badge-warehouse">${escapeHtml(FIXTURE.warehouse)}</span>
        </div>
        <div class="disclosure-card" role="region" aria-label="Snapshot Disclosure">
          <span class="disclosure-tag">Simulated Snapshot</span>
          <span class="disclosure-text">${escapeHtml(FIXTURE.snapshot)}</span>
        </div>
      </div>
    </header>
  `;

  // Filter & Search Controls
  const isSearchActive = state.searchQuery.trim().length > 0;
  const showHeaderClearBtn = isSearchActive && visibleItems.length > 0;

  const controlsHtml = `
    <div class="inventory-controls-bar">
      <div class="search-wrap">
        <label for="inventory-search" class="visually-hidden">Search inventory by SKU or item name</label>
        <div class="search-input-group">
          <input
            type="search"
            id="inventory-search"
            data-testid="inventory-search"
            class="input-search"
            placeholder="Search by SKU or item name..."
            value="${escapeHtml(state.searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          >
          ${showHeaderClearBtn ? `
            <button
              type="button"
              data-testid="clear-search"
              class="btn-clear-search-inline"
              title="Clear search"
            >Clear</button>
          ` : ""}
        </div>
      </div>

      <div class="filter-wrap">
        <label class="checkbox-label" for="shortage-only">
          <input
            type="checkbox"
            id="shortage-only"
            data-testid="shortage-only"
            ${state.shortageOnly ? "checked" : ""}
          >
          <span class="checkbox-text">Show shortage only (shortage &gt; 0)</span>
        </label>
      </div>

      <div class="results-count" aria-live="polite">
        Showing ${visibleItems.length} of ${FIXTURE.items.length} items
      </div>
    </div>
  `;

  // Inventory Table or No Results
  let listContentHtml = "";
  if (visibleItems.length === 0) {
    listContentHtml = `
      <div class="no-results-state" role="status">
        <div class="no-results-icon" aria-hidden="true">🔍</div>
        <h3 class="no-results-title">No matching inventory items</h3>
        <p class="no-results-desc">
          No items found matching "${escapeHtml(state.searchQuery)}"${state.shortageOnly ? " with shortage-only filter active" : ""}.
        </p>
        <button
          type="button"
          data-testid="clear-search"
          class="btn btn-secondary clear-search-action"
        >Clear search</button>
      </div>
    `;
  } else {
    const rowsHtml = visibleItems.map(item => {
      const isSelected = item.sku === state.selectedSku;
      const isShort = item.shortage > 0;
      return `
        <tr
          data-testid="inventory-row"
          data-sku="${escapeHtml(item.sku)}"
          class="inventory-row ${isSelected ? "selected-row" : ""} ${isShort ? "has-shortage" : ""}"
        >
          <td class="col-sku font-mono">
            <span class="sku-label">${escapeHtml(item.sku)}</span>
          </td>
          <td class="col-name">
            <span class="item-name-text">${escapeHtml(item.name)}</span>
          </td>
          <td class="col-location font-mono">
            <span class="location-badge">${escapeHtml(item.location)}</span>
          </td>
          <td class="col-num col-available">
            <span class="metric-mobile-label">Avail: </span>
            <span class="metric-val">${item.available}</span>
            <span class="unit-text">${escapeHtml(item.unit)}</span>
          </td>
          <td class="col-num col-reorder">
            <span class="metric-mobile-label">Reorder: </span>
            <span class="metric-val">${item.reorderPoint}</span>
            <span class="unit-text">${escapeHtml(item.unit)}</span>
          </td>
          <td class="col-num col-shortage">
            <span class="metric-mobile-label">Short: </span>
            ${isShort
              ? `<span class="shortage-pill">-${item.shortage}</span>`
              : `<span class="ok-pill">0</span>`
            }
          </td>
          <td class="col-num col-incoming">
            <span class="metric-mobile-label">In: </span>
            ${item.incoming > 0
              ? `<span class="incoming-text">+${item.incoming}</span>`
              : `<span class="text-muted">0</span>`
            }
          </td>
          <td class="col-action">
            <button
              type="button"
              data-testid="item-${escapeHtml(item.sku)}"
              class="btn-select-item ${isSelected ? "btn-selected" : ""}"
              aria-label="Inspect ${escapeHtml(item.sku)}"
            >
              ${isSelected ? "Inspecting" : "Inspect"}
            </button>
          </td>
        </tr>
      `;
    }).join("");

    listContentHtml = `
      <div class="table-responsive">
        <table class="inventory-table">
          <thead>
            <tr>
              <th scope="col" class="col-sku">SKU</th>
              <th scope="col" class="col-name">Item Name</th>
              <th scope="col" class="col-location">Loc</th>
              <th scope="col" class="col-num">Avail</th>
              <th scope="col" class="col-num">Reorder</th>
              <th scope="col" class="col-num">Shortage</th>
              <th scope="col" class="col-num">Incoming</th>
              <th scope="col" class="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // Master List Pane
  const listPaneHtml = `
    <section class="inventory-list-pane" aria-labelledby="inventory-heading">
      <div class="pane-header">
        <h2 id="inventory-heading" class="pane-title">Stockroom Items</h2>
      </div>
      ${controlsHtml}
      ${listContentHtml}
    </section>
  `;

  // Detail / Decision Workspace Pane
  let detailPaneHtml = "";

  if (!selectedItem) {
    // Unselected placeholder state
    detailPaneHtml = `
      <section class="inventory-detail-pane empty-selection" aria-labelledby="detail-heading">
        <div class="detail-empty-box">
          <h2 id="detail-heading" class="detail-empty-title">Stock Evidence &amp; Replenishment</h2>
          <p class="detail-empty-desc">
            Select an item from the inventory list to inspect stock evidence (available quantity, reorder point, shortage, incoming stock, and location) and record a replenishment decision.
          </p>
          <div class="detail-hint">
            Tip: Click <strong>Inspect</strong> next to any SKU like <code>LIN-115</code> to begin.
          </div>
        </div>
      </section>
    `;
  } else {
    // Current quantity for this item
    const currentQtyVal = state.quantities[selectedItem.sku] !== undefined
      ? state.quantities[selectedItem.sku]
      : (selectedItem.shortage > 0 ? selectedItem.shortage : 1);
    const qtyValidation = validateQuantity(currentQtyVal);

    if (state.viewMode === "inspect") {
      detailPaneHtml = `
        <section class="inventory-detail-pane" aria-labelledby="detail-heading">
          <div class="pane-header detail-header-row">
            <div>
              <span class="detail-eyebrow">Item Evidence Inspection</span>
              <h2 id="detail-heading" class="detail-item-title">${escapeHtml(selectedItem.sku)}</h2>
            </div>
            <button
              type="button"
              data-testid="back-to-list"
              class="btn btn-outline btn-sm"
            >Back to list</button>
          </div>

          <div class="item-name-banner">
            <span class="item-name-label">Name:</span>
            <span class="item-name-val">${escapeHtml(selectedItem.name)}</span>
          </div>

          <div class="evidence-grid">
            <div class="evidence-card">
              <span class="evidence-label">Available Stock</span>
              <span class="evidence-value">${selectedItem.available}</span>
              <span class="evidence-unit">${escapeHtml(selectedItem.unit)}</span>
            </div>
            <div class="evidence-card">
              <span class="evidence-label">Reorder Point</span>
              <span class="evidence-value">${selectedItem.reorderPoint}</span>
              <span class="evidence-unit">${escapeHtml(selectedItem.unit)}</span>
            </div>
            <div class="evidence-card ${selectedItem.shortage > 0 ? "highlight-shortage" : ""}">
              <span class="evidence-label">Calculated Shortage</span>
              <span class="evidence-value">${selectedItem.shortage}</span>
              <span class="evidence-unit">${escapeHtml(selectedItem.unit)}</span>
            </div>
            <div class="evidence-card">
              <span class="evidence-label">Incoming Stock</span>
              <span class="evidence-value">${selectedItem.incoming}</span>
              <span class="evidence-unit">${escapeHtml(selectedItem.unit)}</span>
            </div>
            <div class="evidence-card evidence-card-wide">
              <span class="evidence-label">Warehouse Location</span>
              <span class="evidence-value font-mono">${escapeHtml(selectedItem.location)}</span>
              <span class="evidence-unit">${escapeHtml(FIXTURE.warehouse)}</span>
            </div>
          </div>

          <div class="decision-form-card">
            <h3 class="form-title">Replenishment Decision</h3>
            <p class="form-subtext">Specify the quantity to replenish for local recording.</p>

            <div class="form-group">
              <label for="decision-quantity" class="form-label">
                Decision Quantity (${escapeHtml(selectedItem.unit)})
              </label>
              <div class="quantity-input-wrap">
                <input
                  type="number"
                  id="decision-quantity"
                  data-testid="decision-quantity"
                  class="input-quantity ${!qtyValidation.valid ? "input-invalid" : ""}"
                  min="1"
                  max="50"
                  step="1"
                  value="${escapeHtml(currentQtyVal)}"
                  aria-describedby="quantity-help"
                >
                <span class="quantity-unit-addon">${escapeHtml(selectedItem.unit)}</span>
              </div>
              <p id="quantity-help" class="form-help">Integer quantity allowed: 1 to 50 pieces.</p>
              ${!qtyValidation.valid ? `
                <div class="validation-message" role="alert">
                  ${escapeHtml(qtyValidation.error)}
                </div>
              ` : ""}
            </div>

            <div class="decision-actions">
              <button
                type="button"
                data-testid="review-decision"
                class="btn btn-primary"
                ${!qtyValidation.valid ? "disabled" : ""}
              >Review decision</button>
            </div>
          </div>
        </section>
      `;
    } else if (state.viewMode === "review" || state.viewMode === "outcome") {
      const hasOutcome = Boolean(state.outcomeStatus);
      const isError = state.outcomeStatus === "error";
      const isSuccess = state.outcomeStatus === "success";

      detailPaneHtml = `
        <section class="inventory-detail-pane review-view" aria-labelledby="detail-heading">
          <div class="pane-header detail-header-row">
            <div>
              <span class="detail-eyebrow">Replenishment Decision</span>
              <h2 id="detail-heading" class="detail-item-title">
                ${hasOutcome ? (isSuccess ? "Decision Recorded" : "Save Interrupted") : "Review Decision"}
              </h2>
            </div>
            <button
              type="button"
              data-testid="back-to-list"
              class="btn btn-outline btn-sm"
            >Back to list</button>
          </div>

          ${hasOutcome ? `
            <div
              data-testid="decision-status"
              class="decision-status-banner ${isError ? "status-error" : "status-success"}"
              role="${isError ? "alert" : "status"}"
            >
              <div class="status-icon" aria-hidden="true">${isError ? "⚠️" : "✓"}</div>
              <div class="status-content">
                <strong class="status-title">${isError ? "Save Failed (Simulated)" : "Decision Saved Successfully"}</strong>
                <p class="status-msg">${escapeHtml(state.statusMessage)}</p>
              </div>
            </div>
          ` : ""}

          <div class="review-summary-card">
            <h3 class="review-card-title">Replenishment Summary</h3>
            <dl class="review-dl">
              <div class="review-dl-row">
                <dt>Selected Item:</dt>
                <dd><strong>${escapeHtml(selectedItem.sku)}</strong> — ${escapeHtml(selectedItem.name)}</dd>
              </div>
              <div class="review-dl-row">
                <dt>Warehouse Location:</dt>
                <dd class="font-mono">${escapeHtml(selectedItem.location)}</dd>
              </div>
              <div class="review-dl-row">
                <dt>Stock Status:</dt>
                <dd>Available: ${selectedItem.available} ${escapeHtml(selectedItem.unit)} | Shortage: ${selectedItem.shortage} ${escapeHtml(selectedItem.unit)} | Incoming: ${selectedItem.incoming} ${escapeHtml(selectedItem.unit)}</dd>
              </div>
              <div class="review-dl-row highlight-row">
                <dt>Requested Replenishment:</dt>
                <dd class="requested-qty-text">
                  <strong>${escapeHtml(currentQtyVal)} ${escapeHtml(selectedItem.unit)}</strong>
                </dd>
              </div>
            </dl>

            <div class="no-po-disclosure" role="note">
              <span class="no-po-icon" aria-hidden="true">ℹ️</span>
              <div class="no-po-text">
                <strong>Simulated Decision Disclosure:</strong>
                Recording this decision logs your replenishment quantity locally. It places <em>no purchase order</em> and does not alter live warehouse inventory.
              </div>
            </div>

            <div class="review-actions">
              ${isError ? `
                <button
                  type="button"
                  data-testid="retry-decision"
                  class="btn btn-primary"
                >Retry decision</button>
              ` : (isSuccess ? `
                <!-- Completed state -->
              ` : `
                <button
                  type="button"
                  data-testid="save-decision"
                  class="btn btn-primary"
                >Save decision</button>
              `)}

              <button
                type="button"
                data-testid="edit-decision"
                class="btn btn-secondary"
              >Edit decision</button>

              <button
                type="button"
                data-testid="back-to-list"
                class="btn btn-outline"
              >Back to list</button>
            </div>
          </div>
        </section>
      `;
    }
  }

  // Combined workspace
  appEl.innerHTML = `
    ${headerHtml}
    <div class="workspace-body">
      ${listPaneHtml}
      ${detailPaneHtml}
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  // Search input
  const searchInput = document.getElementById("inventory-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
      // Keep focus on search input after rerender
      const freshInput = document.getElementById("inventory-search");
      if (freshInput) {
        freshInput.focus();
        freshInput.setSelectionRange(freshInput.value.length, freshInput.value.length);
      }
    });
  }

  // Clear search buttons (both inline and in no-results state)
  const clearButtons = document.querySelectorAll('[data-testid="clear-search"]');
  clearButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      state.searchQuery = "";
      render();
      const freshInput = document.getElementById("inventory-search");
      if (freshInput) {
        freshInput.focus();
      }
    });
  });

  // Shortage only checkbox
  const shortageCheckbox = document.getElementById("shortage-only");
  if (shortageCheckbox) {
    shortageCheckbox.addEventListener("change", (e) => {
      state.shortageOnly = e.target.checked;
      render();
    });
  }

  // Item select controls
  FIXTURE.items.forEach(item => {
    const selectBtn = document.querySelector(`[data-testid="item-${item.sku}"]`);
    if (selectBtn) {
      selectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectItem(item.sku);
      });
    }

    // Also clicking row selects item
    const row = document.querySelector(`[data-testid="inventory-row"][data-sku="${item.sku}"]`);
    if (row) {
      row.addEventListener("click", () => {
        selectItem(item.sku);
      });
    }
  });

  // Quantity input
  const qtyInput = document.getElementById("decision-quantity");
  if (qtyInput) {
    qtyInput.addEventListener("input", (e) => {
      if (state.selectedSku) {
        state.quantities[state.selectedSku] = e.target.value;
        const validation = validateQuantity(e.target.value);
        state.quantityError = validation.error;
        // Fast update review button disabled state and validation message
        const reviewBtn = document.querySelector('[data-testid="review-decision"]');
        if (reviewBtn) {
          reviewBtn.disabled = !validation.valid;
        }
        let valMsg = document.querySelector(".validation-message");
        if (!validation.valid) {
          if (!valMsg) {
            valMsg = document.createElement("div");
            valMsg.className = "validation-message";
            valMsg.setAttribute("role", "alert");
            qtyInput.parentElement.parentElement.appendChild(valMsg);
          }
          valMsg.textContent = validation.error;
          qtyInput.classList.add("input-invalid");
        } else {
          if (valMsg) valMsg.remove();
          qtyInput.classList.remove("input-invalid");
        }
      }
    });
  }

  // Review decision button
  const reviewBtn = document.querySelector('[data-testid="review-decision"]');
  if (reviewBtn) {
    reviewBtn.addEventListener("click", () => {
      if (!state.selectedSku) return;
      const val = state.quantities[state.selectedSku];
      const validation = validateQuantity(val);
      if (!validation.valid) {
        state.quantityError = validation.error;
        render();
        return;
      }
      state.viewMode = "review";
      state.outcomeStatus = null;
      state.statusMessage = "";
      render();
    });
  }

  // Edit decision button
  const editButtons = document.querySelectorAll('[data-testid="edit-decision"]');
  editButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      state.viewMode = "inspect";
      state.outcomeStatus = null;
      state.statusMessage = "";
      render();
    });
  });

  // Save decision button
  const saveBtn = document.querySelector('[data-testid="save-decision"]');
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      handleSave();
    });
  }

  // Retry decision button
  const retryBtn = document.querySelector('[data-testid="retry-decision"]');
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      handleSave(true);
    });
  }

  // Back to list button
  const backButtons = document.querySelectorAll('[data-testid="back-to-list"]');
  backButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedSku = null;
      state.viewMode = "inspect";
      state.outcomeStatus = null;
      state.statusMessage = "";
      render();
    });
  });
}

function selectItem(sku) {
  state.selectedSku = sku;
  state.viewMode = "inspect";
  state.outcomeStatus = null;
  state.statusMessage = "";
  // Initialize quantity if needed
  if (state.quantities[sku] === undefined) {
    const it = FIXTURE.items.find(i => i.sku === sku);
    state.quantities[sku] = it && it.shortage > 0 ? it.shortage : 1;
  }
  render();

  // On small screens, scroll down to the detail section smoothly
  if (window.innerWidth < 900) {
    const detailEl = document.querySelector(".inventory-detail-pane");
    if (detailEl) {
      detailEl.scrollIntoView({ behavior: "smooth" });
    }
  }
}

function handleSave(isRetry = false) {
  const item = FIXTURE.items.find(i => i.sku === state.selectedSku);
  if (!item) return;

  const currentQty = state.quantities[item.sku];

  if (!state.saveFailedOnce && !isRetry) {
    // First simulated save must fail visibly and recoverably
    state.saveFailedOnce = true;
    state.outcomeStatus = "error";
    state.statusMessage = `Simulated network interruption: Failed to record replenishment decision for ${item.sku}. Your entered quantity (${currentQty} ${item.unit}) has been preserved. Please retry.`;
    state.viewMode = "review";
    render();
  } else {
    // Retry succeeds
    state.outcomeStatus = "success";
    state.statusMessage = `Replenishment decision recorded: ${currentQty} ${item.unit} for ${item.sku} saved locally. (Simulated snapshot: no live purchase order placed).`;
    state.viewMode = "review";
    render();
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  render();
});
