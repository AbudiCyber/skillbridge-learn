import { quizzes } from "../data/quizzes.js";
import { lessons } from "../data/lessons.js";
import { getLessonById } from "../engines/lessonEngine.js";
import { calculateQuizScore, getQuizByLessonId } from "../engines/quizEngine.js";

function getSelectedAnswers(state, quizId) {
  return state.quizAnswers?.[quizId] || {};
}

function renderQuestion(question, selectedAnswer, index) {
  const answered = Boolean(selectedAnswer);

  return `
    <article class="quiz-question-card">
      <p class="section-label">Question ${index + 1}</p>
      <h3>${question.question}</h3>
      <div class="quiz-options">
        ${question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;
          const optionClass = answered
            ? isCorrect
              ? "is-correct"
              : isSelected
                ? "is-wrong"
                : ""
            : "";

          return `
            <button
              class="quiz-option ${isSelected ? "is-selected" : ""} ${optionClass}"
              data-action="answer-quiz"
              data-question-id="${question.id}"
              data-answer="${option}"
              ${answered ? "disabled" : ""}
            >
              ${option}
            </button>
          `;
        }).join("")}
      </div>
      ${answered ? `<p class="quiz-explanation">${question.explanation}</p>` : ""}
    </article>
  `;
}

function renderQuizResult(quiz, selectedAnswers) {
  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    answer: selectedAnswers[question.id],
    isCorrect: selectedAnswers[question.id] === question.correctAnswer
  }));
  const score = calculateQuizScore(answers);
  const isComplete = quiz.questions.every((question) => selectedAnswers[question.id]);
  const passed = isComplete && score.percent >= quiz.passingScore;

  if (!isComplete) {
    return `
      <section class="content-card">
        <h2>نتيجة الاختبار</h2>
        <p>أجب عن كل الأسئلة حتى تظهر النتيجة النهائية.</p>
        <div class="progress-bar"><span style="width: ${score.percent}%"></span></div>
      </section>
    `;
  }

  return `
    <section class="content-card quiz-result-card">
      <h2>${passed ? "نجحت ✅" : "راجع ثم حاول مرة أخرى"}</h2>
      <p>درجتك: ${score.correct} / ${score.total} — ${score.percent}%</p>
      <div class="progress-bar"><span style="width: ${score.percent}%"></span></div>
      <div class="button-row quiz-result-actions" style="margin-top: 14px;">
        <button class="primary-button" data-action="finish-quiz" data-quiz-id="${quiz.id}">
          ${passed ? "إنهاء الاختبار + XP" : "حفظ المحاولة"}
        </button>
        <button class="ghost-button" data-action="reset-quiz" data-quiz-id="${quiz.id}">إعادة المحاولة</button>
      </div>
      ${passed ? `<p class="quiz-finish-note">سيتم احتساب الاختبار والدرس معاً عند الضغط على زر XP.</p>` : ""}
    </section>
  `;
}

export function renderQuizPage(state) {
  const lessonId = state.activeLessonId || "eng-001";
  const lesson = getLessonById(lessons, lessonId) || lessons[0];
  const quiz = getQuizByLessonId(quizzes, lesson.id);

  if (!quiz) {
    return `
      <section class="content-card">
        <button class="ghost-button inline-back-button" data-route="lesson" data-lesson-id="${lesson.id}">← الرجوع إلى الدرس</button>
        <h2 class="page-title">لا يوجد اختبار بعد</h2>
        <p>سيتم إضافة اختبار لهذا الدرس لاحقاً.</p>
      </section>
    `;
  }

  const selectedAnswers = getSelectedAnswers(state, quiz.id);

  return `
    <section class="content-card">
      <button class="ghost-button inline-back-button" data-route="lesson" data-lesson-id="${lesson.id}">← الرجوع إلى الدرس</button>
      <div class="track-header" style="margin-top: 14px;">
        <div>
          <p class="section-label">Mini Quiz</p>
          <h2 class="page-title">📝 ${quiz.title}</h2>
        </div>
        <span class="status-badge is-open">${quiz.passingScore}% Pass</span>
      </div>
      <p>اختبار قصير للتأكد من فهمك لدرس: ${lesson.title}</p>
    </section>

    <section class="card-grid">
      ${quiz.questions.map((question, index) => renderQuestion(question, selectedAnswers[question.id], index)).join("")}
    </section>

    ${renderQuizResult(quiz, selectedAnswers)}
  `;
}
