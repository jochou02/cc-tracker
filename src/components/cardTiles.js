// src/components/cardTiles.js

import { getState, subscribe } from "../state/store.js";
import { CARD_DEFINITIONS, CREDIT_DEFINITIONS, USERS } from "../data/definitions.js";

const containerId = "card-tiles";
const modalId = "card-detail-modal";

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function initCardTiles() {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`#${containerId} not found in DOM`);
  }

  injectModal();

  render(container, getState());

  subscribe(state => {
    render(container, state);
  });

  // Event delegation: open modal on tile click
  container.addEventListener("click", handleTileClick);
}

// ---------------------------------------------------------------------------
// Render tiles
// ---------------------------------------------------------------------------

function render(container, state) {
  const userCards = USERS[state.userId]?.cards ?? [];

  if (userCards.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Group all credit instances for the selected year by cardId
  const byCard = groupByCard(state.creditInstances);

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${userCards
        .map(uc => renderCardTile(uc.id, byCard[uc.id] ?? [], state.creditState, state.year, uc.anniversaryDate))
        .join("")}
    </div>
  `;
}

function groupByCard(creditInstances) {
  const map = {};
  for (const ci of creditInstances) {
    if (!map[ci.cardId]) map[ci.cardId] = [];
    map[ci.cardId].push(ci);
  }
  return map;
}

function renderCardTile(cardId, allCredits, creditState, year, anniversaryDate) {
  const cardDef = CARD_DEFINITIONS[cardId];
  const now = new Date();

  // Only count active credits (active relative to now) for usage tracking
  const activeCredits = allCredits.filter(ci => now >= ci.startDate && now <= ci.endDate);

  let usedCount = 0;
  let usedAmount = 0;
  let totalAmount = 0;

  for (const ci of activeCredits) {
    totalAmount += ci.amount;
    if (creditState[ci.id]?.checked) {
      usedCount += 1;
      usedAmount += ci.amount;
    }
  }

  const remainingAmount = totalAmount - usedAmount;
  const totalCount = activeCredits.length;
  const hasActiveCredits = totalCount > 0;
  const allUsed = hasActiveCredits && usedCount === totalCount;

  const feeStr = cardDef.annualFee > 0 ? `$${cardDef.annualFee}/yr` : "No annual fee";
  const annivStr = anniversaryDate ? formatAnniversaryDate(anniversaryDate) : null;

  // Progress bar width
  const progressPct = totalCount > 0 ? (usedCount / totalCount) * 100 : 0;

  return `
    <div
      class="border border-gray-200 rounded-xl p-4 bg-white cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
      data-card-id="${cardId}"
      role="button"
      tabindex="0"
    >
      <div class="text-sm font-semibold text-gray-800 mb-0.5">${cardDef.name}</div>

      <div class="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
        <span>${feeStr}</span>
        ${annivStr ? `<span>·</span><span>Anniv. ${annivStr}</span>` : ""}
      </div>

      ${hasActiveCredits ? `
        <div class="flex items-baseline justify-between mb-1.5">
          <span class="text-sm font-semibold ${allUsed ? 'text-emerald-400' : 'text-gray-800'}">${usedCount} / ${totalCount} used</span>
          ${remainingAmount > 0 ? `<span class="text-xs text-gray-400">$${remainingAmount} remaining</span>` : ''}
        </div>
        <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div class="h-full rounded-full ${allUsed ? 'bg-emerald-300' : 'bg-blue-500'} transition-all" style="width:${progressPct}%"></div>
        </div>
      ` : `
        <div class="text-sm text-gray-400">No active credits</div>
      `}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Tile click handler
// ---------------------------------------------------------------------------

function handleTileClick(event) {
  const tile = event.target.closest("[data-card-id]");
  if (!tile) return;
  const state = getState();
  const userCards = USERS[state.userId]?.cards ?? [];
  const userCard = userCards.find(uc => uc.id === tile.dataset.cardId);
  openModal(tile.dataset.cardId, userCard?.anniversaryDate ?? null);
}

// ---------------------------------------------------------------------------
// Card detail modal
// ---------------------------------------------------------------------------

function injectModal() {
  if (document.getElementById(modalId)) return;

  const el = document.createElement("div");
  el.id = modalId;
  el.className = "hidden fixed inset-0 z-50 flex items-center justify-center";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.innerHTML = `
    <!-- Backdrop -->
    <div id="card-modal-backdrop" class="absolute inset-0 bg-black/40"></div>

    <!-- Dialog -->
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h2 id="card-modal-title" class="text-xl font-semibold leading-tight"></h2>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span id="card-modal-type" class="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded"></span>
            <span id="card-modal-fee" class="text-xs font-medium text-gray-500"></span>
            <span id="card-modal-anniv" class="hidden text-xs font-medium text-gray-500"></span>
          </div>
        </div>
        <button id="card-modal-close" class="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4">✕</button>
      </div>

      <!-- Multipliers -->
      <div id="card-modal-multipliers-section">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Earning Rates</h3>
        <ul id="card-modal-multipliers" class="space-y-1 text-sm text-gray-600"></ul>
      </div>

      <!-- Credits -->
      <div id="card-modal-credits-section">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Statement Credits</h3>
        <ul id="card-modal-credits" class="space-y-1 text-sm text-gray-600"></ul>
      </div>

      <!-- Benefits -->
      <div id="card-modal-benefits-section">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Benefits</h3>
        <ul id="card-modal-benefits" class="space-y-1 text-sm text-gray-600"></ul>
      </div>

    </div>
  `;

  document.body.appendChild(el);

  document.getElementById("card-modal-backdrop").addEventListener("click", closeModal);
  document.getElementById("card-modal-close").addEventListener("click", closeModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

function openModal(cardId, anniversaryDate) {
  const cardDef = CARD_DEFINITIONS[cardId];
  if (!cardDef) return;

  // Title & meta
  document.getElementById("card-modal-title").textContent = cardDef.name;
  document.getElementById("card-modal-type").textContent =
    cardDef.type.charAt(0).toUpperCase() + cardDef.type.slice(1);
  document.getElementById("card-modal-fee").textContent =
    cardDef.annualFee > 0 ? `$${cardDef.annualFee}/yr` : "No annual fee";

  const annivEl = document.getElementById("card-modal-anniv");
  if (anniversaryDate) {
    annivEl.textContent = `· Anniv. ${formatAnniversaryDate(anniversaryDate)}`;
    annivEl.classList.remove("hidden");
  } else {
    annivEl.classList.add("hidden");
  }

  // Multipliers
  const multipliersEl = document.getElementById("card-modal-multipliers");
  const multipliersSection = document.getElementById("card-modal-multipliers-section");
  if (cardDef.multipliers?.length > 0) {
    multipliersEl.innerHTML = cardDef.multipliers
      .map(m => `<li class="flex justify-between"><span>${m.category}</span><span class="font-medium">${m.multiplier}x</span></li>`)
      .join("");
    multipliersSection.classList.remove("hidden");
  } else {
    multipliersSection.classList.add("hidden");
  }

  // Credits
  const creditsEl = document.getElementById("card-modal-credits");
  const creditsSection = document.getElementById("card-modal-credits-section");
  if (cardDef.credits?.length > 0) {
    creditsEl.innerHTML = cardDef.credits
      .map(c => {
        const creditDef = CREDIT_DEFINITIONS[c.creditId];
        const amountStr = c.amount > 0 ? `$${c.amount}` : "No cash value";
        const cadenceStr = c.cadence.charAt(0).toUpperCase() + c.cadence.slice(1);
        const descStr = c.description ? ` — <span class="text-gray-400 italic">${c.description}</span>` : "";
        return `<li><span class="font-medium">${creditDef.name}</span> · ${amountStr} · ${cadenceStr}${descStr}</li>`;
      })
      .join("");
    creditsSection.classList.remove("hidden");
  } else {
    creditsSection.classList.add("hidden");
  }

  // Benefits
  const benefitsEl = document.getElementById("card-modal-benefits");
  const benefitsSection = document.getElementById("card-modal-benefits-section");
  if (cardDef.benefits?.length > 0) {
    benefitsEl.innerHTML = cardDef.benefits
      .map(b => `<li class="flex gap-2"><span class="text-gray-400 mt-0.5">•</span><span>${b}</span></li>`)
      .join("");
    benefitsSection.classList.remove("hidden");
  } else {
    benefitsSection.classList.add("hidden");
  }

  document.getElementById(modalId).classList.remove("hidden");
}

function closeModal() {
  document.getElementById(modalId).classList.add("hidden");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format "MM-DD" into a readable string like "Oct 25".
 */
function formatAnniversaryDate(mmdd) {
  const [month, day] = mmdd.split("-").map(Number);
  const date = new Date(Date.UTC(2000, month - 1, day));
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}
