import { initStore } from "./state/store.js";
// FUTURE (not in MVP): Active credits list
// import { initActiveCredits } from "./components/activeCredits.js";
import { initUserSelector } from "./components/userSelector.js";
import { initYearSelector } from "./components/yearSelector.js";
import { initCardTiles } from "./components/cardTiles.js";
import { initTimeline } from "./components/timeline.js";

async function main() {
  await initStore();
  initUserSelector();
  initYearSelector();
  initCardTiles();
  initTimeline();
  // FUTURE (not in MVP): initActiveCredits();
}

main();
