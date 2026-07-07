export function getProgressPercent(completedCount, totalCount) {
  if (totalCount <= 0) return 0;
  return Math.min(100, Math.round((completedCount / totalCount) * 100));
}

export function getLearningLevel(points) {
  if (points >= 300) return { title: "Beginner 4", nextTarget: 450 };
  if (points >= 180) return { title: "Beginner 3", nextTarget: 300 };
  if (points >= 80) return { title: "Beginner 2", nextTarget: 180 };
  return { title: "Beginner 1", nextTarget: 80 };
}

export function getPointsToNextLevel(points) {
  const level = getLearningLevel(points);
  return Math.max(0, level.nextTarget - points);
}

export function buildProgressSummary(state, totals) {
  const completedLessons = state.completedLessons?.length || 0;
  const completedQuizzes = state.completedQuizzes?.length || 0;
  const savedWords = state.savedWords?.length || 0;
  const points = state.xp || 0;

  return {
    points,
    level: getLearningLevel(points),
    pointsToNextLevel: getPointsToNextLevel(points),
    completedLessons,
    completedQuizzes,
    savedWords,
    lessonProgressPercent: getProgressPercent(completedLessons, totals.lessons),
    quizProgressPercent: getProgressPercent(completedQuizzes, totals.quizzes)
  };
}
