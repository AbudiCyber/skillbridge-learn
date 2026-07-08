export const defaultState = {
  route: "home",
  activeLessonId: "eng-001",
  uiLanguage: "ar",
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActivityDate: null,
  completedLessons: [],
  completedQuizzes: [],
  quizAnswers: {},
  xpEvents: [],
  savedWords: [],
  wordReviews: {},
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
