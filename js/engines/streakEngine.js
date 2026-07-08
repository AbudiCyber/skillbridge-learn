export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getPreviousDayKey(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return getTodayKey(previous);
}

export function getStreakStatus(state, date = new Date()) {
  const today = getTodayKey(date);
  const yesterday = getPreviousDayKey(date);
  const lastActivityDate = state.lastActivityDate || null;

  if (lastActivityDate === today) {
    return "completed_today";
  }

  if (lastActivityDate === yesterday) {
    return "continue";
  }

  return "reset";
}

export function applyDailyActivity(state, date = new Date()) {
  const today = getTodayKey(date);
  const status = getStreakStatus(state, date);

  if (status === "completed_today") {
    return state;
  }

  const nextStreak = status === "continue" ? (state.streak || 0) + 1 : 1;

  return {
    ...state,
    streak: nextStreak,
    bestStreak: Math.max(state.bestStreak || 0, nextStreak),
    lastActivityDate: today
  };
}

export function getStreakMessage(state) {
  const status = getStreakStatus(state);

  if (status === "completed_today") {
    return "تم تسجيل نشاط اليوم. حافظ على السلسلة غداً.";
  }

  if (status === "continue") {
    return "أنت قريب من زيادة السلسلة. أكمل نشاطاً اليوم.";
  }

  return "ابدأ نشاط اليوم لبناء سلسلة جديدة.";
}
