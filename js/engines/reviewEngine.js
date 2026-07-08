export function getReviewRecord(state, wordId) {
  return state.wordReviews?.[wordId] || {
    wordId,
    reviewCount: 0,
    lastReviewedAt: null,
    confidence: "new"
  };
}

export function markWordReviewed(state, wordId) {
  const currentReviews = state.wordReviews || {};
  const currentRecord = getReviewRecord(state, wordId);

  return {
    ...state,
    wordReviews: {
      ...currentReviews,
      [wordId]: {
        ...currentRecord,
        reviewCount: currentRecord.reviewCount + 1,
        lastReviewedAt: new Date().toISOString(),
        confidence: currentRecord.reviewCount + 1 >= 3 ? "strong" : "learning"
      }
    }
  };
}

export function getSavedWordsReviewSummary(state) {
  const savedWords = state.savedWords || [];
  const reviewedWords = savedWords.filter((word) => getReviewRecord(state, word.id).reviewCount > 0);
  const strongWords = savedWords.filter((word) => getReviewRecord(state, word.id).confidence === "strong");

  return {
    totalSaved: savedWords.length,
    reviewed: reviewedWords.length,
    strong: strongWords.length,
    pending: Math.max(0, savedWords.length - reviewedWords.length)
  };
}

export function formatReviewDate(dateValue) {
  if (!dateValue) return "Not reviewed yet";
  return new Date(dateValue).toLocaleDateString();
}
