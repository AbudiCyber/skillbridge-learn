export const defaultState = {
  route: "home",
  activeLessonId: "eng-001",
  uiLanguage: "ar",
  xp: 0,
  streak: 0,
  completedLessons: [],
  completedQuizzes: [],
  quizAnswers: {},
  xpEvents: [],
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
