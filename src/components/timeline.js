import { getState, subscribe, saveCreditEntry } from "../state/store.js";
import { CARD_DEFINITIONS, CREDIT_DEFINITIONS, USERS, CardType } from "../data/definitions.js";
import { toISODate } from "../utils/dates.js";

const containerId = "timeline";
const modalId = "credit-detail-modal";
const infoPopoverId = "credit-info-popover";

/**
 * Entry point
 */
export function initTimeline() {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`#${containerId} not found in DOM`);
  }

  // Inject the persistent modal element into the page (hidden by default)
  injectModal();
  injectInfoPopover();

  // Initial render
  render(container, getState());

  // Subscribe to store updates
  subscribe(state => {
    render(container, state);
  });

  // Event delegation: open modal on segment click
  container.addEventListener("click", handleTimelineClick);

  // Event delegation: open info popover on ⓘ click
  container.addEventListener("click", handleInfoClick);

  // Close popover when clicking outside
  document.addEventListener("click", handleOutsideClick, true);
}

// ---------------------------------------------------------------------------
// Info popover
// ---------------------------------------------------------------------------

function injectInfoPopover() {
  if (document.getElementById(infoPopoverId)) return;

  const el = document.createElement("div");
  el.id = infoPopoverId;
  el.className =
    "hidden absolute z-30 bg-white border rounded-lg shadow-lg p-3 max-w-xs text-sm text-gray-700 leading-relaxed";
  document.body.appendChild(el);
}

function handleInfoClick(event) {
  const btn = event.target.closest("[data-info-description]");
  if (!btn) return;

  event.stopPropagation();

  const description = btn.dataset.infoDescription;
  const popover = document.getElementById(infoPopoverId);

  // If clicking the same button while already open, close it
  if (!popover.classList.contains("hidden") && popover._sourceBtn === btn) {
    popover.classList.add("hidden");
    popover._sourceBtn = null;
    return;
  }

  popover.textContent = description;
  popover._sourceBtn = btn;

  // Position below the button
  const rect = btn.getBoundingClientRect();
  popover.classList.remove("hidden");

  const popoverWidth = popover.offsetWidth;
  let left = rect.left + window.scrollX;
  // Clamp so it doesn't overflow the right edge
  if (left + popoverWidth > window.innerWidth - 8) {
    left = window.innerWidth - popoverWidth - 8;
  }

  popover.style.top = `${rect.bottom + window.scrollY + 4}px`;
  popover.style.left = `${left}px`;
}

function handleOutsideClick(event) {
  const popover = document.getElementById(infoPopoverId);
  if (!popover || popover.classList.contains("hidden")) return;
  if (!popover.contains(event.target) && !event.target.closest("[data-info-description]")) {
    popover.classList.add("hidden");
    popover._sourceBtn = null;
  }
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

/**
 * Create and inject the modal scaffold into <body> once on init.
 * The modal is shown/hidden by toggling the "hidden" class on #credit-detail-modal.
 */
function injectModal() {
  if (document.getElementById(modalId)) return;

  const el = document.createElement("div");
  el.id = modalId;
  el.className = "hidden fixed inset-0 z-50 flex items-center justify-center";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.innerHTML = `
    <!-- Backdrop -->
    <div id="modal-backdrop" class="absolute inset-0 bg-black/40"></div>

    <!-- Dialog -->
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">

      <!-- Header -->
      <div class="space-y-1">
        <p id="modal-card-name" class="text-xs font-medium text-gray-400 uppercase tracking-wide"></p>
        <h2 id="modal-title" class="text-xl font-semibold leading-tight"></h2>
        <div class="flex items-center gap-2 pt-0.5">
          <span id="modal-amount" class="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded"></span>
          <span id="modal-anniversary-badge" class="hidden inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded">Anniversary</span>
          <span class="text-gray-300">·</span>
          <span id="modal-date-range" class="text-xs text-gray-500"></span>
        </div>
        <p id="modal-description" class="text-sm text-gray-500 leading-relaxed pt-1"></p>
      </div>

      <!-- Checked -->
      <label class="flex items-center gap-3 cursor-pointer select-none">
        <input id="modal-checked" type="checkbox" class="h-4 w-4 cursor-pointer" />
        <span class="text-sm font-medium">Mark as used</span>
      </label>

      <!-- Date used -->
      <div>
        <label for="modal-date-used" class="block text-sm font-medium mb-1">Date Used <span class="text-gray-400 font-normal">(optional)</span></label>
        <input
          id="modal-date-used"
          type="date"
          class="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <!-- Note -->
      <div>
        <label for="modal-note" class="block text-sm font-medium mb-1">Notes <span class="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          id="modal-note"
          rows="4"
          class="w-full border rounded p-2 text-sm text-gray-700 resize-y focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Use this to store things like what this credit was used for."
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 pt-1">
        <button
          id="modal-cancel"
          class="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          id="modal-save"
          class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(el);

  // Wire up close actions
  document.getElementById("modal-backdrop").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-save").addEventListener("click", handleModalSave);

  // Close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

/** Currently open credit instance ID */
let _activeCreditId = null;

function openModal(creditInstanceId, creditInstance) {
  _activeCreditId = creditInstanceId;

  const state = getState();
  const entry = state.creditState[creditInstanceId] ?? {};
  const cardDef = CARD_DEFINITIONS[creditInstance.cardId];
  const creditDef = CREDIT_DEFINITIONS[creditInstance.creditId];

  document.getElementById("modal-card-name").textContent = cardDef.name;
  document.getElementById("modal-title").textContent = creditDef.name;
  document.getElementById("modal-amount").textContent =
    creditInstance.amount > 0 ? `$${creditInstance.amount}` : "No cash value";
  const isAnniversary = creditInstance.periodType === "anniversary";
  document.getElementById("modal-anniversary-badge").classList.toggle("hidden", !isAnniversary);
  document.getElementById("modal-date-range").textContent =
    `${toISODate(creditInstance.startDate)}  →  ${toISODate(creditInstance.endDate)}`;
  const descEl = document.getElementById("modal-description");
  descEl.textContent = creditInstance.description ?? "";
  descEl.classList.toggle("hidden", !creditInstance.description);
  document.getElementById("modal-checked").checked = !!entry.checked;
  document.getElementById("modal-date-used").value = entry.dateUsed ?? "";
  document.getElementById("modal-note").value = entry.note ?? "";

  const modal = document.getElementById(modalId);
  modal.classList.remove("hidden");
  document.getElementById("modal-note").focus();
}

function closeModal() {
  _activeCreditId = null;
  document.getElementById(modalId).classList.add("hidden");
}

function handleModalSave() {
  if (!_activeCreditId) return;

  const checked = document.getElementById("modal-checked").checked;
  const dateUsed = document.getElementById("modal-date-used").value;
  const note = document.getElementById("modal-note").value;

  // Single write: one optimistic update, one API call to DynamoDB
  saveCreditEntry(_activeCreditId, { checked, dateUsed, note });

  closeModal();
}

// ---------------------------------------------------------------------------
// Timeline click
// ---------------------------------------------------------------------------

function handleTimelineClick(event) {
  const segment = event.target.closest("[data-credit-id]");
  if (!segment || !segment.dataset.creditId) return;

  const creditId = segment.dataset.creditId;
  const state = getState();
  const creditInstance = state.creditInstances.find(ci => ci.id === creditId);
  if (!creditInstance) return;

  openModal(creditId, creditInstance);
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

/*
 * Layout: a two-column CSS grid.
 *   col 1 = label (fixed 12rem)
 *   col 2 = bar area (1fr)
 *
 * Month header labels and bar segments both use day-accurate
 * percentage positioning inside col 2, so they align perfectly.
 */

/** Days in each month for a given year. */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** Cumulative day offsets: [0, 31, 59, ...totalDays] */
function monthOffsets(year) {
  const o = [0];
  for (let m = 0; m < 12; m++) o.push(o[m] + daysInMonth(year, m));
  return o;
}

/** Date → percentage [0–100] within the year, day-accurate. */
function dateToPct(date, year, offsets) {
  const m = date.getUTCMonth();
  const d = date.getUTCDate() - 1;
  return ((offsets[m] + d) / offsets[12]) * 100;
}

function render(container, state) {
  const userCards = USERS[state.userId]?.cards ?? [];
  if (userCards.length === 0) {
    container.innerHTML = `<div class="text-gray-400 italic">No cards configured for this user</div>`;
    return;
  }

  const grouped = groupByCard(state.creditInstances);
  const userCardIds = userCards.map(uc => uc.id);

  const typeOrder = [CardType.HOTEL, CardType.TRAVEL, CardType.GENERAL];
  const byType = {};
  for (const type of typeOrder) byType[type] = [];
  for (const cardId of userCardIds) {
    byType[CARD_DEFINITIONS[cardId]?.type ?? CardType.GENERAL].push(cardId);
  }

  const typeLabelMap = {
    [CardType.HOTEL]:   "Hotel Cards",
    [CardType.TRAVEL]:  "Travel Cards",
    [CardType.GENERAL]: "General Cards",
  };

  const offsets = monthOffsets(state.year);

  // Month header: labels positioned at the same offsets as the bars
  const monthHeader = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    .map((m, i) => {
      const left = (offsets[i] / offsets[12]) * 100;
      const width = (daysInMonth(state.year, i) / offsets[12]) * 100;
      return `<div class="absolute text-xs font-medium text-gray-500 text-center ${i % 2 === 0 ? 'bg-gray-50/80' : ''}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%;top:0;bottom:0;display:flex;align-items:center;justify-content:center;">${m}</div>`;
    }).join('');

  // Build rows
  let rows = '';

  // Month header row
  rows += `<div></div><div class="relative h-8 border-b border-gray-200">${monthHeader}</div>`;

  for (const type of typeOrder) {
    if (byType[type].length === 0) continue;

    rows += `<div class="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-gray-300 pt-4 pb-1">${typeLabelMap[type]}</div>`;

    for (const cardId of byType[type]) {
      const cardDef = CARD_DEFINITIONS[cardId];
      const credits = grouped[cardId] ?? [];
      const creditRows = groupByCredit(credits);

      rows += `<div class="col-span-2 text-sm font-semibold text-gray-800 pt-2 pb-1">${cardDef.name}</div>`;

      if (Object.keys(creditRows).length === 0) {
        rows += `<div class="col-span-2 text-xs text-gray-300 italic pb-1">No statement credits</div>`;
        continue;
      }

      for (const [creditId, instances] of Object.entries(creditRows)) {
        rows += renderCreditRow(creditId, instances, state, offsets);
      }
    }
  }

  container.innerHTML = `
    <div class="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Timeline · ${state.year}</h2>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded bg-blue-500"></span>Active</span>
          <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded bg-emerald-300"></span>Used</span>
          <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded bg-gray-200 border border-gray-300"></span>Inactive</span>
        </div>
      </div>
      <div class="grid" style="grid-template-columns: 12rem 1fr;">
        ${rows}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByCard(instances) {
  const m = {};
  for (const ci of instances) (m[ci.cardId] ??= []).push(ci);
  return m;
}

function groupByCredit(instances) {
  const m = {};
  for (const ci of instances) (m[ci.creditId] ??= []).push(ci);
  return m;
}

function renderCreditRow(creditId, instances, state, offsets) {
  const creditDef = CREDIT_DEFINITIONS[creditId];
  const desc = instances[0]?.description ?? "";
  const year = state.year;
  const now = Date.now();

  const label = `
    <div class="flex items-center gap-1 min-w-0 pr-2 py-1">
      <span class="text-xs text-gray-500 truncate">${creditDef.name}</span>
      ${instances[0]?.periodType === "anniversary"
        ? '<span class="flex-shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-px rounded" title="Anniversary-based period">Anniv</span>'
        : ''}
      ${desc
        ? `<button data-info-description="${desc.replace(/"/g, "&quot;")}" class="flex-shrink-0 text-gray-300 hover:text-blue-500 text-xs leading-none" aria-label="Info" title="Info">ⓘ</button>`
        : ''}
    </div>
  `;

  const ys = new Date(Date.UTC(year, 0, 1));
  const ye = new Date(Date.UTC(year, 11, 31));

  // Gap between segments: 3px on each side = 6px total gap between adjacent segments
  const gapPx = 2;

  const segments = instances.map(ci => {
    const vs = new Date(Math.max(ci.startDate.getTime(), ys.getTime()));
    const ve = new Date(Math.min(ci.endDate.getTime(), ye.getTime()));

    const left = dateToPct(vs, year, offsets);
    const right = dateToPct(ve, year, offsets);
    const dayPct = (1 / offsets[12]) * 100;
    const width = right - left + dayPct;

    const entry = state.creditState[ci.id] ?? {};
    const checked = !!entry.checked;
    const active = now >= ci.startDate.getTime() && now <= ci.endDate.getTime();
    const hasNote = !!(entry.note?.trim());

    const bg = checked ? 'bg-emerald-300 text-white' : active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400';

    // Show date range inside anniversary credit boxes if wide enough (~2+ months)
    const isAnniv = ci.periodType === "anniversary";
    const dateLabel = isAnniv && width > 16 ? `${formatShortDate(ci.startDate)} → ${formatShortDate(ci.endDate)}` : '';

    return `<div
      class="${bg} absolute rounded-md h-7 flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 transition-all"
      style="left:calc(${left.toFixed(2)}% + ${gapPx}px);width:calc(${width.toFixed(2)}% - ${gapPx * 2}px);top:50%;transform:translateY(-50%)"
      data-credit-id="${ci.id}"
      title="${creditDef.name}: $${ci.amount} · ${toISODate(ci.startDate)} → ${toISODate(ci.endDate)}${hasNote ? ' 📝' : ''}"
    >${dateLabel ? `<span class="text-[10px] font-medium opacity-80 truncate">${dateLabel}</span>` : ''}${checked ? '<span class="text-[10px] font-bold">✓</span>' : ''}${hasNote ? '<span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 pointer-events-none"></span>' : ''}</div>`;
  }).join('');

  const bar = `<div class="relative h-9">${segments}</div>`;

  return label + bar;
}

/** Format a UTC Date as "Mon D, YYYY" (e.g. "Jun 26, 2025") */
function formatShortDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
