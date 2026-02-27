/**
 * Backend stub.
 * These functions are no-ops until the real backend is wired up.
 * See README sections 11–13 for the planned API design.
 */

/**
 * Fetch persisted user state.
 * Returns: { creditState: { [creditInstanceId]: { checked: bool, note: string } } }
 */
export async function fetchUserState(userId) {
  return {
    creditState: {}
  };
}

/**
 * Persist the full state entry for a single credit instance.
 * @param {string} userId
 * @param {string} creditInstanceId  - opaque ID, e.g. "amex_plat_uber_2026-02-01_2026-02-28"
 * @param {{ checked?: boolean, note?: string }} entry
 */
export async function updateCreditState(userId, creditInstanceId, entry) {
  // no-op
  return;
}