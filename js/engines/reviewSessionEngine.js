import { buildReviewQueue } from "./reviewEngine.js";

export function createReviewSessionState(state, limit = 100) {
  const queue = buildReviewQueue(state, limit)
    .filter((item) => item.status.isDue)
    .map((item) => item.word.id);

  return {
    reviewSessionQueue: queue,
    reviewSessionIndex: 0,
    reviewSessionCompleted: 0,
    reviewSessionTotal: queue.length,
    reviewSessionResults: [],
    reviewSessionStartedAt: queue.length ? new Date().toISOString() : null,
    reviewSessionCompletedAt: queue.length ? null : new Date().toISOString()
  };
}

export function getReviewSessionSnapshot(state) {
  const queue = Array.isArray(state.reviewSessionQueue) ? state.reviewSessionQueue : [];
  const total = Math.max(queue.length, Number(state.reviewSessionTotal) || 0);
  const index = Math.min(Math.max(0, Number(state.reviewSessionIndex) || 0), total);
  const completed = Math.min(Math.max(0, Number(state.reviewSessionCompleted) || 0), total);
  const activeWordId = queue[index] || null;
  const isComplete = total === 0 || completed >= total || !activeWordId;
  const progressPercent = total ? Math.min(100, Math.round((completed / total) * 100)) : 100;

  return {
    queue,
    total,
    index,
    completed,
    activeWordId,
    isComplete,
    progressPercent,
    position: isComplete ? total : index + 1
  };
}

export function advanceReviewSession(state, wordId, rating) {
  const snapshot = getReviewSessionSnapshot(state);
  if (snapshot.isComplete || snapshot.activeWordId !== wordId) return state;

  const completed = Math.min(snapshot.total, snapshot.completed + 1);
  const index = Math.min(snapshot.total, snapshot.index + 1);
  const isComplete = completed >= snapshot.total;
  const results = Array.isArray(state.reviewSessionResults) ? state.reviewSessionResults : [];

  return {
    ...state,
    reviewSessionIndex: index,
    reviewSessionCompleted: completed,
    reviewSessionResults: [
      ...results,
      {
        wordId,
        rating,
        reviewedAt: new Date().toISOString()
      }
    ],
    reviewSessionCompletedAt: isComplete ? new Date().toISOString() : null
  };
}

export function clearReviewSessionState() {
  return {
    reviewSessionQueue: [],
    reviewSessionIndex: 0,
    reviewSessionCompleted: 0,
    reviewSessionTotal: 0,
    reviewSessionResults: [],
    reviewSessionStartedAt: null,
    reviewSessionCompletedAt: null
  };
}
