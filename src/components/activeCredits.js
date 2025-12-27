import { getState, subscribe, toggleCredit } from "../state/store.js";
import { CARD_DEFINITIONS } from "../data/cards.js";
import { CREDIT_DEFINITIONS } from "../data/credits.js";
import { toISODate } from "../utils/dates.js";

const containerId = "active-credits";

/**
 * Entry point
 */
export function initActiveCredits() {
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
}

/**
 * Render active credits list
 */
function render(container, state) {
  const now = new Date();

  const activeCredits = state.creditInstances.filter(ci =>
    now >= ci.startDate && now <= ci.endDate
  );

  if (activeCredits.length === 0) {
    container.innerHTML = `
      <div class="text-gray-500 italic">
        No active credits right now
      </div>
    `;
    return;
  }

  const grouped = groupByCard(activeCredits);

  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">
      Active Credits
    </h2>
    <div class="space-y-4">
      ${Object.entries(grouped)
        .map(([cardId, credits]) =>
          renderCardGroup(cardId, credits, state.checkedCredits)
        )
        .join("")}
    </div>
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
 * Render one card section
 */
function renderCardGroup(cardId, credits, checkedCredits) {
  const cardDef = CARD_DEFINITIONS[cardId];

  return `
    <div class="border rounded-lg p-4">
      <h3 class="font-medium mb-2">
        ${cardDef.name}
      </h3>
      <ul class="space-y-2">
        ${credits
          .map(ci => renderCreditItem(ci, checkedCredits))
          .join("")}
      </ul>
    </div>
  `;
}

/**
 * Render one credit row
 */
function renderCreditItem(creditInstance, checkedCredits) {
  const creditDef = CREDIT_DEFINITIONS[creditInstance.creditId];
  const checked = !!checkedCredits[creditInstance.id];

  return `
    <li class="flex items-center justify-between">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          class="h-4 w-4"
          data-credit-id="${creditInstance.id}"
          ${checked ? "checked" : ""}
        />
        <div>
          <div class="font-medium">
            ${creditDef.name}
            <span class="text-sm text-gray-500">
              ($${creditInstance.amount})
            </span>
          </div>
          <div class="text-sm text-gray-500">
            ${toISODate(creditInstance.startDate)} →
            ${toISODate(creditInstance.endDate)}
          </div>
        </div>
      </label>
    </li>
  `;
}

/**
 * Event delegation
 */
document.addEventListener("change", e => {
  const input = e.target;
  if (
    input instanceof HTMLInputElement &&
    input.type === "checkbox" &&
    input.dataset.creditId
  ) {
    toggleCredit(input.dataset.creditId, input.checked);
  }
});
