const CONTAINER_ID = "toast-container";
const DURATION_MS = 3000;

/**
 * Show a brief toast notification.
 * @param {string} message
 * @param {"success"|"error"} type
 */
export function showToast(message, type = "success") {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;

  const colors = type === "error"
    ? "bg-red-600 text-white"
    : "bg-gray-800 text-white";

  const el = document.createElement("div");
  el.className = `${colors} text-sm px-4 py-2 rounded shadow-lg transition-opacity duration-300`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add("opacity-0");
    setTimeout(() => el.remove(), 300);
  }, DURATION_MS);
}
