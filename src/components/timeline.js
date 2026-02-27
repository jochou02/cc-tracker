import { getState, subscribe, saveCreditEntry } from "../state/store.js";
import { CARD_DEFINITIONS } from "../data/cards.js";
import { CREDIT_DEFINITIONS } from "../data/credits.js";
import { toISODate } from "../utils/dates.js";

const containerId = "timeline";
const modalId = "credit-detail-modal";

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

  // Initial render
  render(container, getState());

  // Subscribe to store updates
  subscribe(state => {
    render(container, state);
  });

  // Event delegation: open modal on segment click
  container.addEventListener("click", handleTimelineClick);
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
      <div>
        <h2 id="modal-title" class="text-lg font-semibold"></h2>
        <p id="modal-subtitle" class="text-sm text-gray-500 mt-0.5"></p>
      </div>

      <!-- Checked -->
      <label class="flex items-center gap-3 cursor-pointer select-none">
        <input id="modal-checked" type="checkbox" class="h-4 w-4 cursor-pointer" />
        <span class="text-sm font-medium">Mark as used</span>
      </label>

      <!-- Note -->
      <div>
        <label for="modal-note" class="block text-sm font-medium mb-1">Notes</label>
        <textarea
          id="modal-note"
          rows="4"
          class="w-full border rounded p-2 text-sm text-gray-700 resize-y focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Optional field for notes. Use this to store things like what this credit was used for."
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

  document.getElementById("modal-title").textContent =
    `${cardDef.name} — ${creditDef.name}`;
  document.getElementById("modal-subtitle").textContent =
    `$${creditInstance.amount}  ·  ${toISODate(creditInstance.startDate)} – ${toISODate(creditInstance.endDate)}`;
  document.getElementById("modal-checked").checked = !!entry.checked;
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
  const note = document.getElementById("modal-note").value;

  // Single write: one optimistic update, one API call to DynamoDB
  saveCreditEntry(_activeCreditId, { checked, note });

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

function render(container, state) {
  if (state.creditInstances.length === 0) {
    container.innerHTML = `
      <div class="text-gray-500 italic">
        No credits for this year
      </div>
    `;
    return;
  }

  const grouped = groupByCard(state.creditInstances);

  container.innerHTML = `
    <div class="bg-white border rounded-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">
          Timeline - ${state.year}
        </h2>
        ${renderLegend()}
      </div>

      <!-- Global timeline header -->
      <div class="relative mb-4">
        ${renderGlobalTimelineHeader(state.year)}
      </div>

      <!-- Timeline content with unified current date line -->
      <div class="relative">
        ${renderCurrentDateLine(state.year)}
        <div class="space-y-4">
          ${Object.entries(grouped)
            .map(([cardId, credits]) =>
              renderCardTimeline(cardId, credits, state)
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function renderLegend() {
  return `
    <div class="flex items-center gap-4 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-blue-400 rounded"></div>
        <span>Active</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-green-400 rounded"></div>
        <span>Used</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-gray-300 rounded"></div>
        <span>Inactive</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-1 h-3 bg-red-500"></div>
        <span>Today</span>
      </div>
    </div>
  `;
}

function renderGlobalTimelineHeader(year) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `
    <div class="relative h-8 bg-gray-100 border rounded ml-32">
      <div class="absolute inset-0 flex">
        ${months.map((month, index) => {
          const leftPercent = (index / 12) * 100;
          const widthPercent = (1 / 12) * 100;
          return `
            <div
              class="border-r border-gray-300 flex items-center justify-start pl-2 text-xs font-medium text-gray-600"
              style="left: ${leftPercent}%; width: ${widthPercent}%;"
            >
              ${month}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderCurrentDateLine(year) {
  const currentYear = new Date().getFullYear();
  if (year !== currentYear) return '';

  const now = new Date();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const yearDuration = yearEnd.getTime() - yearStart.getTime();
  const currentPercent = ((now.getTime() - yearStart.getTime()) / yearDuration) * 100;

  return `
    <div
      class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style="left: ${currentPercent.toFixed(2)}%;"
      title="Today"
    ></div>
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

function renderCardTimeline(cardId, credits, state) {
  const cardDef = CARD_DEFINITIONS[cardId];
  const creditRows = groupCreditsByType(credits);

  return `
    <div class="border-b pb-4 last:border-b-0">
      <h3 class="font-medium text-lg mb-3">
        ${cardDef.name}
      </h3>
      <div class="space-y-2">
        ${Object.entries(creditRows)
          .map(([creditId, creditInstances]) =>
            renderCreditRow(creditId, creditInstances, state)
          )
          .join("")}
      </div>
    </div>
  `;
}

function groupCreditsByType(credits) {
  const map = {};
  for (const ci of credits) {
    if (!map[ci.creditId]) map[ci.creditId] = [];
    map[ci.creditId].push(ci);
  }
  return map;
}

function renderCreditRow(creditId, creditInstances, state) {
  const creditDef = CREDIT_DEFINITIONS[creditId];

  return `
    <div class="flex items-center">
      <div class="text-sm font-medium w-32 flex-shrink-0">
        ${creditDef.name}
      </div>
      <div class="relative bg-white border rounded h-8 overflow-hidden flex-1">
        ${renderTimelineBar(creditInstances, creditDef, state)}
      </div>
    </div>
  `;
}

function renderTimelineBar(creditInstances, creditDef, state) {
  const year = state.year;
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const yearDuration = yearEnd.getTime() - yearStart.getTime();
  const now = new Date();

  return creditInstances.map(ci => {
    const visibleStart = new Date(Math.max(ci.startDate.getTime(), yearStart.getTime()));
    const visibleEnd = new Date(Math.min(ci.endDate.getTime(), yearEnd.getTime()));

    const leftPercent = ((visibleStart.getTime() - yearStart.getTime()) / yearDuration) * 100;
    const widthPercent = ((visibleEnd.getTime() - visibleStart.getTime()) / yearDuration) * 100;

    const isActive = now >= ci.startDate && now <= ci.endDate;
    const entry = state.creditState[ci.id] ?? {};
    const isChecked = !!entry.checked;
    const hasNote = !!(entry.note && entry.note.trim());

    let bgColor;
    if (isChecked) {
      bgColor = "bg-green-400";
    } else if (isActive) {
      bgColor = "bg-blue-400";
    } else {
      bgColor = "bg-gray-300";
    }

    return `
      <div
        class="${bgColor} absolute top-0 bottom-0 border-r border-white hover:opacity-75 cursor-pointer"
        style="left: ${leftPercent.toFixed(2)}%; width: ${widthPercent.toFixed(2)}%;"
        data-credit-id="${ci.id}"
        title="${creditDef.name}: $${ci.amount} (${toISODate(ci.startDate)} – ${toISODate(ci.endDate)})${hasNote ? " 📝" : ""}"
      >
        ${hasNote ? `<span class="absolute bottom-0.5 right-0.5 text-xs leading-none pointer-events-none select-none">📝</span>` : ""}
      </div>
    `;
  }).join('');
}