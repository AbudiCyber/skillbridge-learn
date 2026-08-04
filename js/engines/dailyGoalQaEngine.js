import { buildDailyGoalSummary } from "./progressEngine.js";

function createCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

function createEvent(type, dateKey, createdAt = `${dateKey}T10:00:00.000Z`) {
  return {
    id: `${type}-${dateKey}`,
    type,
    dateKey,
    createdAt
  };
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getYesterdayKey(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return getTodayKey(yesterday);
}

export function runDailyGoalQA() {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  const lessonGoal = buildDailyGoalSummary({
    selectedGoal: "daily-lesson",
    activityEvents: [createEvent("complete_lesson", todayKey)]
  });
  const reviewGoal = buildDailyGoalSummary({
    selectedGoal: "daily-review",
    activityEvents: Array.from({ length: 5 }, (_, index) => ({
      ...createEvent("review_word", todayKey),
      id: `review-${index + 1}`
    }))
  });
  const quizGoal = buildDailyGoalSummary({
    selectedGoal: "daily-quiz",
    activityEvents: [createEvent("finish_quiz", todayKey)]
  });
  const incompleteGoal = buildDailyGoalSummary({
    selectedGoal: "daily-review",
    activityEvents: Array.from({ length: 2 }, (_, index) => ({
      ...createEvent("review_word", todayKey),
      id: `partial-review-${index + 1}`
    }))
  });
  const ignoredOldActivity = buildDailyGoalSummary({
    selectedGoal: "daily-lesson",
    activityEvents: [
      createEvent("complete_lesson", yesterdayKey),
      createEvent("save_word", todayKey)
    ]
  });
  const fallbackGoal = buildDailyGoalSummary({
    selectedGoal: "unknown-goal",
    activityEvents: []
  });
  const dateFallbackGoal = buildDailyGoalSummary({
    selectedGoal: "daily-quiz",
    activityEvents: [{
      id: "quiz-created-at-only",
      type: "finish_quiz",
      createdAt: `${todayKey}T12:00:00.000Z`
    }]
  });

  const checks = [
    createCheck(
      "daily-lesson-completes",
      "Daily lesson goal completes after one lesson",
      lessonGoal.isComplete && lessonGoal.completed === 1 && lessonGoal.progressPercent === 100,
      [`Completed=${lessonGoal.completed}`, `Progress=${lessonGoal.progressPercent}%`]
    ),
    createCheck(
      "daily-review-completes",
      "Daily review goal completes after five reviews",
      reviewGoal.isComplete && reviewGoal.completed === 5 && reviewGoal.remaining === 0,
      [`Completed=${reviewGoal.completed}`, `Remaining=${reviewGoal.remaining}`]
    ),
    createCheck(
      "daily-quiz-completes",
      "Daily quiz goal completes after one quiz",
      quizGoal.isComplete && quizGoal.completed === 1,
      [`Completed=${quizGoal.completed}`]
    ),
    createCheck(
      "daily-goal-partial-progress",
      "Daily goal reports partial progress correctly",
      !incompleteGoal.isComplete
        && incompleteGoal.completed === 2
        && incompleteGoal.remaining === 3
        && incompleteGoal.progressPercent === 40,
      [
        `Completed=${incompleteGoal.completed}`,
        `Remaining=${incompleteGoal.remaining}`,
        `Progress=${incompleteGoal.progressPercent}%`
      ]
    ),
    createCheck(
      "daily-goal-ignores-old-and-unrelated-events",
      "Daily goal ignores old and unrelated activity",
      ignoredOldActivity.completed === 0 && !ignoredOldActivity.isComplete,
      [`Completed=${ignoredOldActivity.completed}`]
    ),
    createCheck(
      "daily-goal-fallback-safe",
      "Unknown daily goal falls back to daily lesson",
      fallbackGoal.id === "daily-lesson" && fallbackGoal.target === 1,
      [`Goal=${fallbackGoal.id}`, `Target=${fallbackGoal.target}`]
    ),
    createCheck(
      "daily-goal-created-at-fallback",
      "Daily goal reads createdAt when dateKey is absent",
      dateFallbackGoal.completed === 1 && dateFallbackGoal.isComplete,
      [`Completed=${dateFallbackGoal.completed}`]
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
