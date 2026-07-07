export const XP_REWARDS = {
  COMPLETE_LESSON: 20,
  CORRECT_ANSWER: 5,
  PASS_QUIZ: 15,
  DAILY_RETURN: 5
};

export function addXP(currentXP, amount) {
  return Math.max(0, currentXP + amount);
}
