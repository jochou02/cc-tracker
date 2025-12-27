// src/components/yearSelector.js

import { getState, subscribe, setYear } from "../state/store.js";

const containerId = "year-selector";

export function initYearSelector() {
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
  container.innerHTML = `
    <div class="flex items-center gap-3">
      <button
        id="year-prev"
        class="px-2 py-1 border rounded text-sm hover:bg-gray-100"
        aria-label="Previous year"
      >
        ◀
      </button>

      <div class="font-medium">
        ${state.year}
      </div>

      <button
        id="year-next"
        class="px-2 py-1 border rounded text-sm hover:bg-gray-100"
        aria-label="Next year"
      >
        ▶
      </button>
    </div>
  `;

  container.querySelector("#year-prev").onclick = () => {
    setYear(state.year - 1);
  };

  container.querySelector("#year-next").onclick = () => {
    setYear(state.year + 1);
  };
}
