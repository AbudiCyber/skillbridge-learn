export function getQuizByLessonId(quizzes, lessonId) {
  return quizzes.find((quiz) => quiz.lessonId === lessonId) || null;
}

export function calculateQuizScore(answers) {
  const total = answers.length;
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { total, correct, percent };
}

export function isQuizComplete(quiz, selectedAnswers) {
  return quiz.questions.every((question) => selectedAnswers[question.id]);
}

export function hasPassedQuiz(quiz, selectedAnswers) {
  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    answer: selectedAnswers[question.id],
    isCorrect: selectedAnswers[question.id] === question.correctAnswer
  }));
  const score = calculateQuizScore(answers);

  return isQuizComplete(quiz, selectedAnswers) && score.percent >= quiz.passingScore;
}
