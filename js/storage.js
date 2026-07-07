import { STORAGE_KEYS } from "./constants.js";
import { defaultState } from "./state.js";

export function loadUserState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATE);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : { ...defaultState };
  } catch (error) {
    console.warn("Could not load user state:", error);
    return { ...defaultState };
  }
}

export function saveUserState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save user state:", error);
  }
}

export function resetUserState() {
  localStorage.removeItem(STORAGE_KEYS.USER_STATE);
  return { ...defaultState };
}
