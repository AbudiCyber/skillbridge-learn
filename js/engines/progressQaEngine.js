import { buildDailyGoalSummary, buildProgressSummary, getLearningLevel, getPointsToNextLevel, getProgressPercent } from "./progressEngine.js";

function createCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

export function runProgressQA() {
  const fixture = {
    xp: 190,
    completedLessons: ["lesson-1", "lesson-2"],
    completedQuizzes: ["quiz-1"],
    savedWords: [{ id: "word-1" }, { id: "word-2" }, { id: "word-3" }],
    selectedGoal: "daily-review",
    activityEvents: []
  };
  const summary = buildProgressSummary(fixture, { lessons: 4, quizzes: 2 });
  const zeroTotals = buildProgressSummary({}, { lessons: 0, quizzes: 0 });
  const beginnerOne = getLearningLevel(0);
  const beginnerTwo = getLearningLevel(80);
  const beginnerThree = getLearningLevel(180);
  const beginnerFour = getLearningLevel(300);
  const safePercent = getProgressPercent(10, 3);
  const zeroPercent = getProgressPercent(2, 0);
  const dailyGoal = buildDailyGoalSummary(fixture);

  const checks = [
    createCheck(
      "progress-percent-calculates",
      "Progress percentage is calculated correctly",
      getProgressPercent(2, 4) === 50,
      [`Progress=${getProgressPercent(2, 4)}%`]
    ),
    createCheck(
      "progress-percent-capped",
      "Progress percentage is capped at 100 percent",
      safePercent === 100,
      [`Progress=${safePercent}%`]
    ),
    createCheck(
      "progress-zero-total-safe",
      "Progress with a zero total resolves safely",
      zeroPercent === 0 && zeroTotals.lessonProgressPercent === 0 && zeroTotals.quizProgressPercent === 0,
      [`Direct=${zeroPercent}%`, `Lessons=${zeroTotals.lessonProgressPercent}%`, `Quizzes=${zeroTotals.quizProgressPercent}%`]
    ),
    createCheck(
      "progress-level-boundaries",
      "Learning levels switch at configured XP boundaries",
      beginnerOne.title === "Beginner 1"
        && beginnerTwo.title === "Beginner 2"
        && beginnerThree.title === "Beginner 3"
        && beginnerFour.title === "Beginner 4",
      [beginnerOne.title, beginnerTwo.title, beginnerThree.title, beginnerFour.title]
    ),
    createCheck(
      "progress-next-level-xp",
      "Points to next level are calculated correctly",
      getPointsToNextLevel(190) === 110 && summary.pointsToNextLevel === 110,
      [`Direct=${getPointsToNextLevel(190)}`, `Summary=${summary.pointsToNextLevel}`]
    ),
    createCheck(
      "progress-summary-counts",
      "Progress summary counts lessons, quizzes, saved words, and XP",
      summary.points === 190
        && summary.completedLessons === 2
        && summary.completedQuizzes === 1
        && summary.savedWords === 3,
      [
        `XP=${summary.points}`,
        `Lessons=${summary.completedLessons}`,
        `Quizzes=${summary.completedQuizzes}`,
        `Saved=${summary.savedWords}`
      ]
    ),
    createCheck(
      "progress-summary-percentages",
      "Progress summary derives lesson and quiz percentages",
      summary.lessonProgressPercent === 50 && summary.quizProgressPercent === 50,
      [`Lessons=${summary.lessonProgressPercent}%`, `Quizzes=${summary.quizProgressPercent}%`]
    ),
    createCheck(
      "progress-summary-daily-goal",
      "Progress summary includes the selected daily goal",
      dailyGoal.id === "daily-review"
        && summary.dailyGoal.id === "daily-review"
        && summary.dailyGoal.target === 5,
      [`Goal=${summary.dailyGoal.id}`, `Target=${summary.dailyGoal.target}`]
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
