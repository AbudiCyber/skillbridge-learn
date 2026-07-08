export const REVIEW_CONFIDENCE = {
  NEW: "new",
  WEAK: "weak",
  LEARNING: "learning",
  STRONG: "strong"
};

const REVIEW_INTERVALS = {
  new: 0,
  weak: 1,
  learning: 2,
  strong: 5
};

function getTodayStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysSince(dateValue, today = new Date()) {
  if (!dateValue) return Infinity;

  const reviewDate = new Date(dateValue);
  if (Number.isNaN(reviewDate.getTime())) return Infinity;

  const diff = getTodayStart(today).getTime() - getTodayStart(reviewDate).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function getConfidenceByReviewCount(reviewCount) {
  if (reviewCount <= 0) return REVIEW_CONFIDENCE.NEW;
  if (reviewCount === 1) return REVIEW_CONFIDENCE.WEAK;
  if (reviewCount < 4) return REVIEW_CONFIDENCE.LEARNING;
  return REVIEW_CONFIDENCE.STRONG;
}

export function getReviewRecord(state, wordId) {
  return state.wordReviews?.[wordId] || {
    wordId,
    reviewCount: 0,
    lastReviewedAt: null,
    confidence: REVIEW_CONFIDENCE.NEW
  };
}

export function getReviewStatus(record, today = new Date()) {
  const reviewCount = record.reviewCount || 0;
  const confidence = getConfidenceByReviewCount(reviewCount);
  const daysSinceReview = getDaysSince(record.lastReviewedAt, today);
  const dueAfterDays = REVIEW_INTERVALS[confidence] ?? 1;
  const isDue = reviewCount === 0 || daysSinceReview >= dueAfterDays;

  if (reviewCount === 0) {
    return {
      confidence: REVIEW_CONFIDENCE.NEW,
      label: "New",
      strength: "new",
      priority: 100,
      nextReviewHint: "Today",
      daysSinceReview,
      isDue
    };
  }

  if (confidence === REVIEW_CONFIDENCE.WEAK || daysSinceReview >= 4) {
    return {
      confidence: REVIEW_CONFIDENCE.WEAK,
      label: "Weak",
      strength: "weak",
      priority: 80 + Math.min(daysSinceReview, 10),
      nextReviewHint: isDue ? "Today" : "Soon",
      daysSinceReview,
      isDue
    };
  }

  if (confidence === REVIEW_CONFIDENCE.LEARNING) {
    return {
      confidence: REVIEW_CONFIDENCE.LEARNING,
      label: "Learning",
      strength: "learning",
      priority: 50 + Math.min(daysSinceReview, 10),
      nextReviewHint: isDue ? "Today" : "Soon",
      daysSinceReview,
      isDue
    };
  }

  return {
    confidence: REVIEW_CONFIDENCE.STRONG,
    label: "Strong",
    strength: "strong",
    priority: isDue ? 35 : 10,
    nextReviewHint: isDue ? "Light review" : "Later",
    daysSinceReview,
    isDue
  };
}

export function markWordReviewed(state, wordId) {
  const currentReviews = state.wordReviews || {};
  const currentRecord = getReviewRecord(state, wordId);
  const nextReviewCount = currentRecord.reviewCount + 1;
  const nextConfidence = getConfidenceByReviewCount(nextReviewCount);

  return {
    ...state,
    wordReviews: {
      ...currentReviews,
      [wordId]: {
        ...currentRecord,
        reviewCount: nextReviewCount,
        lastReviewedAt: new Date().toISOString(),
        confidence: nextConfidence
      }
    }
  };
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
      if (b.status.priority !== a.status.priority) {
        return b.status.priority - a.status.priority;
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
  if (!dateValue) return "Not reviewed yet";
  return new Date(dateValue).toLocaleDateString();
}
