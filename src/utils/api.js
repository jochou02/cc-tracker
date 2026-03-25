import { API_BASE_URL, API_KEY } from "./config.js";

/**
 * Fetch persisted user state.
 * Returns: { creditState: { [creditInstanceId]: { checked, note, dateUsed } } }
 */
export async function fetchUserState(userId) {
  if (!API_BASE_URL) return { creditState: {} };

  const res = await fetch(`${API_BASE_URL}/state?user=${encodeURIComponent(userId)}`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!res.ok) throw new Error(`GET /state failed: ${res.status}`);
  return res.json();
}

/**
 * Persist the full state entry for a single credit instance.
 */
export async function updateCreditState(userId, creditInstanceId, entry) {
  if (!API_BASE_URL) return;

  const res = await fetch(`${API_BASE_URL}/state`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      user: userId,
      creditId: creditInstanceId,
      ...entry,
    }),
  });

  if (!res.ok) throw new Error(`POST /state failed: ${res.status}`);
}
