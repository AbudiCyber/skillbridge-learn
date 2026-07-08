const CACHE_VERSION = "v0.2.0";
const CACHE_NAME = `skillbridge-learn-${CACHE_VERSION}`;
const APP_SHELL = "./index.html";
const CORE_ASSETS = [
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
  "./js/pages/contentQaPage.js",
  "./js/engines/lessonEngine.js",
  "./js/engines/quizEngine.js",
  "./js/engines/xpEngine.js",
  "./js/engines/vocabularyEngine.js",
  "./js/engines/reviewEngine.js",
  "./js/engines/streakEngine.js",
  "./js/engines/achievementEngine.js",
  "./js/engines/aiGuideEngine.js",
  "./js/engines/contentQaEngine.js",
  "./js/data/achievements.js",
  "./js/data/learningGoals.js",
  "./js/data/lessons.js",
  "./js/data/quizzes.js",
  "./js/data/tracks.js",
  "./js/data/units.js",
  "./js/data/words.js",
  "./js/data/vocabularySections.js"
];

async function precacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.allSettled(
    CORE_ASSETS.map((asset) => cache.add(asset))
  );

  const failedAssets = results
    .map((result, index) => ({ result, asset: CORE_ASSETS[index] }))
    .filter((entry) => entry.result.status === "rejected")
    .map((entry) => entry.asset);

  if (failedAssets.length) {
    console.warn("Some assets failed to cache:", failedAssets);
  }
}

async function clearOldCaches() {
  const keys = await caches.keys();
  return Promise.all(
    keys
      .filter((key) => key.startsWith("skillbridge-learn-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key))
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (request.method === "GET" && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }

  return response;
}

async function appShellFallback(request) {
  try {
    return await cacheFirst(request);
  } catch (error) {
    const cachedShell = await caches.match(APP_SHELL);
    if (cachedShell) return cachedShell;
    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheCoreAssets());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(appShellFallback(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
