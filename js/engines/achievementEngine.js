function getMetricValue(state, type) {
  if (type === "lesson") return state.completedLessons?.length || 0;
  if (type === "quiz") return state.completedQuizzes?.length || 0;
  if (type === "saved-word") return state.savedWords?.length || 0;
  if (type === "streak") return state.bestStreak || state.streak || 0;
  if (type === "xp") return state.xp || 0;

  if (type === "review") {
    return Object.values(state.wordReviews || {}).filter((review) => review.reviewCount > 0).length;
  }

  return 0;
}

export function getAchievementProgress(state, achievement) {
  const value = getMetricValue(state, achievement.type);
  const percent = achievement.target <= 0 ? 0 : Math.min(100, Math.round((value / achievement.target) * 100));

  return {
    value,
    target: achievement.target,
    percent,
    unlocked: value >= achievement.target
  };
}

export function buildAchievementSummaries(achievements, state) {
  return achievements
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((achievement) => ({
      ...achievement,
      progress: getAchievementProgress(state, achievement)
    }));
}

export function getUnlockedAchievements(achievements, state) {
  return buildAchievementSummaries(achievements, state).filter((achievement) => achievement.progress.unlocked);
}

export function getLockedAchievements(achievements, state) {
  return buildAchievementSummaries(achievements, state).filter((achievement) => !achievement.progress.unlocked);
}
