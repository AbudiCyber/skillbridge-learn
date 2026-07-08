const CACHE_NAME = "skillbridge-learn-v0.1.0";
const CORE_ASSETS = [
  "./",
  "./index.html",
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
  "./js/i18n/i18n.js",
  "./js/i18n/translations.js",
  "./js/pages/homePage.js",
  "./js/pages/learnPage.js",
  "./js/pages/lessonPage.js",
  "./js/pages/quizPage.js",
  "./js/pages/libraryPage.js",
  "./js/pages/vocabularySectionPage.js",
  "./js/pages/progressPage.js",
  "./js/pages/savedPage.js",
  "./js/pages/aiGuidePage.js",
  "./js/pages/settingsPage.js",
  "./js/engines/lessonEngine.js",
  "./js/engines/quizEngine.js",
  "./js/engines/xpEngine.js",
  "./js/engines/vocabularyEngine.js",
  "./js/engines/reviewEngine.js",
  "./js/engines/aiGuideEngine.js",
  "./js/data/lessons.js",
  "./js/data/quizzes.js",
  "./js/data/units.js",
  "./js/data/words.js",
  "./js/data/vocabularySections.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
