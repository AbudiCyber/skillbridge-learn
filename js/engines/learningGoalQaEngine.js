import { learningGoals } from "../data/learningGoals.js";
import { defaultState, createResetState } from "../state.js";
import { repairUserState } from "./storageIntegrityEngine.js";

function createGoalCheck(id, title, passed, details = []) {
  return { id, title, status: passed ? "pass" : "fail", details };
}

function uniqueIds(goals) {
  const ids = goals.map((goal) => goal.id);
  return new Set(ids).size === ids.length;
}

function hasRequiredShape(goal) {
  return goal
    && typeof goal.id === "string"
    && goal.id.trim()
    && typeof goal.title === "string"
    && typeof goal.arabicTitle === "string"
    && typeof goal.description === "string"
    && typeof goal.arabicDescription === "string";
}

export function runLearningGoalQA() {
  const goalIds = learningGoals.map((goal) => goal.id);
  const defaultGoal = defaultState.selectedGoal;
  const repairedStates = learningGoals.map((goal) => repairUserState(
    { selectedGoal: goal.id },
    { routes: ["home"], lessons: [], vocabularySections: [] }
  ));
  const resetStates = learningGoals.map((goal) => createResetState({
    ...defaultState,
    selectedGoal: goal.id,
    xp: 120,
    completedLessons: ["eng-001"]
  }));
  const invalidState = repairUserState(
    { selectedGoal: 123 },
    { routes: ["home"], lessons: [], vocabularySections: [] }
  );

  const checks = [
    createGoalCheck("learning-goal-ids-unique", "Learning goal IDs are unique", uniqueIds(learningGoals), ["IDs=" + goalIds.join(", ")]),
    createGoalCheck("learning-goal-shapes-valid", "Learning goal definitions have the required shape", learningGoals.length > 0 && learningGoals.every(hasRequiredShape), ["Goals=" + learningGoals.length]),
    createGoalCheck("learning-goal-default-supported", "Default learning goal is supported", goalIds.includes(defaultGoal), ["Default=" + defaultGoal]),
    createGoalCheck("learning-goal-selection-repaired", "Every supported learning goal survives state repair", repairedStates.every((state, index) => state.selectedGoal === learningGoals[index].id), repairedStates.map((state) => state.selectedGoal)),
    createGoalCheck("learning-goal-reset-preserved", "Selected learning goal survives progress reset", resetStates.every((state, index) => state.selectedGoal === learningGoals[index].id) && resetStates.every((state) => state.xp === 0 && state.completedLessons.length === 0), resetStates.map((state) => "goal=" + state.selectedGoal + ", xp=" + state.xp)),
    createGoalCheck("learning-goal-invalid-fallback", "Invalid learning goal falls back to the default", invalidState.selectedGoal === defaultGoal, ["Fallback=" + invalidState.selectedGoal])
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");
  return {
    status: failedChecks.length === 0 ? "pass" : "fail",
    totals: { checks: checks.length, passed: checks.length - failedChecks.length, failed: failedChecks.length },
    checks
  };
}
