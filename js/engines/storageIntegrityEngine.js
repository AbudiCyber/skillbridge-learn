import { learningGoals } from "../data/learningGoals.js";
import { defaultState } from "../state.js";
import { ensureArray, getSafeLessonId, getSafeVocabularySectionId, normalizeRoute } from "./runtimeSafetyEngine.js";

function ensureObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function ensureNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function ensureNonNegativeInteger(value, fallback = 0) {
  const safeValue = ensureNumber(value, fallback);
  return Math.max(0, Math.floor(safeValue));
}

function ensureString(value, fallback) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function ensureBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

const VALID_GOAL_IDS = new Set(learningGoals.map((goal) => goal.id));
const LEGACY_GOAL_MIGRATIONS = {
  "vocabulary-builder": "daily-review",
  "quiz-practice": "daily-quiz",
  "streak-builder": "daily-lesson"
};

function normalizeSelectedGoal(value) {
  const candidate = ensureString(value, defaultState.selectedGoal);

  if (VALID_GOAL_IDS.has(candidate)) {
    return candidate;
  }

  const migratedGoal = LEGACY_GOAL_MIGRATIONS[candidate];
  return migratedGoal && VALID_GOAL_IDS.has(migratedGoal)
    ? migratedGoal
    : defaultState.selectedGoal;
}

function ensureNullableString(value) {
  return typeof value === "string" ? value : null;
}

function repairReviewSession(source) {
  const queue = ensureArray(source.reviewSessionQueue)
    .filter((wordId) => typeof wordId === "string" && wordId.trim());
  const results = ensureArray(source.reviewSessionResults)
    .filter((result) => result && typeof result === "object" && !Array.isArray(result));
  const total = Math.max(queue.length, ensureNonNegativeInteger(source.reviewSessionTotal));
  const index = Math.min(total, ensureNonNegativeInteger(source.reviewSessionIndex));
  const completed = Math.min(total, ensureNonNegativeInteger(source.reviewSessionCompleted));

  return {
    reviewSessionQueue: queue,
    reviewSessionIndex: index,
    reviewSessionCompleted: completed,
    reviewSessionTotal: total,
    reviewSessionResults: results.slice(0, completed),
    reviewSessionStartedAt: ensureNullableString(source.reviewSessionStartedAt),
    reviewSessionCompletedAt: ensureNullableString(source.reviewSessionCompletedAt)
  };
}

export function repairUserState(rawState, { routes, lessons = [], vocabularySections = [] }) {
  const source = ensureObject(rawState);
  const safeRoute = normalizeRoute(source.route || defaultState.route, routes);
  const activeLessonId = getSafeLessonId(lessons, source.activeLessonId || defaultState.activeLessonId);
  const activeVocabularySectionId = getSafeVocabularySectionId(vocabularySections, source.activeVocabularySectionId);
  const reviewSessionState = repairReviewSession(source);

  return {
    ...defaultState,
    ...source,
    route: safeRoute,
    activeLessonId: activeLessonId || defaultState.activeLessonId,
    activeVocabularySectionId,
    uiLanguage: ensureString(source.uiLanguage, defaultState.uiLanguage),
    themeMode: ensureString(source.themeMode, defaultState.themeMode),
    xp: Math.max(0, ensureNumber(source.xp, defaultState.xp)),
    streak: Math.max(0, ensureNumber(source.streak, defaultState.streak)),
    bestStreak: Math.max(0, ensureNumber(source.bestStreak, defaultState.bestStreak)),
    lastActivityDate: ensureNullableString(source.lastActivityDate),
    completedLessons: ensureArray(source.completedLessons),
    completedQuizzes: ensureArray(source.completedQuizzes),
    quizAnswers: ensureObject(source.quizAnswers),
    xpEvents: ensureArray(source.xpEvents),
    activityEvents: ensureArray(source.activityEvents),
    savedWords: ensureArray(source.savedWords),
    wordReviews: ensureObject(source.wordReviews),
    ...reviewSessionState,
    selectedGoal: normalizeSelectedGoal(source.selectedGoal),
    resetConfirmArmed: ensureBoolean(source.resetConfirmArmed, defaultState.resetConfirmArmed)
  };
}

export function parseStoredState(stored) {
  if (!stored) return { state: { ...defaultState }, repaired: false, hadError: false };

  try {
    const parsed = JSON.parse(stored);
    return { state: parsed, repaired: false, hadError: false };
  } catch (error) {
    console.warn("Stored state was invalid JSON and has been reset:", error);
    return { state: { ...defaultState }, repaired: true, hadError: true };
  }
}

export function loadAndRepairState(stored, context) {
  const parsed = parseStoredState(stored);
  const repairedState = repairUserState(parsed.state, context);

  return {
    state: repairedState,
    repaired: parsed.repaired || JSON.stringify(parsed.state) !== JSON.stringify(repairedState),
    hadError: parsed.hadError
  };
}
