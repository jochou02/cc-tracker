import { initStore, subscribe, getState } from "./state/store.js";
import { initUserSelector } from "./components/userSelector.js";
import { initYearSelector } from "./components/yearSelector.js";
import { initCardTiles } from "./components/cardTiles.js";
import { initTimeline } from "./components/timeline.js";

async function main() {
  showLoading(true);

  await initStore();
  initUserSelector();
  initYearSelector();
  initCardTiles();
  initTimeline();

  subscribe(state => showLoading(state.loading));
  showLoading(getState().loading);
}

function showLoading(loading) {
  let overlay = document.getElementById("loading-overlay");
  if (loading) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.className = "fixed inset-0 z-[90] bg-white/60 flex items-center justify-center";
      overlay.innerHTML = `<span class="text-gray-500 text-sm animate-pulse">Loading…</span>`;
      document.body.appendChild(overlay);
    }
  } else {
    overlay?.remove();
  }
}

main();
