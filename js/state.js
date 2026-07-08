export const defaultState = {
  route: "home",
  activeLessonId: "eng-001",
  uiLanguage: "ar",
  themeMode: "dark",
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActivityDate: null,
  completedLessons: [],
  completedQuizzes: [],
  quizAnswers: {},
  xpEvents: [],
  activityEvents: [],
  savedWords: [],
  wordReviews: {},
  selectedGoal: "daily-lesson",
  resetConfirmArmed: false
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

export function createResetState(currentState) {
  return {
    ...defaultState,
    uiLanguage: currentState.uiLanguage || defaultState.uiLanguage,
    themeMode: currentState.themeMode || defaultState.themeMode,
    selectedGoal: currentState.selectedGoal || defaultState.selectedGoal,
    route: "settings"
  };
}
