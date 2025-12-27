/**
 * Backend stub.
 * This file intentionally does nothing for now.
 */

export async function fetchUserState(userId) {
  return {
    checkedCredits: {}
  };
}

export async function updateCheckedState(userId, creditInstanceId, checked) {
  // no-op
  return;
}
  