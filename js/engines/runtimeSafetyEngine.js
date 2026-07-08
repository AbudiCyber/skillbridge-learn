export function normalizeRoute(route, routes) {
  const validRoutes = new Set(Object.values(routes));
  return validRoutes.has(route) ? route : routes.HOME;
}

export function getSafeLessonId(lessons = [], lessonId) {
  const fallbackLesson = lessons[0] || null;
  const match = lessons.find((lesson) => lesson.id === lessonId);
  return match?.id || fallbackLesson?.id || null;
}

export function getSafeVocabularySectionId(vocabularySections = [], sectionId) {
  const activeSections = vocabularySections.filter((section) => section.status === "active");
  const fallbackSection = activeSections[0] || vocabularySections[0] || null;
  const match = vocabularySections.find((section) => section.id === sectionId);
  return match?.id || fallbackSection?.id || null;
}

export function sanitizeRoutePayload(route, payload = {}, { routes, lessons = [], vocabularySections = [] }) {
  const safePayload = {};

  if (route === routes.LESSON || route === routes.TEST) {
    const safeLessonId = getSafeLessonId(lessons, payload.activeLessonId);
    if (safeLessonId) safePayload.activeLessonId = safeLessonId;
  }

  if (route === routes.VOCABULARY_SECTION) {
    const safeSectionId = getSafeVocabularySectionId(vocabularySections, payload.activeVocabularySectionId);
    if (safeSectionId) safePayload.activeVocabularySectionId = safeSectionId;
  }

  return safePayload;
}

export function sanitizeStateForRoute(route, state, { routes, lessons = [], vocabularySections = [] }) {
  return {
    ...state,
    route: normalizeRoute(route, routes),
    ...sanitizeRoutePayload(route, state, { routes, lessons, vocabularySections })
  };
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}
