import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { words } from "../data/words.js";
import { getLessonById, getLessonWords, isLessonCompleted } from "../engines/lessonEngine.js";
import { getQuizByLessonId, hasPassedQuiz } from "../engines/quizEngine.js";

function isWordSaved(state, wordId) {
  return (state.savedWords || []).some((word) => word.id === wordId);
}

function renderSaveButton(word, state) {
  const saved = isWordSaved(state, word.id);

  return `
    <button class="${saved ? "secondary-button" : "ghost-button"}" data-action="save-word" data-word-id="${word.id}" ${saved ? "disabled" : ""}>
      ${saved ? "محفوظة بالفعل ✅" : "حفظ الكلمة"}
    </button>
  `;
}

function normalizeWordKey(value) {
  return String(value || "").trim().toLowerCase();
}

function renderFallbackWordCard(word) {
  return `
    <article class="word-card is-fallback-word">
      <div>
        <strong>${word}</strong>
        <span>Lesson word</span>
      </div>
      <p>هذه كلمة أساسية داخل الدرس. سيتم ربطها بكرت حفظ كامل لاحقاً إذا احتاجت تفاصيل أكثر.</p>
    </article>
  `;
}

function renderWordCards(lessonWords, lesson, state) {
  const detailedWordKeys = new Set(lessonWords.map((word) => normalizeWordKey(word.word)));
  const fallbackWords = (lesson.words || []).filter((word) => !detailedWordKeys.has(normalizeWordKey(word)));

  if (!lessonWords.length && !fallbackWords.length) {
    return `<p class="empty-state">لا توجد كلمات مرتبطة بهذا الدرس بعد.</p>`;
  }

  return `
    <div class="word-grid">
      ${lessonWords.map((word) => {
        const saved = isWordSaved(state, word.id);

        return `
          <article class="word-card ${saved ? "is-saved" : ""}">
            <div>
              <strong>${word.word}</strong>
              <span>${word.translation}</span>
            </div>
            <p>${word.example}</p>
            ${renderSaveButton(word, state)}
          </article>
        `;
      }).join("")}
      ${fallbackWords.map(renderFallbackWordCard).join("")}
    </div>
  `;
}

function renderExamples(examples) {
  if (!examples?.length) return "";

  return `
    <ul class="page-list">
      ${examples.map((example) => `
        <li>
          <strong>${example.english}</strong>
          <p>${example.arabic}</p>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderCompletionButton({ completed, quizPassed, lesson }) {
  const canComplete = completed || quizPassed;

  return `
    <button
      class="${canComplete ? "primary-button" : "secondary-button"}"
      data-action="complete-lesson"
      data-lesson-id="${lesson.id}"
      ${canComplete ? "" : "disabled"}
    >
      ${completed ? "تم إكمال الدرس ✅" : quizPassed ? "إنهاء الدرس" : "🔒 انجح بالاختبار أولاً"}
    </button>
  `;
}

export function renderLessonPage(state) {
  const lessonId = state.activeLessonId || "eng-001";
  const lesson = getLessonById(lessons, lessonId) || lessons[0];
  const lessonWords = getLessonWords(words, lesson.id);
  const completed = isLessonCompleted(state, lesson.id);
  const quiz = getQuizByLessonId(quizzes, lesson.id);
  const quizAnswers = quiz ? state.quizAnswers?.[quiz.id] || {} : {};
  const quizPassed = quiz ? hasPassedQuiz(quiz, quizAnswers) : false;

  return `
    <section class="content-card">
      <button class="ghost-button inline-back-button" data-route="learn">← الرجوع إلى التعلم</button>
      <div class="track-header" style="margin-top: 14px;">
        <div>
          <p class="section-label">Lesson ${lesson.order}</p>
          <h2 class="page-title">📖 ${lesson.title}</h2>
        </div>
        <span class="status-badge ${completed ? "is-open" : "is-locked"}">${completed ? "مكتمل" : `${lesson.xpReward} XP`}</span>
      </div>
      <p>${lesson.goal}</p>
    </section>

    <section class="content-card">
      <h2>الشرح</h2>
      <p>${lesson.explanation}</p>
    </section>

    <section class="content-card">
      <h2>الكلمات</h2>
      ${renderWordCards(lessonWords, lesson, state)}
    </section>

    <section class="content-card">
      <h2>أمثلة</h2>
      ${renderExamples(lesson.examples)}
    </section>

    <section class="content-card">
      <h2>تدريب سريع</h2>
      <p>${lesson.practice}</p>
    </section>

    <section class="content-card">
      <h2>🤖 نصيحة المساعد</h2>
      <p>${lesson.aiTip}</p>
      <div class="button-row">
        ${renderCompletionButton({ completed, quizPassed, lesson })}
        <button class="ghost-button" data-route="quiz" data-lesson-id="${lesson.id}" ${quiz ? "" : "disabled"}>
          ${quiz ? "بدء الاختبار" : "لا يوجد اختبار"}
        </button>
      </div>
      ${!completed && !quizPassed ? `<p class="lesson-lock-note">افتح الاختبار ونجح أولاً. بعدها سيتم احتساب الدرس تلقائياً مع XP.</p>` : ""}
    </section>
  `;
}
