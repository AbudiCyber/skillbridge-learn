import { getSafeLessonId, getSafeVocabularySectionId, normalizeRoute, sanitizeRoutePayload, sanitizeStateForRoute } from "./runtimeSafetyEngine.js";

function createRuntimeCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

export function runRuntimeQA({ routes, lessons = [], vocabularySections = [] }) {
  const invalidRoute = "unknown-route";
  const firstLessonId = lessons[0]?.id || null;
  const firstSectionId = vocabularySections.find((section) => section.status === "active")?.id || vocabularySections[0]?.id || null;

  const normalizedRoute = normalizeRoute(invalidRoute, routes);
  const safeLessonId = getSafeLessonId(lessons, "missing-lesson-id");
  const safeSectionId = getSafeVocabularySectionId(vocabularySections, "missing-section-id");
  const unsafeLessonPayload = sanitizeRoutePayload(routes.LESSON, { activeLessonId: "bad-lesson" }, { routes, lessons, vocabularySections });
  const unsafeSectionPayload = sanitizeRoutePayload(routes.VOCABULARY_SECTION, { activeVocabularySectionId: "bad-section" }, { routes, lessons, vocabularySections });
  const ignoredPayload = sanitizeRoutePayload(routes.HOME, { activeLessonId: "bad-lesson", activeVocabularySectionId: "bad-section" }, { routes, lessons, vocabularySections });
  const sanitizedState = sanitizeStateForRoute(invalidRoute, {
    route: invalidRoute,
    activeLessonId: "bad-lesson",
    activeVocabularySectionId: "bad-section"
  }, { routes, lessons, vocabularySections });

  const checks = [
    createRuntimeCheck(
      "unknown-route-fallback",
      "Unknown route falls back to Home",
      normalizedRoute === routes.HOME,
      normalizedRoute === routes.HOME ? [] : [`Got ${normalizedRoute}`]
    ),
    createRuntimeCheck(
      "missing-lesson-fallback",
      "Missing lessonId falls back safely",
      safeLessonId === firstLessonId,
      safeLessonId === firstLessonId ? [] : [`Got ${safeLessonId || "null"}`]
    ),
    createRuntimeCheck(
      "missing-section-fallback",
      "Missing sectionId falls back safely",
      safeSectionId === firstSectionId,
      safeSectionId === firstSectionId ? [] : [`Got ${safeSectionId || "null"}`]
    ),
    createRuntimeCheck(
      "lesson-route-payload-sanitized",
      "Lesson route payload is sanitized",
      unsafeLessonPayload.activeLessonId === firstLessonId,
      unsafeLessonPayload.activeLessonId === firstLessonId ? [] : [`Got ${unsafeLessonPayload.activeLessonId || "null"}`]
    ),
    createRuntimeCheck(
      "section-route-payload-sanitized",
      "Vocabulary section payload is sanitized",
      unsafeSectionPayload.activeVocabularySectionId === firstSectionId,
      unsafeSectionPayload.activeVocabularySectionId === firstSectionId ? [] : [`Got ${unsafeSectionPayload.activeVocabularySectionId || "null"}`]
    ),
    createRuntimeCheck(
      "unrelated-route-ignores-foreign-payload",
      "Unrelated routes ignore foreign payload IDs",
      Object.keys(ignoredPayload).length === 0,
      Object.keys(ignoredPayload).length === 0 ? [] : Object.keys(ignoredPayload)
    ),
    createRuntimeCheck(
      "state-route-sanitized",
      "Unsafe state route is sanitized",
      sanitizedState.route === routes.HOME,
      sanitizedState.route === routes.HOME ? [] : [`Got ${sanitizedState.route}`]
    )
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");

  return {
    status: failedChecks.length === 0 ? "pass" : "fail",
    totals: {
      checks: checks.length,
      passed: checks.length - failedChecks.length,
      failed: failedChecks.length
    },
    checks
  };
}
