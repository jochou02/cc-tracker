import { getState, subscribe, setYear } from "../state/store.js";

const containerId = "toolbar-year";

export function initYearSelector() {
  const container = document.getElementById(containerId);
  if (!container) return;

  render(container, getState());
  subscribe(state => render(container, state));
}

function render(container, state) {
  container.innerHTML = `
    <div class="flex items-center gap-1.5">
      <button id="year-prev" class="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Previous year">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <span class="text-sm font-semibold tabular-nums min-w-[3rem] text-center">${state.year}</span>
      <button id="year-next" class="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Next year">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  `;

  container.querySelector("#year-prev").onclick = () => setYear(state.year - 1);
  container.querySelector("#year-next").onclick = () => setYear(state.year + 1);
}
