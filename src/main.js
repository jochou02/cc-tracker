import { initStore } from "./state/store.js";
import { initActiveCredits } from "./components/activeCredits.js";
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
  initActiveCredits();
}

main();
