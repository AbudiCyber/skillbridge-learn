import { APP_SHELL, CORE_ASSETS } from "./js/config/appShellAssets.js";

const CACHE_VERSION = "v0.2.1";
const CACHE_NAME = `skillbridge-learn-${CACHE_VERSION}`;

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
