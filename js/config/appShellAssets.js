import { ROUTES } from "../constants.js";

export const APP_SHELL = "./index.html";

export const ROUTE_PAGES = {
  [ROUTES.HOME]: "./js/pages/homePage.js",
  [ROUTES.LEARN]: "./js/pages/learnPage.js",
  [ROUTES.LESSON]: "./js/pages/lessonPage.js",
  [ROUTES.TEST]: "./js/pages/quizPage.js",
  [ROUTES.LIBRARY]: "./js/pages/libraryPage.js",
  [ROUTES.VOCABULARY_SECTION]: "./js/pages/vocabularySectionPage.js",
  [ROUTES.PROGRESS]: "./js/pages/progressPage.js",
  [ROUTES.SAVED]: "./js/pages/savedPage.js",
  [ROUTES.REVIEW_SESSION]: "./js/pages/reviewSessionPage.js",
  [ROUTES.GUIDE]: "./js/pages/aiGuidePage.js",
  [ROUTES.SETTINGS]: "./js/pages/settingsPage.js",
  [ROUTES.CONTENT_QA]: "./js/pages/contentQaPage.js"
};

export const REQUIRED_ENGINES = [
  "./js/engines/analyticsEngine.js",
  "./js/engines/lessonEngine.js",
  "./js/engines/quizEngine.js",
  "./js/engines/xpEngine.js",
  "./js/engines/vocabularyEngine.js",
  "./js/engines/reviewEngine.js",
  "./js/engines/reviewSessionEngine.js",
  "./js/engines/streakEngine.js",
  "./js/engines/achievementEngine.js",
  "./js/engines/aiGuideEngine.js",
  "./js/engines/contentQaEngine.js",
  "./js/engines/runtimeSafetyEngine.js",
  "./js/engines/runtimeQaEngine.js",
  "./js/engines/errorBoundaryEngine.js",
  "./js/engines/storageIntegrityEngine.js",
  "./js/engines/storageQaEngine.js"
];

export const REQUIRED_ASSETS = [
  APP_SHELL,
  "./manifest.json",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./js/app.js",
  "./js/constants.js",
  "./js/router.js",
  "./js/state.js"
];

export const CORE_ASSETS = [
  "./",
  APP_SHELL,
  "./manifest.json",
  "./assets/icons/icon.svg",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/pages.css",
  "./css/themes.css",
  "./js/app.js",
  "./js/constants.js",
  "./js/router.js",
  "./js/state.js",
  "./js/storage.js",
  "./js/ui.js",
  "./js/config/appMeta.js",
  "./js/config/appShellAssets.js",
  "./js/i18n/i18n.js",
  "./js/i18n/translations.js",
  ...Object.values(ROUTE_PAGES),
  ...REQUIRED_ENGINES,
  "./js/data/achievements.js",
  "./js/data/learningGoals.js",
  "./js/data/lessons.js",
  "./js/data/quizzes.js",
  "./js/data/tracks.js",
  "./js/data/units.js",
  "./js/data/words.js",
  "./js/data/vocabularySections.js"
];
