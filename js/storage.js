import { ROUTES, STORAGE_KEYS } from "./constants.js";
import { lessons } from "./data/lessons.js";
import { vocabularySections } from "./data/vocabularySections.js";
import { loadAndRepairState } from "./engines/storageIntegrityEngine.js";
import { defaultState } from "./state.js";

const storageContext = {
  routes: ROUTES,
  lessons,
  vocabularySections
};

export function loadUserState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATE);
    const result = loadAndRepairState(stored, storageContext);

    if (result.repaired) {
      saveUserState(result.state);
    }

    return result.state;
  } catch (error) {
    console.warn("Could not load user state:", error);
    return { ...defaultState };
  }
}

export function saveUserState(state) {
  try {
    const repaired = loadAndRepairState(JSON.stringify(state), storageContext).state;
    localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(repaired));
  } catch (error) {
    console.warn("Could not save user state:", error);
  }
}

export function resetUserState() {
  localStorage.removeItem(STORAGE_KEYS.USER_STATE);
  return { ...defaultState };
}
