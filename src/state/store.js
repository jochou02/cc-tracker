// src/state/store.js

import { expandCreditsForUserAndYear } from "../utils/creditExpansion.js";
import { USERS } from "../data/userCards.js";
import {
  fetchUserState,
  updateCreditState
} from "../utils/api.js";

/**
 * -------------------------
 * Internal mutable state
 * -------------------------
 */

const state = {
  userId: null,
  year: null,

  // persisted: map of creditInstanceId → { checked: bool, note: string }
  creditState: {},

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
    creditState: { ...state.creditState },
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
  state.creditState = {};

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
 * Credit state mutations
 * -------------------------
 */

/**
 * Save the checked state, note, and optional dateUsed for a credit instance.
 * This is the single write path — one optimistic update, one API call.
 *
 * @param {string} creditInstanceId
 * @param {{ checked: boolean, note: string, dateUsed?: string }} fields
 */
export function saveCreditEntry(creditInstanceId, { checked, note, dateUsed }) {
  const previous = { ...(state.creditState[creditInstanceId] ?? {}) };
  const trimmedNote = note.trim();
  const trimmedDate = (dateUsed ?? "").trim();

  // Build the new entry: always store checked; only store optional fields if non-empty
  const next = { checked };
  if (trimmedNote !== "") {
    next.note = trimmedNote;
  }
  if (trimmedDate !== "") {
    next.dateUsed = trimmedDate;
  }

  // Optimistic update
  state.creditState[creditInstanceId] = next;
  notify();

  // Single API call — this is the one that will hit DynamoDB
  updateCreditState(state.userId, creditInstanceId, next)
    .catch(() => {
      // Rollback on failure
      if (Object.keys(previous).length > 0) {
        state.creditState[creditInstanceId] = previous;
      } else {
        delete state.creditState[creditInstanceId];
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
    state.creditState = response?.creditState ?? {};
  } catch (err) {
    console.error("Failed to load user state", err);
    state.creditState = {};
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