export const REVIEW_CONFIDENCE = {
  NEW: "new",
  WEAK: "weak",
  LEARNING: "learning",
  STRONG: "strong"
};

export const REVIEW_RATING = {
  AGAIN: "again",
  HARD: "hard",
  GOOD: "good"
};

const REVIEW_INTERVALS = {
  new: 0,
  weak: 1,
  learning: 3,
  strong: 7
};

function getTodayStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);