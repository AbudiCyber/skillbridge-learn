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
    if (!event) return result;

    const dateKey = event.dateKey || (event.createdAt ? getDateKey(new Date(event.createdAt)) : null);
    if (!dateKey) return result;

    return {
      ...result,
      [dateKey]: (result[dateKey] || 0) + 1
    };
  }, {});
}

function formatTime(dateValue) {
  if (!dateValue) return "--:--";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
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
  if (!event) return state;

  return {
    ...state,
    activityEvents: [...(state.activityEvents || []), event].slice(-300)
  };
}

export function getActivityPresentation(event) {
  const map = {
    complete_lesson: {
      icon: "📖",
      title: "إكمال درس",
      description: "تم إنهاء درس وإضافة تقدمه إلى مسارك."
    },
    save_word: {
      icon: "⭐",
      title: "حفظ كلمة",
      description: "تمت إضافة كلمة جديدة إلى المحفوظات."
    },
    review_word: {
      icon: "🔁",
      title: "مراجعة كلمة",
      description: "تمت مراجعة كلمة محفوظة وتقوية ذاكرتها."
    },
    answer_quiz: {
      icon: "📝",
      title: "إجابة اختبار",
      description: "تم تسجيل إجابة داخل اختبار قصير."
    },
    finish_quiz: {
      icon: "✅",
      title: "إنهاء اختبار",
      description: event?.metadata?.passed ? "تم اجتياز الاختبار بنجاح." : "تم إنهاء الاختبار ويحتاج محاولة أفضل."
    }
  };

  return map[event?.type] || {
    icon: "•",
    title: "نشاط تعلّم",
    description: "تم تسجيل نشاط داخل التطبيق."
  };
}

export function buildActivityTimeline(state, limit = 8) {
  return (state.activityEvents || [])
    .filter(Boolean)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((event) => ({
      ...event,
      presentation: getActivityPresentation(event),
      timeLabel: formatTime(event.createdAt),
      dateLabel: event.dateKey || (event.createdAt ? getDateKey(new Date(event.createdAt)) : "unknown")
    }));
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
  const activityEvents = (state.activityEvents || []).filter(Boolean);
  const lessonEvents = activityEvents.filter((event) => event.type === "complete_lesson");
  const saveWordEvents = activityEvents.filter((event) => event.type === "save_word");
  const reviewEvents = activityEvents.filter((event) => event.type === "review_word");
  const quizEvents = activityEvents.filter((event) => event.type === "finish_quiz" || event.type === "answer_quiz");
  const lastSevenDays = buildLastSevenDaysActivity(state);
  const bestDay = getBestActivityDay(state);
  const timeline = buildActivityTimeline(state, 8);
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
    timeline,
    hasActivity: totalActions > 0
  };
}
