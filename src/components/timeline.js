import { getState, subscribe, toggleCredit } from "../state/store.js";
import { CARD_DEFINITIONS } from "../data/cards.js";
import { CREDIT_DEFINITIONS } from "../data/credits.js";
import { toISODate } from "../utils/dates.js";

const containerId = "timeline";

const LABEL_WIDTH_REM = 8;
const AMOUNT_WIDTH_REM = 4;


/**
 * Entry point
 */
export function initTimeline() {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`#${containerId} not found in DOM`);
  }

  render(container, getState());

  subscribe(state => {
    render(container, state);
  });

  container.addEventListener("click", handleTimelineClick);
}

/**
 * Handle clicks on timeline credit segments
 */
function handleTimelineClick(event) {
  const segment = event.target.closest("[data-credit-id]");
  if (!segment) return;

  const creditInstanceId = segment.dataset.creditId;
  if (!creditInstanceId) return;

  const state = getState();
  const isChecked = !!state.checkedCredits[creditInstanceId];
  toggleCredit(creditInstanceId, !isChecked);
}

/**
 * Main render
 */
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
          Timeline — ${state.year}
        </h2>
        ${renderLegend()}
      </div>

      <div class="relative mb-4">
        ${renderMonthHeader()}
      </div>

      <div class="relative">
        ${renderTodayIndicator(state.year)}
        <div class="space-y-6">
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

/**
 * Legend
 */
function renderLegend() {
  return `
    <div class="flex items-center gap-4 text-xs text-gray-600">
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

/**
 * Month header (pure flex, no absolute positioning bugs)
 */
function renderMonthHeader() {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return `
    <div
      class="ml-${LABEL_WIDTH_REM * 4} h-8 border rounded bg-gray-100 flex text-xs font-medium text-gray-600"
    >
      ${months.map(m => `
        <div class="flex-1 flex items-center justify-center border-r last:border-r-0">
          ${m}
        </div>
      `).join("")}
    </div>
  `;
}

/**
 * Today indicator (local time, aligned to timeline)
 */
function renderTodayIndicator(year) {
  const now = new Date();
  if (now.getFullYear() !== year) return "";

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);
  const yearDuration = yearEnd - yearStart;

  const pct = ((now - yearStart) / yearDuration) * 100;

  return `
    <div
      class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style="left: ${pct.toFixed(2)}%;"
      title="Today"
    ></div>
  `;
}

/**
 * Group credit instances by card
 */
function groupByCard(instances) {
  const map = {};
  for (const ci of instances) {
    if (!map[ci.cardId]) map[ci.cardId] = [];
    map[ci.cardId].push(ci);
  }
  return map;
}

/**
 * Render one card section
 */
function renderCardTimeline(cardId, credits, state) {
  const cardDef = CARD_DEFINITIONS[cardId];
  const creditRows = groupByCreditType(credits);

  return `
    <div class="border-b pb-6 last:border-b-0">
      <h3 class="font-medium text-lg mb-3">
        ${cardDef.name}
      </h3>

      <div class="space-y-2">
        ${Object.entries(creditRows)
          .map(([creditId, instances]) =>
            renderCreditRow(creditId, instances, state)
          )
          .join("")}
      </div>
    </div>
  `;
}

/**
 * Group instances by creditId
 */
function groupByCreditType(credits) {
  const map = {};
  for (const ci of credits) {
    if (!map[ci.creditId]) map[ci.creditId] = [];
    map[ci.creditId].push(ci);
  }
  return map;
}

/**
 * Render one credit row
 */
function renderCreditRow(creditId, instances, state) {
  const creditDef = CREDIT_DEFINITIONS[creditId];

  return `
    <div class="flex items-center">
      <div class="w-32 text-sm font-medium pr-2 leading-tight">
        ${creditDef.name}
      </div>
      <div class="relative flex-1 h-8 border rounded overflow-hidden bg-white">
        ${renderSegments(instances, creditDef, state)}
      </div>
    </div>
  `;
}

/**
 * Render timeline segments
 */
function renderSegments(instances, creditDef, state) {
  const year = state.year;
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);
  const yearDuration = yearEnd - yearStart;
  const now = new Date();

  return instances
    .map(ci => {
      const visibleStart = new Date(Math.max(ci.startDate, yearStart));
      const visibleEnd = new Date(Math.min(ci.endDate, yearEnd));

      if (visibleEnd <= visibleStart) return "";

      const leftPct = ((visibleStart - yearStart) / yearDuration) * 100;
      const widthPct = ((visibleEnd - visibleStart) / yearDuration) * 100;

      const isUsed = !!state.checkedCredits[ci.id];
      const isActive = !isUsed && now >= ci.startDate && now <= ci.endDate;

      let bg;
      if (isUsed) bg = "bg-green-400";
      else if (isActive) bg = "bg-blue-400";
      else bg = "bg-gray-300";

      return `
        <div
          class="${bg} absolute top-0 bottom-0 border-r border-white hover:opacity-80 cursor-pointer"
          style="left:${leftPct.toFixed(2)}%; width:${widthPct.toFixed(2)}%;"
          data-credit-id="${ci.id}"
          title="${creditDef.name} • $${ci.amount} (${toISODate(ci.startDate)} → ${toISODate(ci.endDate)})"
        ></div>
      `;
    })
    .join("");
}
