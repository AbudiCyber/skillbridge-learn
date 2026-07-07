import { lessons } from "../data/lessons.js";
import { units } from "../data/units.js";
import { getLessonsByUnit, isLessonCompleted } from "../engines/lessonEngine.js";

function renderLessonCard(lesson, state) {
  const completed = isLessonCompleted(state, lesson.id);
  const isOpen = lesson.order === 1 || completed || state.completedLessons.includes(`eng-${String(lesson.order - 1).padStart(3, "0")}`);

  return `
    <article class="lesson-card">
      <div class="lesson-card-header">
        <h3>${lesson.title}</h3>
        <span class="status-badge ${isOpen ? "is-open" : "is-locked"}">
          ${completed ? "مكتمل" : isOpen ? "مفتوح" : "مقفل"}
        </span>
      </div>
      <p>${lesson.goal}</p>
      <div class="lesson-meta">
        <span>${lesson.estimatedMinutes} دقائق</span>
        <span>+${lesson.xpReward} XP</span>
        <span>Lesson ${lesson.order}</span>
      </div>
      <button class="${isOpen ? "primary-button" : "secondary-button"}" data-route="lesson" data-lesson-id="${lesson.id}" ${isOpen ? "" : "disabled"} style="margin-top: 12px;">
        ${completed ? "مراجعة الدرس" : isOpen ? "فتح الدرس" : "مقفل حالياً"}
      </button>
    </article>
  `;
}

function renderUnit(unit, state) {
  const unitLessons = getLessonsByUnit(lessons, unit.id);

  return `
    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Unit ${unit.order}</p>
          <h2>${unit.title}</h2>
        </div>
        <span class="status-badge ${unit.isLocked ? "is-locked" : "is-open"}">${unit.isLocked ? "مقفل تدريجياً" : "مفتوح"}</span>
      </div>
      <p>${unit.description}</p>
      <div class="card-grid">
        ${unitLessons.map((lesson) => renderLessonCard(lesson, state)).join("")}
      </div>
    </section>
  `;
}

export function renderLearnPage(state) {
  return `
    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Active Track</p>
          <h2 class="page-title">📚 English for Beginners</h2>
        </div>
        <span class="status-badge is-open">V1</span>
      </div>
      <p>مسار قصير للمبتدئين العرب: دروس صغيرة، كلمات، أمثلة، واختبارات بسيطة.</p>
    </section>

    ${units.map((unit) => renderUnit(unit, state)).join("")}
  `;
}
