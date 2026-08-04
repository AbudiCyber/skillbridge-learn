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

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEventDateKey(event) {
  const value = event?.createdAt || event?.timestamp || event?.date || event?.occurredAt;
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return getTodayKey(date);
}

function countTodayEvents(state, type) {
  const todayKey = getTodayKey();
  const activityEvents = Array.isArray(state.activityEvents) ? state.activityEvents : [];

  return activityEvents.filter((event) => {
    const eventType = event?.type || event?.action;
    return eventType === type && getEventDateKey(event) === todayKey;
  }).length;
}

export function buildDailyGoalSummary(state) {
  const goalDefinitions = {
    "daily-lesson": {
      id: "daily-lesson",
      title: "درس يومي",
      description: "أكمل درساً واحداً اليوم.",
      target: 1,
      eventType: "complete_lesson"
    },
    "daily-review": {
      id: "daily-review",
      title: "مراجعة يومية",
      description: "راجع خمس كلمات اليوم.",
      target: 5,
      eventType: "review_word"
    },
    "daily-quiz": {
      id: "daily-quiz",
      title: "اختبار يومي",
      description: "أنه اختباراً واحداً اليوم.",
      target: 1,
      eventType: "finish_quiz"
    }
  };
  const selectedGoalId = goalDefinitions[state.selectedGoal] ? state.selectedGoal : "daily-lesson";
  const goal = goalDefinitions[selectedGoalId];
  const completed = countTodayEvents(state, goal.eventType);

  return {
    ...goal,
    completed,
    remaining: Math.max(0, goal.target - completed),
    progressPercent: getProgressPercent(completed, goal.target),
    isComplete: completed >= goal.target
  };
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
    quizProgressPercent: getProgressPercent(completedQuizzes, totals.quizzes),
    dailyGoal: buildDailyGoalSummary(state)
  };
}
