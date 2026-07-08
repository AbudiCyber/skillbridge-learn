function findDuplicateIds(items) {
  const seen = new Set();
  const duplicates = new Set();

  items.forEach((item) => {
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  });

  return Array.from(duplicates);
}

function createCheck(id, title, passed, details) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

function lessonHasWords(lesson, words) {
  return words.some((word) => word.lessonId === lesson.id) || Boolean(lesson.words?.length);
}

function findMissingItems(requiredItems = [], availableItems = []) {
  const available = new Set(availableItems);
  return requiredItems.filter((item) => !available.has(item));
}

function findDuplicateValues(items = []) {
  const seen = new Set();
  const duplicates = new Set();

  items.forEach((item) => {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  });

  return Array.from(duplicates);
}

function findInactiveSectionWordLeaks(words, vocabularySections) {
  const sectionStatus = new Map(vocabularySections.map((section) => [section.id, section.status]));
  return words.filter((word) => sectionStatus.get(word.sectionId) === "inactive");
}

function findInvalidQuizQuestions(quizzes) {
  return quizzes.flatMap((quiz) => {
    const invalidQuestions = quiz.questions.filter((question) => {
      const hasPrompt = Boolean(question.prompt || question.question);
      const hasOptions = Array.isArray(question.options) && question.options.length >= 2;
      const hasCorrectAnswer = hasOptions && question.options.includes(question.correctAnswer);
      return !question.id || !hasPrompt || !hasOptions || !hasCorrectAnswer;
    });

    return invalidQuestions.map((question) => `${quiz.id}:${question.id || "missing-question-id"}`);
  });
}

export function runContentQA({
  lessons,
  units,
  words,
  quizzes,
  vocabularySections,
  routes = {},
  routePages = {},
  appShellAssets = [],
  requiredAssets = [],
  requiredEngines = [],
  appVersion,
  cacheVersion,
  cachePrefix
}) {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const unitIds = new Set(units.map((unit) => unit.id));
  const sectionIds = new Set(vocabularySections.map((section) => section.id));
  const routeValues = Object.values(routes);
  const routeKeys = Object.keys(routes);

  const duplicateIds = [
    ...findDuplicateIds(lessons),
    ...findDuplicateIds(units),
    ...findDuplicateIds(words),
    ...findDuplicateIds(quizzes),
    ...findDuplicateIds(vocabularySections)
  ];

  const lessonsWithoutWords = lessons.filter((lesson) => !lessonHasWords(lesson, words));
  const lessonsWithoutQuizzes = lessons.filter((lesson) => !quizzes.some((quiz) => quiz.lessonId === lesson.id));
  const quizzesWithoutLessons = quizzes.filter((quiz) => !lessonIds.has(quiz.lessonId));
  const wordsWithoutSections = words.filter((word) => !sectionIds.has(word.sectionId));
  const wordsWithBrokenLessons = words.filter((word) => word.lessonId && !lessonIds.has(word.lessonId));
  const unitsWithBrokenLessons = units.filter((unit) => unit.lessonIds.some((lessonId) => !lessonIds.has(lessonId)));
  const lessonsWithBrokenUnits = lessons.filter((lesson) => !unitIds.has(lesson.unitId));
  const invalidQuizzes = quizzes.filter((quiz) => !quiz.questions.length || quiz.questions.some((question) => !question.options.includes(question.correctAnswer)));
  const invalidQuizQuestions = findInvalidQuizQuestions(quizzes);
  const activeSectionsWithoutWords = vocabularySections.filter((section) => section.status === "active" && !words.some((word) => word.sectionId === section.id));
  const inactiveSectionWordLeaks = findInactiveSectionWordLeaks(words, vocabularySections);
  const routesWithoutPages = routeValues.filter((route) => !routePages[route]);
  const routePagesMissingFromCache = findMissingItems(Object.values(routePages), appShellAssets);
  const missingRequiredAssets = findMissingItems(requiredAssets, appShellAssets);
  const enginesMissingFromCache = findMissingItems(requiredEngines, appShellAssets);
  const duplicateAppShellAssets = findDuplicateValues(appShellAssets);
  const routeIdsWithoutValues = routeKeys.filter((key) => !routes[key]);
  const invalidCacheVersion = cacheVersion !== `v${appVersion}`;
  const invalidCachePrefix = cachePrefix !== "skillbridge-learn";

  const checks = [
    createCheck("duplicate-ids", "No duplicate IDs", duplicateIds.length === 0, duplicateIds),
    createCheck("lessons-have-words", "Every lesson has words", lessonsWithoutWords.length === 0, lessonsWithoutWords.map((lesson) => lesson.id)),
    createCheck("lessons-have-quizzes", "Every lesson has a quiz", lessonsWithoutQuizzes.length === 0, lessonsWithoutQuizzes.map((lesson) => lesson.id)),
    createCheck("quizzes-have-lessons", "Every quiz is linked to a lesson", quizzesWithoutLessons.length === 0, quizzesWithoutLessons.map((quiz) => quiz.id)),
    createCheck("words-have-sections", "Every word is linked to a section", wordsWithoutSections.length === 0, wordsWithoutSections.map((word) => word.id)),
    createCheck("words-have-valid-lessons", "Lesson words have valid lessons", wordsWithBrokenLessons.length === 0, wordsWithBrokenLessons.map((word) => word.id)),
    createCheck("units-have-valid-lessons", "Unit lesson lists are valid", unitsWithBrokenLessons.length === 0, unitsWithBrokenLessons.map((unit) => unit.id)),
    createCheck("lessons-have-valid-units", "Every lesson has a valid unit", lessonsWithBrokenUnits.length === 0, lessonsWithBrokenUnits.map((lesson) => lesson.id)),
    createCheck("valid-quiz-answers", "Quiz answers are valid options", invalidQuizzes.length === 0, invalidQuizzes.map((quiz) => quiz.id)),
    createCheck("valid-quiz-questions", "Quiz questions are complete", invalidQuizQuestions.length === 0, invalidQuizQuestions),
    createCheck("active-sections-have-words", "Active vocabulary sections have words", activeSectionsWithoutWords.length === 0, activeSectionsWithoutWords.map((section) => section.id)),
    createCheck("inactive-sections-empty", "Inactive vocabulary sections stay empty", inactiveSectionWordLeaks.length === 0, inactiveSectionWordLeaks.map((word) => word.id)),
    createCheck("routes-have-page-renderers", "Every route has a page renderer", routesWithoutPages.length === 0, routesWithoutPages),
    createCheck("route-values-exist", "Every route key has a value", routeIdsWithoutValues.length === 0, routeIdsWithoutValues),
    createCheck("route-pages-cached", "Route pages are cached offline", routePagesMissingFromCache.length === 0, routePagesMissingFromCache),
    createCheck("required-assets-cached", "Required app shell assets are cached", missingRequiredAssets.length === 0, missingRequiredAssets),
    createCheck("engines-cached", "Core engines are cached offline", enginesMissingFromCache.length === 0, enginesMissingFromCache),
    createCheck("app-shell-no-duplicates", "App shell assets are unique", duplicateAppShellAssets.length === 0, duplicateAppShellAssets),
    createCheck("cache-version-matches-app", "Cache version matches app version", !invalidCacheVersion, invalidCacheVersion ? [`${cacheVersion} != v${appVersion}`] : []),
    createCheck("cache-prefix-valid", "Cache prefix is valid", !invalidCachePrefix, invalidCachePrefix ? [cachePrefix] : [])
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");

  return {
    status: failedChecks.length === 0 ? "pass" : "fail",
    totals: {
      lessons: lessons.length,
      units: units.length,
      words: words.length,
      quizzes: quizzes.length,
      vocabularySections: vocabularySections.length,
      routes: routeValues.length,
      appShellAssets: appShellAssets.length,
      checks: checks.length,
      passed: checks.length - failedChecks.length,
      failed: failedChecks.length
    },
    checks
  };
}
