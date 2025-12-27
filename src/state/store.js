// src/state/store.js

import { expandCreditsForUserAndYear } from "../utils/creditExpansion.js";
import { USERS } from "../data/userCards.js";
import {
  fetchUserState,
  updateCheckedState
} from "../utils/api.js";

/**
 * -------------------------
 * Internal mutable state
 * -------------------------
 */

const state = {
  userId: null,
  year: null,

  // persisted
  checkedCredits: {},

  // derived
  creditInstances: []
};

const listeners = new Set();

/**
 * -------------------------
 * Public selectors
 * -------------------------
 */

export function getState() {
  return {
    userId: state.userId,
    year: state.year,
    checkedCredits: { ...state.checkedCredits },
    creditInstances: [...state.creditInstances]
  };
}

/**
 * -------------------------
 * Subscription model
 * -------------------------
 */

export function subscribe(listener) {
  listeners.add(listener);

  // return unsubscribe
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  for (const listener of listeners) {
    listener(getState());
  }
}

/**
 * -------------------------
 * Initialization
 * -------------------------
 */

export async function initStore() {
  // Default user = first configured user
  const userIds = Object.keys(USERS);
  if (userIds.length === 0) {
    throw new Error("No users defined in USERS config");
  }

  state.userId = userIds[0];
  state.year = new Date().getFullYear();

  await loadUserState();
  recomputeCredits();
  notify();
}

/**
 * -------------------------
 * User / Year switching
 * -------------------------
 */

export async function setUser(userId) {
  if (!USERS[userId]) {
    throw new Error(`Unknown user: ${userId}`);
  }

  if (state.userId === userId) {
    return;
  }

  state.userId = userId;
  state.checkedCredits = {};

  await loadUserState();
  recomputeCredits();
  notify();
}

export function setYear(year) {
  if (state.year === year) {
    return;
  }

  state.year = year;
  recomputeCredits();
  notify();
}

/**
 * -------------------------
 * Checked credit mutations
 * -------------------------
 */

export function toggleCredit(creditInstanceId, checked) {
  const previous = state.checkedCredits[creditInstanceId];

  // Optimistic update
  if (checked) {
    state.checkedCredits[creditInstanceId] = true;
  } else {
    delete state.checkedCredits[creditInstanceId];
  }

  notify();

  // Persist asynchronously
  updateCheckedState(state.userId, creditInstanceId, checked)
    .catch(() => {
      // Rollback on failure
      if (previous) {
        state.checkedCredits[creditInstanceId] = true;
      } else {
        delete state.checkedCredits[creditInstanceId];
      }
      notify();
    });
}

/**
 * -------------------------
 * Internal helpers
 * -------------------------
 */

async function loadUserState() {
  try {
    const response = await fetchUserState(state.userId);
    state.checkedCredits = response?.checkedCredits ?? {};
  } catch (err) {
    console.error("Failed to load user state", err);
    state.checkedCredits = {};
  }
}

function recomputeCredits() {
  const userConfig = USERS[state.userId];
  if (!userConfig) {
    throw new Error(`Missing user config for ${state.userId}`);
  }

  state.creditInstances = expandCreditsForUserAndYear(
    userConfig,
    state.year
  );
}
