// src/components/cardTiles.js

import { getState, subscribe } from "../state/store.js";
import { CARD_DEFINITIONS } from "../data/cards.js";

const containerId = "card-tiles";

export function initCardTiles() {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`#${containerId} not found in DOM`);
  }

  render(container, getState());

  subscribe(state => {
    render(container, state);
  });
}

function render(container, state) {
  const now = new Date();

  // Only active credits matter here
  const activeCredits = state.creditInstances.filter(
    ci => now >= ci.startDate && now <= ci.endDate
  );

  if (activeCredits.length === 0) {
    container.innerHTML = "";
    return;
  }

  const byCard = groupByCard(activeCredits);

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${Object.entries(byCard)
        .map(([cardId, credits]) =>
          renderCardTile(cardId, credits, state.checkedCredits)
        )
        .join("")}
    </div>
  `;
}

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

function renderCardTile(cardId, credits, checkedCredits) {
  const cardDef = CARD_DEFINITIONS[cardId];

  let usedCount = 0;
  let usedAmount = 0;
  let totalAmount = 0;

  for (const ci of credits) {
    totalAmount += ci.amount;

    if (checkedCredits[ci.id]) {
      usedCount += 1;
      usedAmount += ci.amount;
    }
  }

  const remainingAmount = totalAmount - usedAmount;
  const totalCount = credits.length;

  return `
    <div class="border rounded-lg p-4 bg-white">
      <div class="font-medium mb-1">
        ${cardDef.name}
      </div>

      <div class="text-sm text-gray-600 mb-2">
        ${usedCount} / ${totalCount} active credits used
      </div>

      <div class="text-lg font-semibold">
        $${remainingAmount} remaining
      </div>
    </div>
  `;
}
