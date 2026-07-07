export const defaultState = {
  route: "home",
  activeLessonId: "eng-001",
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
