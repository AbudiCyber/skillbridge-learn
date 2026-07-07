export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function shouldIncrementStreak(lastStudyDate, today = getTodayKey()) {
  return lastStudyDate !== today;
}
