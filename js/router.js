import { ROUTES } from "./constants.js";
import { renderHomePage } from "./pages/homePage.js";
import { renderLearnPage } from "./pages/learnPage.js";
import { renderLessonPage } from "./pages/lessonPage.js";
import { renderQuizPage } from "./pages/quizPage.js";
import { renderLibraryPage } from "./pages/libraryPage.js";
import { renderVocabularySectionPage } from "./pages/vocabularySectionPage.js";
import { renderProgressPage } from "./pages/progressPage.js";
import { renderSavedPage } from "./pages/savedPage.js";
import { renderAiGuidePage } from "./pages/aiGuidePage.js";
import { renderSettingsPage } from "./pages/settingsPage.js";
import { renderContentQaPage } from "./pages/contentQaPage.js";

const routeRenderers = {
  [ROUTES.HOME]: renderHomePage,
  [ROUTES.LEARN]: renderLearnPage,
  [ROUTES.LESSON]: renderLessonPage,
  [ROUTES.TEST]: renderQuizPage,
  [ROUTES.LIBRARY]: renderLibraryPage,
  [ROUTES.VOCABULARY_SECTION]: renderVocabularySectionPage,
  [ROUTES.PROGRESS]: renderProgressPage,
  [ROUTES.SAVED]: renderSavedPage,
  [ROUTES.GUIDE]: renderAiGuidePage,
  [ROUTES.SETTINGS]: renderSettingsPage,
  [ROUTES.CONTENT_QA]: renderContentQaPage
};

export function renderRoute(route, state) {
  const render = routeRenderers[route] || routeRenderers[ROUTES.HOME];
  return render(state);
}
