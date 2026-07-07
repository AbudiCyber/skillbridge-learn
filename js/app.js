import { ROUTES } from "./constants.js";
import { words } from "./data/words.js";
import { completeLesson } from "./engines/lessonEngine.js";
import { addXP } from "./engines/xpEngine.js";
import { applyDocumentLanguage, normalizeLanguage } from "./i18n/i18n.js";
import { loadUserState, saveUserState } from "./storage.js";
import { getState, setState } from "./state.js";
import { renderRoute } from "./router.js";
import { mountPage, setActiveNav } from "./ui.js";

function getLanguage(state) {
  return normalizeLanguage(state.uiLanguage || "ar");
}

function renderApp(route, state) {
  applyDocumentLanguage(getLanguage(state));
  mountPage(renderRoute(route, state));
  setActiveNav(route);
}

function navigate(route, payload = {}) {
  const nextRoute = route || ROUTES.HOME;
  const state = setState({ route: nextRoute, ...payload });
  saveUserState(state);
  renderApp(nextRoute, state);
}

function handleCompleteLesson(lessonId) {
  const currentState = getState();
  const alreadyCompleted = currentState.completedLessons.includes(lessonId);
  const nextState = completeLesson(currentState, lessonId);
  const stateWithXP = alreadyCompleted
    ? nextState
    : { ...nextState, xp: addXP(nextState.xp, 20) };

  setState(stateWithXP);
  saveUserState(stateWithXP);
  renderApp(ROUTES.LESSON, stateWithXP);
}

function handleSaveWord(wordId) {
  const currentState = getState();
  const word = words.find((item) => item.id === wordId);
  if (!word) return;

  const alreadySaved = currentState.savedWords.some((item) => item.id === word.id);
  if (alreadySaved) return;

  const nextState = setState({
    savedWords: [...currentState.savedWords, word]
  });

  saveUserState(nextState);
  renderApp(currentState.route, nextState);
}

function handleSetLanguage(language) {
  const currentState = getState();
  const nextState = setState({ uiLanguage: normalizeLanguage(language) });
  saveUserState(nextState);
  renderApp(currentState.route, nextState);
}

function bindNavigation() {
  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const { action, lessonId, wordId, language } = actionTarget.dataset;

      if (action === "complete-lesson" && lessonId) {
        handleCompleteLesson(lessonId);
        return;
      }

      if (action === "save-word" && wordId) {
        handleSaveWord(wordId);
        return;
      }

      if (action === "set-language" && language) {
        handleSetLanguage(language);
        return;
      }
    }

    const routeTarget = event.target.closest("[data-route]");
    if (!routeTarget) return;

    const payload = routeTarget.dataset.lessonId
      ? { activeLessonId: routeTarget.dataset.lessonId }
      : {};

    navigate(routeTarget.dataset.route, payload);
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
