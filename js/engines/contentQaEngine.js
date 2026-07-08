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

export function runContentQA({ lessons, units, words, quizzes, vocabularySections }) {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const unitIds = new Set(units.map((unit) => unit.id));
  const sectionIds = new Set(vocabularySections.map((section) => section.id));

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

  const checks = [
    createCheck("duplicate-ids", "No duplicate IDs", duplicateIds.length === 0, duplicateIds),
    createCheck("lessons-have-words", "Every lesson has words", lessonsWithoutWords.length === 0, lessonsWithoutWords.map((lesson) => lesson.id)),
    createCheck("lessons-have-quizzes", "Every lesson has a quiz", lessonsWithoutQuizzes.length === 0, lessonsWithoutQuizzes.map((lesson) => lesson.id)),
    createCheck("quizzes-have-lessons", "Every quiz is linked to a lesson", quizzesWithoutLessons.length === 0, quizzesWithoutLessons.map((quiz) => quiz.id)),
    createCheck("words-have-sections", "Every word is linked to a section", wordsWithoutSections.length === 0, wordsWithoutSections.map((word) => word.id)),
    createCheck("words-have-valid-lessons", "Lesson words have valid lessons", wordsWithBrokenLessons.length === 0, wordsWithBrokenLessons.map((word) => word.id)),
    createCheck("units-have-valid-lessons", "Unit lesson lists are valid", unitsWithBrokenLessons.length === 0, unitsWithBrokenLessons.map((unit) => unit.id)),
    createCheck("lessons-have-valid-units", "Every lesson has a valid unit", lessonsWithBrokenUnits.length === 0, lessonsWithBrokenUnits.map((lesson) => lesson.id)),
    createCheck("valid-quiz-answers", "Quiz answers are valid options", invalidQuizzes.length === 0, invalidQuizzes.map((quiz) => quiz.id))
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
      checks: checks.length,
      passed: checks.length - failedChecks.length,
      failed: failedChecks.length
    },
    checks
  };
}
