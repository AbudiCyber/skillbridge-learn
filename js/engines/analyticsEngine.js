function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getLastNDays(count = 7, date = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(date);
    day.setDate(day.getDate() - (count - 1 - index));
    return getDateKey(day);
  });
}

function countByDate(events = []) {
  return events.reduce((result, event) => {
    const dateKey = event.dateKey || (event.createdAt ? getDateKey(new Date(event.createdAt)) : null);
    if (!dateKey) return result;

    return {
      ...result,
      [dateKey]: (result[dateKey] || 0) + 1
    };
  }, {});
}

export function createActivityEvent(type, entityId, metadata = {}) {
  const createdAt = new Date().toISOString();

  return {
    id: `${type}-${entityId || "general"}-${Date.now()}`,
    type,
    entityId,
    metadata,
    createdAt,
    dateKey: getDateKey(new Date(createdAt))
  };
}

export function appendActivityEvent(state, event) {
  return {
    ...state,
    activityEvents: [...(state.activityEvents || []), event].slice(-300)
  };
}

export function buildLastSevenDaysActivity(state) {
  const activityEvents = state.activityEvents || [];
  const counts = countByDate(activityEvents);

  return getLastNDays(7).map((dateKey) => ({
    dateKey,
    count: counts[dateKey] || 0
  }));
}

export function getBestActivityDay(state) {
  const activity = buildLastSevenDaysActivity(state);

  return activity.reduce((best, day) => {
    if (!best || day.count > best.count) return day;
    return best;
  }, null);
}

export function buildAnalyticsSummary(state) {
  const activityEvents = state.activityEvents || [];
  const lessonEvents = activityEvents.filter((event) => event.type === "complete_lesson");
  const saveWordEvents = activityEvents.filter((event) => event.type === "save_word");
  const reviewEvents = activityEvents.filter((event) => event.type === "review_word");
  const quizEvents = activityEvents.filter((event) => event.type === "finish_quiz" || event.type === "answer_quiz");
  const lastSevenDays = buildLastSevenDaysActivity(state);
  const bestDay = getBestActivityDay(state);
  const totalActions = activityEvents.length;

  return {
    totalActions,
    completedLessons: state.completedLessons?.length || 0,
    savedWords: state.savedWords?.length || 0,
    completedQuizzes: state.completedQuizzes?.length || 0,
    reviews: reviewEvents.length,
    lessonEvents: lessonEvents.length,
    saveWordEvents: saveWordEvents.length,
    quizEvents: quizEvents.length,
    lastSevenDays,
    bestDay,
    hasActivity: totalActions > 0
  };
}
