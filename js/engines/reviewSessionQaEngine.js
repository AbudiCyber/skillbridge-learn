import { advanceReviewSession, createReviewSessionState, getReviewSessionSnapshot } from "./reviewSessionEngine.js";

function createCheck(id, title, passed, details = []) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    details
  };
}

function createFixtureState() {
  return {
    savedWords: [
      { id: "word-1", word: "apple", translation: "تفاحة", example: "I eat an apple." },
      { id: "word-2", word: "book", translation: "كتاب", example: "This is a book." }
    ],
    wordReviews: {}
  };
}

export function runReviewSessionQA() {
  const fixture = createFixtureState();
  const sessionState = {
    ...fixture,
    ...createReviewSessionState(fixture)
  };
  const initialSnapshot = getReviewSessionSnapshot(sessionState);
  const firstWordId = initialSnapshot.activeWordId;
  const afterFirst = advanceReviewSession(sessionState, firstWordId, "good");
  const afterFirstSnapshot = getReviewSessionSnapshot(afterFirst);
  const guardedState = advanceReviewSession(sessionState, "unknown-word", "again");
  const completedState = advanceReviewSession(afterFirst, afterFirstSnapshot.activeWordId, "hard");
  const completedSnapshot = getReviewSessionSnapshot(completedState);
  const emptySession = {
    ...createReviewSessionState({ savedWords: [], wordReviews: {} })
  };
  const emptySnapshot = getReviewSessionSnapshot(emptySession);

  const checks = [
    createCheck(
      "session-freezes-due-queue",
      "Review session freezes all due words",
      initialSnapshot.total === 2 && initialSnapshot.queue.length === 2,
      initialSnapshot.total === 2 ? [] : [`Expected 2 words, got ${initialSnapshot.total}`]
    ),
    createCheck(
      "session-starts-at-first-word",
      "Review session starts at the first queued word",
      initialSnapshot.index === 0 && initialSnapshot.completed === 0 && Boolean(firstWordId),
      [`Index ${initialSnapshot.index}`, `Completed ${initialSnapshot.completed}`, `Active ${firstWordId || "null"}`]
    ),
    createCheck(
      "session-advances-on-valid-rating",
      "Valid review advances exactly one position",
      afterFirstSnapshot.index === 1 && afterFirstSnapshot.completed === 1 && afterFirst.reviewSessionResults.length === 1,
      [`Index ${afterFirstSnapshot.index}`, `Completed ${afterFirstSnapshot.completed}`, `Results ${afterFirst.reviewSessionResults.length}`]
    ),
    createCheck(
      "session-rejects-wrong-word",
      "Session rejects ratings for a non-active word",
      guardedState === sessionState,
      guardedState === sessionState ? [] : ["State changed for an invalid word"]
    ),
    createCheck(
      "session-completes-at-queue-end",
      "Session completes after the final queued word",
      completedSnapshot.isComplete && completedSnapshot.progressPercent === 100 && Boolean(completedState.reviewSessionCompletedAt),
      [`Complete ${completedSnapshot.isComplete}`, `Progress ${completedSnapshot.progressPercent}%`]
    ),
    createCheck(
      "session-records-results",
      "Session records one result per reviewed word",
      completedState.reviewSessionResults.length === completedSnapshot.total,
      [`Results ${completedState.reviewSessionResults.length}`, `Total ${completedSnapshot.total}`]
    ),
    createCheck(
      "empty-session-safe",
      "Empty review session resolves safely as complete",
      emptySnapshot.isComplete && emptySnapshot.total === 0 && emptySnapshot.progressPercent === 100,
      [`Complete ${emptySnapshot.isComplete}`, `Total ${emptySnapshot.total}`, `Progress ${emptySnapshot.progressPercent}%`]
    )
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");

  return {
    status: failedChecks.length ? "fail" : "pass",
    totals: {
      checks: checks.length,
      passed: checks.length - failedChecks.length,
      failed: failedChecks.length
    },
    checks
  };
}
