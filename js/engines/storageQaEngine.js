import { defaultState } from "../state.js";
import { loadAndRepairState, repairUserState } from "./storageIntegrityEngine.js";

function createStorageCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function runStorageQA({ routes, lessons = [], vocabularySections = [] }) {
  const context = { routes, lessons, vocabularySections };
  const firstLessonId = lessons[0]?.id || defaultState.activeLessonId;
  const firstSectionId = vocabularySections.find((section) => section.status === "active")?.id || vocabularySections[0]?.id || null;

  const invalidJsonResult = loadAndRepairState("not valid json", context);
  const missingState = repairUserState({}, context);
  const staleRouteState = repairUserState({ route: "old-route" }, context);
  const staleLessonState = repairUserState({ activeLessonId: "old-lesson" }, context);
  const staleSectionState = repairUserState({ activeVocabularySectionId: "old-section" }, context);
  const arrayRepairState = repairUserState({
    completedLessons: "text",
    completedQuizzes: null,
    xpEvents: {},
    activityEvents: "text",
    savedWords: 123
  }, context);
  const objectRepairState = repairUserState({
    quizAnswers: [],
    wordReviews: "text"
  }, context);
  const numberRepairState = repairUserState({
    xp: -50,
    streak: Number.NaN,
    bestStreak: "text"
  }, context);

  const checks = [
    createStorageCheck(
      "invalid-json-resets",
      "Invalid JSON resets safely",
      invalidJsonResult.hadError && invalidJsonResult.repaired && invalidJsonResult.state.route === routes.HOME,
      invalidJsonResult.hadError ? [] : ["Invalid JSON was not detected"]
    ),
    createStorageCheck(
      "missing-state-filled",
      "Missing state fields are filled",
      missingState.route === defaultState.route && Array.isArray(missingState.savedWords) && isPlainObject(missingState.quizAnswers),
      missingState.route === defaultState.route ? [] : [`Got ${missingState.route}`]
    ),
    createStorageCheck(
      "stale-route-repaired",
      "Stale route is repaired",
      staleRouteState.route === routes.HOME,
      staleRouteState.route === routes.HOME ? [] : [`Got ${staleRouteState.route}`]
    ),
    createStorageCheck(
      "stale-lesson-repaired",
      "Stale lessonId is repaired",
      staleLessonState.activeLessonId === firstLessonId,
      staleLessonState.activeLessonId === firstLessonId ? [] : [`Got ${staleLessonState.activeLessonId}`]
    ),
    createStorageCheck(
      "stale-section-repaired",
      "Stale sectionId is repaired",
      staleSectionState.activeVocabularySectionId === firstSectionId,
      staleSectionState.activeVocabularySectionId === firstSectionId ? [] : [`Got ${staleSectionState.activeVocabularySectionId || "none"}`]
    ),
    createStorageCheck(
      "arrays-repaired",
      "Array fields are repaired",
      Array.isArray(arrayRepairState.completedLessons)
        && Array.isArray(arrayRepairState.completedQuizzes)
        && Array.isArray(arrayRepairState.xpEvents)
        && Array.isArray(arrayRepairState.activityEvents)
        && Array.isArray(arrayRepairState.savedWords),
      []
    ),
    createStorageCheck(
      "objects-repaired",
      "Object fields are repaired",
      isPlainObject(objectRepairState.quizAnswers) && isPlainObject(objectRepairState.wordReviews),
      []
    ),
    createStorageCheck(
      "numbers-repaired",
      "Number fields are repaired",
      numberRepairState.xp === 0 && numberRepairState.streak === 0 && numberRepairState.bestStreak === 0,
      [`xp=${numberRepairState.xp}`, `streak=${numberRepairState.streak}`, `best=${numberRepairState.bestStreak}`]
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
