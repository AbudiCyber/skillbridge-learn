import { APP_VERSION, ROUTES } from "./constants.js";
import { lessons } from "./data/lessons.js";
import { quizzes } from "./data/quizzes.js";
import { vocabularySections } from "./data/vocabularySections.js";
import { words } from "./data/words.js";
import { appendActivityEvent, createActivityEvent } from "./engines/analyticsEngine.js";
import { completeLesson, getLessonById } from "./engines/lessonEngine.js";
import { hasPassedQuiz } from "./engines/quizEngine.js";
import { markWordReviewed } from "./engines/reviewEngine.js";
import { ensureArray, getSafeLessonId, normalizeRoute, sanitizeRoutePayload, sanitizeStateForRoute } from "./engines/runtimeSafetyEngine.js";
import { applyDailyActivity } from "./engines/streakEngine.js";
import { addXP, createXPEvent, hasXPEvent } from "./engines/xpEngine.js";
import { applyDocumentLanguage, normalizeLanguage } from "./i18n/i18n.js";
import { loadUserState, saveUserState } from "./storage.js";
import { createResetState, getState, setState } from "./state.js";
import { renderRoute } from "./router.js";
import { mountPage, setActiveNav, updateNavigationLanguage } from "./ui.js";

const runtimeCollections = { routes: ROUTES, lessons, vocabularySections };

function getLanguage(state) {
  return normalizeLanguage(state.uiLanguage || "ar");
}

function renderVersionBadge() {
  const badge = document.querySelector("[data-app-version]");
  if (badge) badge.textContent = `v${APP_VERSION}`;
}

function renderApp(route, state) {
  const safeRoute = normalizeRoute(route, ROUTES);
  const safeState = sanitizeStateForRoute(safeRoute, state, runtimeCollections);
  const language = getLanguage(safeState);

  applyDocumentLanguage(language);
  updateNavigationLanguage(language);
  mountPage(renderRoute(safeRoute, safeState));
  setActiveNav(safeRoute);
  renderVersionBadge();
}

function navigate(route, payload = {}) {
  const nextRoute = normalizeRoute(route || ROUTES.HOME, ROUTES);
  const safePayload = sanitizeRoutePayload(nextRoute, payload, runtimeCollections);
  const state = setState({ route: nextRoute, resetConfirmArmed: false, ...safePayload });

  saveUserState(state);
  renderApp(nextRoute, state);
}

function handleCompleteLesson(lessonId) {
  const safeLessonId = getSafeLessonId(lessons, lessonId);
  if (!safeLessonId) return;

  const currentState = getState();
  const lesson = getLessonById(lessons, safeLessonId);
  const completedLessons = ensureArray(currentState.completedLessons);
  const alreadyCompleted = completedLessons.includes(safeLessonId);
  const alreadyRewarded = hasXPEvent(currentState, "lesson", safeLessonId);
  const nextState = applyDailyActivity(completeLesson(currentState, safeLessonId));
  const points = lesson?.xpReward || 20;
  const stateWithXP = alreadyRewarded
    ? nextState
    : {
        ...nextState,
        xp: addXP(nextState.xp, points),
        xpEvents: [...ensureArray(nextState.xpEvents), createXPEvent("lesson", safeLessonId, points, "complete_lesson")]
      };
  const stateWithActivity = alreadyCompleted
    ? stateWithXP
    : appendActivityEvent(stateWithXP, createActivityEvent("complete_lesson", safeLessonId, { points }));

  setState(stateWithActivity);
  saveUserState(stateWithActivity);
  renderApp(ROUTES.LESSON, stateWithActivity);
}

function handleSaveWord(wordId) {
  const currentState = getState();
  const word = words.find((item) => item.id === wordId);
  if (!word) return;

  const savedWords = ensureArray(currentState.savedWords);
  const alreadySaved = savedWords.some((item) => item.id === word.id);
  if (alreadySaved) return;

  const nextState = setState(appendActivityEvent(applyDailyActivity({
    ...currentState,
    savedWords: [...savedWords, word]
  }), createActivityEvent("save_word", wordId, { word: word.word })));

  saveUserState(nextState);
  renderApp(currentState.route, nextState);
}

function handleReviewWord(wordId) {
  const currentState = getState();
  const hasWord = ensureArray(currentState.savedWords).some((word) => word.id === wordId);
  if (!hasWord) return;

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
  const lessonId = getSafeLessonId(lessons, currentState.activeLessonId || "eng-001");
  const quiz = quizzes.find((item) => item.lessonId === lessonId);
  if (!quiz) return;

  const currentQuizAnswers = currentState.quizAnswers || {};
  const answersForQuiz = currentQuizAnswers[quiz.id] || {};
  const question = quiz.questions.find((item) => item.id === questionId);
  const alreadyAnswered = Boolean(answersForQuiz[questionId]);
  if (!question || !question.options.includes(answer)) return;

  const nextState = setState(appendActivityEvent(applyDailyActivity({
    ...currentState,
    activeLessonId: lessonId,
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

  const lesson = getLessonById(lessons, quiz.lessonId);
  const safeLessonId = getSafeLessonId(lessons, quiz.lessonId);
  const answers = currentState.quizAnswers?.[quizId] || {};
  const passed = hasPassedQuiz(quiz, answers);
  const completedQuizzes = ensureArray(currentState.completedQuizzes);
  const completedLessons = ensureArray(currentState.completedLessons);
  const alreadyCompletedQuiz = completedQuizzes.includes(quizId);
  const alreadyCompletedLesson = safeLessonId ? completedLessons.includes(safeLessonId) : true;
  const alreadyRewardedQuiz = hasXPEvent(currentState, "quiz", quizId);
  const alreadyRewardedLesson = safeLessonId ? hasXPEvent(currentState, "lesson", safeLessonId) : true;
  const quizPoints = 15;
  const lessonPoints = lesson?.xpReward || 20;
  const shouldCompleteLesson = passed && safeLessonId && !alreadyCompletedLesson;
  const shouldRewardQuiz = passed && !alreadyRewardedQuiz;
  const shouldRewardLesson = shouldCompleteLesson && !alreadyRewardedLesson;
  const totalPoints = (shouldRewardQuiz ? quizPoints : 0) + (shouldRewardLesson ? lessonPoints : 0);

  const stateWithProgress = applyDailyActivity({
    ...currentState,
    route: passed ? ROUTES.HOME : ROUTES.TEST,
    activeLessonId: safeLessonId || currentState.activeLessonId,
    completedQuizzes: passed && !alreadyCompletedQuiz ? [...completedQuizzes, quizId] : completedQuizzes,
    completedLessons: shouldCompleteLesson ? [...completedLessons, safeLessonId] : completedLessons,
    xp: totalPoints ? addXP(currentState.xp, totalPoints) : currentState.xp,
    xpEvents: [
      ...ensureArray(currentState.xpEvents),
      ...(shouldRewardQuiz ? [createXPEvent("quiz", quizId, quizPoints, "pass_quiz")] : []),
      ...(shouldRewardLesson ? [createXPEvent("lesson", safeLessonId, lessonPoints, "complete_lesson_from_quiz")] : [])
    ]
  });

  const stateWithQuizActivity = alreadyCompletedQuiz
    ? stateWithProgress
    : appendActivityEvent(stateWithProgress, createActivityEvent("finish_quiz", quizId, { passed, points: shouldRewardQuiz ? quizPoints : 0 }));
  const finalState = shouldCompleteLesson
    ? appendActivityEvent(stateWithQuizActivity, createActivityEvent("complete_lesson", safeLessonId, { points: shouldRewardLesson ? lessonPoints : 0, source: "quiz" }))
    : stateWithQuizActivity;

  setState(finalState);
  saveUserState(finalState);
  renderApp(finalState.route, finalState);
}

function handleResetQuiz(quizId) {
  const currentState = getState();
  const quiz = quizzes.find((item) => item.id === quizId);
  if (!quiz) return;

  const currentQuizAnswers = currentState.quizAnswers || {};
  const nextQuizAnswers = { ...currentQuizAnswers };
  delete nextQuizAnswers[quizId];

  const nextState = setState({ quizAnswers: nextQuizAnswers });
  saveUserState(nextState);
  renderApp(ROUTES.TEST, nextState);
}

function buildRoutePayload(routeTarget) {
  return sanitizeRoutePayload(routeTarget.dataset.route, {
    activeLessonId: routeTarget.dataset.lessonId,
    activeVocabularySectionId: routeTarget.dataset.sectionId
  }, runtimeCollections);
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
    navigator.serviceWorker.register("./service-worker.js", { type: "module" }).catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

function init() {
  setState(loadUserState());
  bindNavigation();
  renderVersionBadge();
  navigate(getState().route || ROUTES.HOME, getState());
  registerServiceWorker();
}

init();
