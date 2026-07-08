import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { words } from "../data/words.js";
import { getLessonById, getLessonWords, isLessonCompleted } from "../engines/lessonEngine.js";
import { getQuizByLessonId } from "../engines/quizEngine.js";

function renderWordCards(lessonWords, lesson) {
  if (!lessonWords.length && lesson.words?.length) {
    return `
      <div class="word-grid">
        ${lesson.words.map((word) => `
          <article class="word-card">
            <div>
              <strong>${word}</strong>
              <span>Lesson word</span>
            </div>
            <p>هذه كلمة أساسية داخل الدرس. سيتم ربطها بكرت حفظ كامل لاحقاً إذا احتاجت تفاصيل أكثر.</p>
          </article>
        `).join("")}
      </div>
    `;
  }

  if (!lessonWords.length) {
    return `<p class="empty-state">لا توجد كلمات مرتبطة بهذا الدرس بعد.</p>`;
  }

  return `
    <div class="word-grid">
      ${lessonWords.map((word) => `
        <article class="word-card">
          <div>
            <strong>${word.word}</strong>
            <span>${word.translation}</span>
          </div>
          <p>${word.example}</p>
          <button class="ghost-button" data-action="save-word" data-word-id="${word.id}">حفظ الكلمة</button>
        </article>
      `).join("")}
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

export function renderLessonPage(state) {
  const lessonId = state.activeLessonId || "eng-001";
  const lesson = getLessonById(lessons, lessonId) || lessons[0];
  const lessonWords = getLessonWords(words, lesson.id);
  const completed = isLessonCompleted(state, lesson.id);
  const quiz = getQuizByLessonId(quizzes, lesson.id);

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
      ${renderWordCards(lessonWords, lesson)}
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
        <button class="primary-button" data-action="complete-lesson" data-lesson-id="${lesson.id}">
          ${completed ? "تم إكمال الدرس ✅" : "إنهاء الدرس"}
        </button>
        <button class="ghost-button" data-route="quiz" data-lesson-id="${lesson.id}" ${quiz ? "" : "disabled"}>
          ${quiz ? "بدء الاختبار" : "لا يوجد اختبار"}
        </button>
      </div>
    </section>
  `;
}
