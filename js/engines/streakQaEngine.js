import { applyDailyActivity, getPreviousDayKey, getStreakStatus, getTodayKey } from "./streakEngine.js";

function createCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

export function runStreakQA() {
  const referenceDate = new Date("2026-08-04T12:00:00.000Z");
  const todayKey = getTodayKey(referenceDate);
  const yesterdayKey = getPreviousDayKey(referenceDate);
  const olderDate = new Date(referenceDate);
  olderDate.setUTCDate(olderDate.getUTCDate() - 3);
  const olderKey = getTodayKey(olderDate);

  const completedTodayState = {
    streak: 4,
    bestStreak: 7,
    lastActivityDate: todayKey
  };
  const continueState = {
    streak: 4,
    bestStreak: 7,
    lastActivityDate: yesterdayKey
  };
  const resetState = {
    streak: 8,
    bestStreak: 10,
    lastActivityDate: olderKey
  };
  const newState = {
    streak: 0,
    bestStreak: 0,
    lastActivityDate: null
  };

  const unchangedToday = applyDailyActivity(completedTodayState, referenceDate);
  const continued = applyDailyActivity(continueState, referenceDate);
  const reset = applyDailyActivity(resetState, referenceDate);
  const started = applyDailyActivity(newState, referenceDate);

  const checks = [
    createCheck(
      "streak-detects-completed-today",
      "Streak detects activity already completed today",
      getStreakStatus(completedTodayState, referenceDate) === "completed_today",
      [`Status=${getStreakStatus(completedTodayState, referenceDate)}`]
    ),
    createCheck(
      "streak-detects-continuation",
      "Streak detects a valid continuation from yesterday",
      getStreakStatus(continueState, referenceDate) === "continue",
      [`Status=${getStreakStatus(continueState, referenceDate)}`]
    ),
    createCheck(
      "streak-detects-reset",
      "Streak resets after a missed day",
      getStreakStatus(resetState, referenceDate) === "reset",
      [`Status=${getStreakStatus(resetState, referenceDate)}`]
    ),
    createCheck(
      "streak-idempotent-same-day",
      "Repeated activity on the same day does not increment streak",
      unchangedToday === completedTodayState && unchangedToday.streak === 4,
      [`Streak=${unchangedToday.streak}`]
    ),
    createCheck(
      "streak-increments-next-day",
      "Activity on the next day increments streak exactly once",
      continued.streak === 5
        && continued.bestStreak === 7
        && continued.lastActivityDate === todayKey,
      [
        `Streak=${continued.streak}`,
        `Best=${continued.bestStreak}`,
        `Date=${continued.lastActivityDate}`
      ]
    ),
    createCheck(
      "streak-preserves-best-after-reset",
      "Reset streak preserves the historical best",
      reset.streak === 1
        && reset.bestStreak === 10
        && reset.lastActivityDate === todayKey,
      [
        `Streak=${reset.streak}`,
        `Best=${reset.bestStreak}`,
        `Date=${reset.lastActivityDate}`
      ]
    ),
    createCheck(
      "streak-starts-safely",
      "First activity starts a one-day streak",
      started.streak === 1
        && started.bestStreak === 1
        && started.lastActivityDate === todayKey,
      [
        `Streak=${started.streak}`,
        `Best=${started.bestStreak}`,
        `Date=${started.lastActivityDate}`
      ]
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
