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
  next.setDate(next.getDate() + days);
  return next;
}

function getDaysSince(dateValue, today = new Date()) {
  if (!dateValue) return Infinity;

  const reviewDate = new Date(dateValue);
  if (Number.isNaN(reviewDate.getTime())) return Infinity;

  const diff = getTodayStart(today).getTime() - getTodayStart(reviewDate).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function getDaysUntil(dateValue, today = new Date()) {
  if (!dateValue) return 0;

  const reviewDate = new Date(dateValue);
  if (Number.isNaN(reviewDate.getTime())) return 0;

  const diff = getTodayStart(reviewDate).getTime() - getTodayStart(today).getTime();
  return Math.ceil(diff / 86400000);
}

function getConfidenceByScore(strengthScore, reviewCount) {
  if (reviewCount <= 0) return REVIEW_CONFIDENCE.NEW;
  if (strengthScore <= 1) return REVIEW_CONFIDENCE.WEAK;
  if (strengthScore <= 4) return REVIEW_CONFIDENCE.LEARNING;
  return REVIEW_CONFIDENCE.STRONG;
}

function getNextInterval(rating, currentRecord) {
  const currentInterval = Math.max(0, Number(currentRecord.intervalDays) || 0);

  if (rating === REVIEW_RATING.AGAIN) return 0;
  if (rating === REVIEW_RATING.HARD) return Math.max(1, Math.min(3, currentInterval || 1));
  return Math.min(30, Math.max(2, currentInterval ? currentInterval * 2 : 3));
}

function getNextStrengthScore(rating, currentRecord) {
  const currentScore = Math.max(0, Number(currentRecord.strengthScore) || 0);

  if (rating === REVIEW_RATING.AGAIN) return Math.max(0, currentScore - 2);
  if (rating === REVIEW_RATING.HARD) return Math.max(1, currentScore);
  return Math.min(10, currentScore + 2);
}

export function getReviewRecord(state, wordId) {
  const existing = state.wordReviews?.[wordId] || {};
  const reviewCount = Math.max(0, Number(existing.reviewCount) || 0);
  const strengthScore = Math.max(0, Number(existing.strengthScore) || 0);
  const confidence = existing.confidence || getConfidenceByScore(strengthScore, reviewCount);

  return {
    wordId,
    reviewCount,
    correctCount: Math.max(0, Number(existing.correctCount) || 0),
    wrongCount: Math.max(0, Number(existing.wrongCount) || 0),
    lastReviewedAt: existing.lastReviewedAt || null,
    nextReviewAt: existing.nextReviewAt || null,
    lastRating: existing.lastRating || null,
    intervalDays: Math.max(0, Number(existing.intervalDays) || 0),
    strengthScore,
    confidence
  };
}

export function getReviewStatus(record, today = new Date()) {
  const reviewCount = record.reviewCount || 0;
  const confidence = getConfidenceByScore(record.strengthScore || 0, reviewCount);
  const daysSinceReview = getDaysSince(record.lastReviewedAt, today);
  const fallbackInterval = REVIEW_INTERVALS[confidence] ?? 1;
  const fallbackNextReviewAt = record.lastReviewedAt
    ? addDays(new Date(record.lastReviewedAt), record.intervalDays || fallbackInterval).toISOString()
    : null;
  const nextReviewAt = record.nextReviewAt || fallbackNextReviewAt;
  const daysUntilReview = getDaysUntil(nextReviewAt, today);
  const isDue = reviewCount === 0 || daysUntilReview <= 0;

  const nextReviewHint = reviewCount === 0
    ? "اليوم"
    : isDue
      ? "مستحقة الآن"
      : daysUntilReview === 1
        ? "بعد يوم"
        : `بعد ${daysUntilReview} أيام`;

  const overdueBoost = isDue ? Math.min(20, Math.max(0, daysSinceReview)) : 0;
  const basePriority = {
    new: 100,
    weak: 80,
    learning: 55,
    strong: 25
  }[confidence] ?? 50;

  return {
    confidence,
    label: confidence,
    strength: confidence,
    priority: basePriority + overdueBoost,
    nextReviewHint,
    daysSinceReview,
    daysUntilReview,
    nextReviewAt,
    isDue
  };
}

export function rateWordReview(state, wordId, rating = REVIEW_RATING.GOOD, now = new Date()) {
  const safeRating = Object.values(REVIEW_RATING).includes(rating) ? rating : REVIEW_RATING.GOOD;
  const currentReviews = state.wordReviews || {};
  const currentRecord = getReviewRecord(state, wordId);
  const intervalDays = getNextInterval(safeRating, currentRecord);
  const strengthScore = getNextStrengthScore(safeRating, currentRecord);
  const reviewCount = currentRecord.reviewCount + 1;
  const confidence = getConfidenceByScore(strengthScore, reviewCount);
  const lastReviewedAt = now.toISOString();
  const nextReviewAt = addDays(now, intervalDays).toISOString();
  const isCorrect = safeRating !== REVIEW_RATING.AGAIN;

  return {
    ...state,
    wordReviews: {
      ...currentReviews,
      [wordId]: {
        ...currentRecord,
        reviewCount,
        correctCount: currentRecord.correctCount + (isCorrect ? 1 : 0),
        wrongCount: currentRecord.wrongCount + (isCorrect ? 0 : 1),
        lastReviewedAt,
        nextReviewAt,
        lastRating: safeRating,
        intervalDays,
        strengthScore,
        confidence
      }
    }
  };
}

export function markWordReviewed(state, wordId) {
  return rateWordReview(state, wordId, REVIEW_RATING.GOOD);
}

export function buildReviewQueue(state, limit = 5) {
  const savedWords = state.savedWords || [];

  return savedWords
    .map((word) => {
      const record = getReviewRecord(state, word.id);
      const status = getReviewStatus(record);

      return {
        word,
        record,
        status
      };
    })
    .sort((a, b) => {
      if (a.status.isDue !== b.status.isDue) return a.status.isDue ? -1 : 1;
      if (b.status.priority !== a.status.priority) return b.status.priority - a.status.priority;
      if ((a.status.nextReviewAt || "") !== (b.status.nextReviewAt || "")) {
        return String(a.status.nextReviewAt || "").localeCompare(String(b.status.nextReviewAt || ""));
      }
      return (a.word.word || "").localeCompare(b.word.word || "");
    })
    .slice(0, limit);
}

export function getSavedWordsReviewSummary(state) {
  const savedWords = state.savedWords || [];
  const reviewItems = savedWords.map((word) => {
    const record = getReviewRecord(state, word.id);
    return getReviewStatus(record);
  });
  const reviewedWords = reviewItems.filter((status) => status.confidence !== REVIEW_CONFIDENCE.NEW);
  const strongWords = reviewItems.filter((status) => status.confidence === REVIEW_CONFIDENCE.STRONG);
  const weakWords = reviewItems.filter((status) => status.confidence === REVIEW_CONFIDENCE.WEAK || status.confidence === REVIEW_CONFIDENCE.NEW);
  const dueWords = reviewItems.filter((status) => status.isDue);

  return {
    totalSaved: savedWords.length,
    reviewed: reviewedWords.length,
    strong: strongWords.length,
    weak: weakWords.length,
    due: dueWords.length,
    pending: Math.max(0, savedWords.length - reviewedWords.length)
  };
}

export function formatReviewDate(dateValue) {
  if (!dateValue) return "لم تتم المراجعة بعد";
  return new Date(dateValue).toLocaleDateString("ar-IQ");
}
