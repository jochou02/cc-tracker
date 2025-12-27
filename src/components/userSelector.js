import { getState, subscribe, setUser } from "../state/store.js";
import { USERS } from "../data/userCards.js";

const containerId = "user-selector";

export function initUserSelector() {
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
  const userIds = Object.keys(USERS);

  if (userIds.length <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-600">
        User:
      </label>
      <select
        id="user-select"
        class="border rounded px-2 py-1 text-sm"
      >
        ${userIds
          .map(
            id => `
              <option value="${id}" ${
                id === state.userId ? "selected" : ""
              }>
                ${id}
              </option>
            `
          )
          .join("")}
      </select>
    </div>
  `;

  const select = container.querySelector("#user-select");
  select.onchange = e => {
    setUser(e.target.value);
  };
}
