export const defaultState = {
  route: "home",
  xp: 0,
  streak: 0,
  completedLessons: [],
  savedWords: [],
  selectedGoal: null
};

let appState = { ...defaultState };

export function getState() {
  return appState;
}

export function setState(nextState) {
  appState = {
    ...appState,
    ...nextState
  };

  return appState;
}
