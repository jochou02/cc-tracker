import { getState, subscribe, setUser } from "../state/store.js";
import { USERS } from "../data/definitions.js";

const containerId = "toolbar-user";

export function initUserSelector() {
  const container = document.getElementById(containerId);
  if (!container) return;

  render(container, getState());
  subscribe(state => render(container, state));
}

function render(container, state) {
  const userIds = Object.keys(USERS);

  if (userIds.length <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="flex items-center gap-1">
      ${userIds
        .map(id => {
          const active = id === state.userId;
          const cls = active
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:bg-gray-100";
          return `<button data-user="${id}" class="${cls} px-3 py-1 rounded-full text-sm font-medium transition-colors">${USERS[id].userId}</button>`;
        })
        .join("")}
    </div>
  `;

  container.querySelectorAll("[data-user]").forEach(btn => {
    btn.onclick = () => setUser(btn.dataset.user);
  });
}
