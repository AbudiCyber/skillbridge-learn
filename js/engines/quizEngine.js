export function calculateQuizScore(answers) {
  const total = answers.length;
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { total, correct, percent };
}
