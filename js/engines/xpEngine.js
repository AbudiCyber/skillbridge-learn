export const XP_REWARDS = {
  COMPLETE_LESSON: 20,
  CORRECT_ANSWER: 5,
  PASS_QUIZ: 15,
  DAILY_RETURN: 5
};

export function addXP(currentXP, amount) {
  return Math.max(0, currentXP + amount);
}

export function createXPEvent(sourceType, sourceId, amount, reason) {
  return {
    id: `${sourceType}-${sourceId}-${Date.now()}`,
    sourceType,
    sourceId,
    amount,
    reason,
    createdAt: new Date().toISOString()
  };
}

export function hasXPEvent(state, sourceType, sourceId) {
  return (state.xpEvents || []).some((event) => event.sourceType === sourceType && event.sourceId === sourceId);
}
