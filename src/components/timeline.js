import { getState, subscribe, toggleCredit } from "../state/store.js";
import { CARD_DEFINITIONS } from "../data/cards.js";
import { CREDIT_DEFINITIONS } from "../data/credits.js";
import { toISODate } from "../utils/dates.js";

const containerId = "timeline";

/**
 * Entry point
 */
export function initTimeline() {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`#${containerId} not found in DOM`);
  }

  // Initial render
  render(container, getState());

  // Subscribe to store updates
  subscribe(state => {
    render(container, state);
  });

  // Add event delegation for timeline clicks
  container.addEventListener('click', handleTimelineClick);
}

/**
 * Handle clicks on timeline credit segments
 */
function handleTimelineClick(event) {
  const creditSegment = event.target.closest('[data-credit-id]');
  if (creditSegment && creditSegment.dataset.creditId) {
    const creditId = creditSegment.dataset.creditId;
    const state = getState();
    const isCurrentlyChecked = !!state.checkedCredits[creditId];
    
    // Toggle the credit
    toggleCredit(creditId, !isCurrentlyChecked);
  }
}

/**
 * Main render function
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

  // Group credit instances by card for timeline display
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

/**
 * Render color legend for timeline
 */
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

/**
 * Render global timeline header with months
 */
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

/**
 * Render unified current date line that goes through all rows
 */
function renderCurrentDateLine(year) {
  const currentYear = new Date().getFullYear();
  if (year !== currentYear) {
    return '';
  }
  
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

/**
 * Group credit instances by cardId
 */
function groupByCard(creditInstances) {
  const map = {};

  for (const ci of creditInstances) {
    if (!map[ci.cardId]) {
      map[ci.cardId] = [];
    }
    map[ci.cardId].push(ci);
  }

  return map;
}

/**
 * Render timeline for one card
 */
function renderCardTimeline(cardId, credits, state) {
  const cardDef = CARD_DEFINITIONS[cardId];
  
  // Group credits by creditId for separate rows
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

/**
 * Group credits by creditId to create separate rows for each credit type
 */
function groupCreditsByType(credits) {
  const map = {};
  
  for (const ci of credits) {
    if (!map[ci.creditId]) {
      map[ci.creditId] = [];
    }
    map[ci.creditId].push(ci);
  }
  
  return map;
}

/**
 * Render one credit type row (e.g., all Uber credits for this card)
 */
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

/**
 * Render the actual timeline bar with segments
 */
function renderTimelineBar(creditInstances, creditDef, state) {
  const year = state.year;
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const yearDuration = yearEnd.getTime() - yearStart.getTime();
  const now = new Date();
  
  return creditInstances.map(ci => {
    // Calculate position and width as percentages of the year
    const visibleStart = new Date(Math.max(ci.startDate.getTime(), yearStart.getTime()));
    const visibleEnd = new Date(Math.min(ci.endDate.getTime(), yearEnd.getTime()));
    
    const leftPercent = ((visibleStart.getTime() - yearStart.getTime()) / yearDuration) * 100;
    const widthPercent = ((visibleEnd.getTime() - visibleStart.getTime()) / yearDuration) * 100;
    
    // Determine if credit is active, used, or available
    const isActive = now >= ci.startDate && now <= ci.endDate;
    const isChecked = !!state.checkedCredits[ci.id];
    
    let bgColor;
    if (isChecked) {
      bgColor = "bg-green-400"; // Used
    } else if (isActive) {
      bgColor = "bg-blue-400"; // Currently active
    } else {
      bgColor = "bg-gray-300"; // Future or past
    }
    
    return `
      <div 
        class="${bgColor} absolute top-0 bottom-0 border-r border-white hover:opacity-75 cursor-pointer"
        style="left: ${leftPercent.toFixed(2)}%; width: ${widthPercent.toFixed(2)}%;"
        data-credit-id="${ci.id}"
        title="${creditDef.name}: $${ci.amount} (${toISODate(ci.startDate)} - ${toISODate(ci.endDate)})"
      >
      </div>
    `;
  }).join('');
}
