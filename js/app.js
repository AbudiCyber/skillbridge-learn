import { ROUTES } from "./constants.js";
import { lessons } from "./data/lessons.js";
import { quizzes } from "./data/quizzes.js";
import { words } from "./data/words.js";
import { appendActivityEvent, createActivityEvent } from "./engines/analyticsEngine.js";
import { completeLesson, getLessonById } from "./engines/lessonEngine.js";
import { hasPassedQuiz } from "./engines/quizEngine.js";
import { markWordReviewed } from "./engines/reviewEngine.js";
import { applyDailyActivity } from "./engines/streakEngine.js";
import { addXP, createXPEvent, hasXPEvent } from "./engines/xpEngine.js";
import { applyDocumentLanguage, normalizeLanguage } from "./i18n/i18n.js";
import { loadUserState, saveUserState } from "./storage.js";
import { createResetState, getState, setState } from "./state.js";
import { renderRoute } from "./router.js";
import { mountPage, setActiveNav, updateNavigationLanguage } from "./ui.js";

function getLanguage(state) {
  return normalizeLanguage(state.uiLanguage || "ar");
}

function renderApp(route, state) {
  const language = getLanguage(state);
  applyDocumentLanguage(language);
  updateNavigationLanguage(language);
  mountPage(renderRoute(route, state));
  setActiveNav(route);
}

function navigate(route, payload = {}) {
  const nextRoute = route || ROUTES.HOME;
  const state = setState({ route: nextRoute, resetConfirmArmed: false, ...payload });
  saveUserState(state);
  renderApp(nextRoute, state);
}

function handleCompleteLesson(lessonId) {
  const currentState = getState();
  const lesson = getLessonById(lessons, lessonId);
  const alreadyCompleted = currentState.completedLessons?.includes(lessonId);
  const alreadyRewarded = hasXPEvent(currentState, "lesson", lessonId);
  const nextState = applyDailyActivity(completeLesson(currentState, lessonId));
  const points = lesson?.xpReward || 20;
  const stateWithXP = alreadyRewarded
    ? nextState
    : {
        ...nextState,
        xp: addXP(nextState.xp, points),
        xpEvents: [...(nextState.xpEvents || []), createXPEvent("lesson", lessonId, points, "complete_lesson")]
      };
  const stateWithActivity = alreadyCompleted
    ? stateWithXP
    : appendActivityEvent(stateWithXP, createActivityEvent("complete_lesson", lessonId, { points }));

  setState(stateWithActivity);
  saveUserState(stateWithActivity);
  renderApp(ROUTES.LESSON, stateWithActivity);
}

function handleSaveWord(wordId) {
  const currentState = getState();
  const word = words.find((item) => item.id === wordId);
  if (!word) return;

  const alreadySaved = currentState.savedWords.some((item) => item.id === word.id);
  if (alreadySaved) return;

  const nextState = setState(appendActivityEvent(applyDailyActivity({
    ...currentState,
    savedWords: [...currentState.savedWords, word]
  }), createActivityEvent("save_word", wordId, { word: word.word })));

  saveUserState(nextState);
  renderApp(currentState.route, nextState);
}

function handleReviewWord(wordId) {
  const currentState = getState();
  const nextState = appendActivityEvent(
    applyDailyActivity(markWordReviewed(currentState, wordId)),
    createActivityEvent("review_word", wordId)
  );
  setState(nextState);
  saveUserState(nextState);
  renderApp(ROUTES.SAVED, nextState);
}

function handleSetLanguage(language) {
  const currentState = getState();
  const nextState = setState({ uiLanguage: normalizeLanguage(language), resetConfirmArmed: false });
  saveUserState(nextState);
  renderApp(currentState.route, nextState);
}

function handleSetGoal(goalId) {
  const currentState = getState();
  const nextState = setState({ selectedGoal: goalId, resetConfirmArmed: false });
  saveUserState(nextState);
  renderApp(ROUTES.SETTINGS, nextState);
}

function handleResetProgress() {
  const currentState = getState();

  if (!currentState.resetConfirmArmed) {
    const armedState = setState({ resetConfirmArmed: true });
    saveUserState(armedState);
    renderApp(ROUTES.SETTINGS, armedState);
    return;
  }

  const resetState = setState(createResetState(currentState));
  saveUserState(resetState);
  renderApp(ROUTES.SETTINGS, resetState);
}

function handleQuizAnswer(questionId, answer) {
  const currentState = getState();
  const lessonId = currentState.activeLessonId || "eng-001";
  const quiz = quizzes.find((item) => item.lessonId === lessonId);
  if (!quiz) return;

  const currentQuizAnswers = currentState.quizAnswers || {};
  const answersForQuiz = currentQuizAnswers[quiz.id] || {};
  const alreadyAnswered = Boolean(answersForQuiz[questionId]);

  const nextState = setState(appendActivityEvent(applyDailyActivity({
    ...currentState,
    quizAnswers: {
      ...currentQuizAnswers,
      [quiz.id]: {
        ...answersForQuiz,
        [questionId]: answer
      }
    }
  }), alreadyAnswered
    ? null
    : createActivityEvent("answer_quiz", quiz.id, { questionId })));

  saveUserState(nextState);
  renderApp(ROUTES.TEST, nextState);
}

function handleFinishQuiz(quizId) {
  const currentState = getState();
  const quiz = quizzes.find((item) => item.id === quizId);
  if (!quiz) return;

  const answers = currentState.quizAnswers?.[quizId] || {};
  const passed = hasPassedQuiz(quiz, answers);
  const completedQuizzes = currentState.completedQuizzes || [];
  const alreadyCompleted = completedQuizzes.includes(quizId);
  const alreadyRewarded = hasXPEvent(currentState, "quiz", quizId);
  const points = 15;

  const nextState = setState(appendActivityEvent(applyDailyActivity({
    ...currentState,
    completedQuizzes: passed && !alreadyCompleted ? [...completedQuizzes, quizId] : completedQuizzes,
    xp: passed && !alreadyRewarded ? addXP(currentState.xp, points) : currentState.xp,
    xpEvents: passed && !alreadyRewarded
      ? [...(currentState.xpEvents || []), createXPEvent("quiz", quizId, points, "pass_quiz")]
      : currentState.xpEvents || []
  }), alreadyCompleted
    ? null
    : createActivityEvent("finish_quiz", quizId, { passed, points: passed ? points : 0 })));

  saveUserState(nextState);
  renderApp(ROUTES.TEST, nextState);
}

function handleResetQuiz(quizId) {
  const currentState = getState();
  const currentQuizAnswers = currentState.quizAnswers || {};
  const nextQuizAnswers = { ...currentQuizAnswers };
  delete nextQuizAnswers[quizId];

  const nextState = setState({ quizAnswers: nextQuizAnswers });
  saveUserState(nextState);
  renderApp(ROUTES.TEST, nextState);
}

function buildRoutePayload(routeTarget) {
  const payload = {};

  if (routeTarget.dataset.lessonId) {
    payload.activeLessonId = routeTarget.dataset.lessonId;
  }

  if (routeTarget.dataset.sectionId) {
    payload.activeVocabularySectionId = routeTarget.dataset.sectionId;
  }

  return payload;
}

function bindNavigation() {
  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const { action, lessonId, wordId, language, questionId, answer, quizId, goalId } = actionTarget.dataset;

      if (action === "complete-lesson" && lessonId) {
        handleCompleteLesson(lessonId);
        return;
      }

      if (action === "save-word" && wordId) {
        handleSaveWord(wordId);
        return;
      }

      if (action === "review-word" && wordId) {
        handleReviewWord(wordId);
        return;
      }

      if (action === "set-language" && language) {
        handleSetLanguage(language);
        return;
      }

      if (action === "set-goal" && goalId) {
        handleSetGoal(goalId);
        return;
      }

      if (action === "reset-progress") {
        handleResetProgress();
        return;
      }

      if (action === "answer-quiz" && questionId && answer) {
        handleQuizAnswer(questionId, answer);
        return;
      }

      if (action === "finish-quiz" && quizId) {
        handleFinishQuiz(quizId);
        return;
      }

      if (action === "reset-quiz" && quizId) {
        handleResetQuiz(quizId);
        return;
      }
    }

    const routeTarget = event.target.closest("[data-route]");
    if (!routeTarget) return;

    navigate(routeTarget.dataset.route, buildRoutePayload(routeTarget));
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

function init() {
  setState(loadUserState());
  bindNavigation();
  navigate(getState().route || ROUTES.HOME);
  registerServiceWorker();
}

init();
