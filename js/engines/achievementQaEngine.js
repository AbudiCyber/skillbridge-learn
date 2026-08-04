import { achievements } from "../data/achievements.js";
import { buildAchievementSummaries, getAchievementProgress, getLockedAchievements, getUnlockedAchievements } from "./achievementEngine.js";

function createCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

function createFixtureState() {
  return {
    completedLessons: ["lesson-1", "lesson-2", "lesson-3"],
    completedQuizzes: ["quiz-1"],
    savedWords: Array.from({ length: 10 }, (_, index) => ({ id: `word-${index + 1}` })),
    wordReviews: {
      "word-1": { reviewCount: 2 },
      "word-2": { reviewCount: 0 },
      "word-3": { reviewCount: 1 }
    },
    streak: 2,
    bestStreak: 4,
    xp: 100
  };
}

export function runAchievementQA() {
  const fixture = createFixtureState();
  const summaries = buildAchievementSummaries(achievements, fixture);
  const unlocked = getUnlockedAchievements(achievements, fixture);
  const locked = getLockedAchievements(achievements, fixture);
  const firstLesson = achievements.find((achievement) => achievement.id === "first-lesson");
  const threeQuizzes = achievements.find((achievement) => achievement.id === "three-quizzes");
  const firstReview = achievements.find((achievement) => achievement.id === "first-review");
  const streakAchievement = achievements.find((achievement) => achievement.id === "three-day-streak");
  const beginnerThree = achievements.find((achievement) => achievement.id === "beginner-3");
  const zeroTargetProgress = getAchievementProgress(fixture, {
    id: "zero-target",
    type: "lesson",
    target: 0
  });

  const firstLessonProgress = getAchievementProgress(fixture, firstLesson);
  const threeQuizzesProgress = getAchievementProgress(fixture, threeQuizzes);
  const firstReviewProgress = getAchievementProgress(fixture, firstReview);
  const streakProgress = getAchievementProgress(fixture, streakAchievement);
  const beginnerThreeProgress = getAchievementProgress(fixture, beginnerThree);

  const checks = [
    createCheck(
      "achievement-order-stable",
      "Achievement summaries preserve configured order",
      summaries.every((achievement, index) => index === 0 || summaries[index - 1].order <= achievement.order),
      summaries.map((achievement) => `${achievement.id}:${achievement.order}`)
    ),
    createCheck(
      "lesson-achievement-unlocks",
      "Lesson achievement unlocks at its target",
      firstLessonProgress.unlocked && firstLessonProgress.value === 3 && firstLessonProgress.percent === 100,
      [`Value=${firstLessonProgress.value}`, `Progress=${firstLessonProgress.percent}%`]
    ),
    createCheck(
      "quiz-achievement-partial-progress",
      "Quiz achievement reports partial progress",
      !threeQuizzesProgress.unlocked && threeQuizzesProgress.value === 1 && threeQuizzesProgress.percent === 33,
      [`Value=${threeQuizzesProgress.value}`, `Progress=${threeQuizzesProgress.percent}%`]
    ),
    createCheck(
      "review-achievement-counts-reviewed-words",
      "Review achievement counts reviewed words only",
      firstReviewProgress.unlocked && firstReviewProgress.value === 2,
      [`Reviewed=${firstReviewProgress.value}`]
    ),
    createCheck(
      "streak-achievement-uses-best-streak",
      "Streak achievement uses the best recorded streak",
      streakProgress.unlocked && streakProgress.value === 4,
      [`Streak=${streakProgress.value}`]
    ),
    createCheck(
      "xp-achievement-progress",
      "XP achievement reports capped progress correctly",
      !beginnerThreeProgress.unlocked && beginnerThreeProgress.value === 100 && beginnerThreeProgress.percent === 56,
      [`XP=${beginnerThreeProgress.value}`, `Progress=${beginnerThreeProgress.percent}%`]
    ),
    createCheck(
      "achievement-groups-complete",
      "Unlocked and locked groups cover every achievement once",
      unlocked.length + locked.length === achievements.length
        && new Set([...unlocked, ...locked].map((achievement) => achievement.id)).size === achievements.length,
      [`Unlocked=${unlocked.length}`, `Locked=${locked.length}`, `Total=${achievements.length}`]
    ),
    createCheck(
      "achievement-zero-target-safe",
      "Achievement with zero target resolves safely",
      zeroTargetProgress.percent === 0 && zeroTargetProgress.unlocked,
      [`Progress=${zeroTargetProgress.percent}%`, `Unlocked=${zeroTargetProgress.unlocked}`]
    )
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");

  return {
    status: failedChecks.length ? "fail" : "pass",
    totals: {
      checks: checks.length,
      passed: checks.length - failedChecks.length,
      failed: failedChecks.length
    },
    checks
  };
}
