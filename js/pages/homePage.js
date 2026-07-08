import { achievements } from "../data/achievements.js";
import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { buildAnalyticsSummary } from "../engines/analyticsEngine.js";
import { getUnlockedAchievements } from "../engines/achievementEngine.js";
import { buildProgressSummary } from "../engines/progressEngine.js";
import { buildReviewQueue } from "../engines/reviewEngine.js";
import { getStreakMessage } from "../engines/streakEngine.js";
import { createTranslator } from "../i18n/i18n.js";

function getNextLesson(state) {
  const completedLessons = state.completedLessons || [];
  return lessons
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((lesson) => !completedLessons.includes(lesson.id)) || lessons[0];
}

function renderPremiumStat(label, value) {
  return `
    <article class="premium-stat-card">
      <strong>${value}</strong>
      <span>${label}</span>
    </article>
  `;
}

export function renderHomePage(state) {
  const t = createTranslator(state.uiLanguage);
  const summary = buildProgressSummary(state, {
    lessons: lessons.length,
    quizzes: quizzes.length
  });
  const analytics = buildAnalyticsSummary(state);
  const unlockedAchievements = getUnlockedAchievements(achievements, state);
  const reviewQueue = buildReviewQueue(state, 3).filter((item) => item.status.isDue);
  const nextLesson = getNextLesson(state);

  return `
    <section class="premium-hero-card">
      <p class="premium-kicker">◎ SkillBridge Learn</p>
      <h2>جسر صغير كل يوم نحو الإنجليزية</h2>
      <p>خطة يومية قصيرة: راجع كلماتك، أكمل درساً، ثم ثبّت تقدمك باختبار صغير.</p>
      <div class="premium-stat-grid">
        ${renderPremiumStat("الدروس", `${summary.completedLessons}/${lessons.length}`)}
        ${renderPremiumStat("الكلمات", summary.savedWords)}
        ${renderPremiumStat("مراجعة اليوم", reviewQueue.length)}
        ${renderPremiumStat("XP", summary.points)}
      </div>
      <div class="premium-action-card">
        <div>
          <span>خطة اليوم</span>
          <strong>${reviewQueue.length ? "ابدأ بالمراجعة" : nextLesson.title}</strong>
          <p>${reviewQueue.length ? `لديك ${reviewQueue.length} كلمات تحتاج تثبيتاً قبل الدرس.` : `الدرس التالي يستغرق ${nextLesson.estimatedMinutes} دقائق تقريباً.`}</p>
        </div>
        <button class="primary-button" data-route="${reviewQueue.length ? "saved" : "lesson"}" ${reviewQueue.length ? "" : `data-lesson-id="${nextLesson.id}"`}>
          🚀 ابدأ الآن
        </button>
      </div>
    </section>

    <section class="content-card">
      <div class="track-header">
        <h2>🔥 Daily Streak</h2>
        <span class="status-badge is-open">${state.streak || 0} days</span>
      </div>
      <p>${getStreakMessage(state)}</p>
      <div class="stat-grid">
        <div class="stat-card">Current<strong>${state.streak || 0}</strong></div>
        <div class="stat-card">Best<strong>${state.bestStreak || 0}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <div class="track-header">
        <h2>📊 نشاطك</h2>
        <span class="status-badge is-open">7 days</span>
      </div>
      <p>تحليلات محلية خفيفة من جهازك فقط.</p>
      <div class="stat-grid">
        <div class="stat-card">Actions<strong>${analytics.totalActions}</strong></div>
        <div class="stat-card">Best Day<strong>${analytics.bestDay?.count || 0}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <div class="track-header">
        <h2>🏆 Achievements</h2>
        <span class="status-badge is-open">${unlockedAchievements.length}/${achievements.length}</span>
      </div>
      <p>افتح الإنجازات عبر التعلم، الاختبارات، حفظ الكلمات، والمراجعة اليومية.</p>
      <button class="secondary-button" data-route="progress">عرض الإنجازات</button>
    </section>

    <section class="content-card">
      <div class="track-header">
        <h2>${t("todayLesson")}</h2>
        <span class="status-badge is-open">${t("open")}</span>
      </div>
      <p>${t("todayLessonText")}</p>
      <button class="secondary-button" data-route="learn">${t("viewTrack")}</button>
    </section>

    <section class="content-card">
      <h2>${t("progressSummary")}</h2>
      <div class="progress-bar" aria-label="Progress"><span style="width: ${summary.lessonProgressPercent}%"></span></div>
      <div class="stat-grid" style="margin-top: 14px;">
        <div class="stat-card">XP<strong>${summary.points}</strong></div>
        <div class="stat-card">Level<strong>${summary.level.title}</strong></div>
        <div class="stat-card">${t("lessons")}<strong>${summary.completedLessons}/${lessons.length}</strong></div>
        <div class="stat-card">Quizzes<strong>${summary.completedQuizzes}/${quizzes.length}</strong></div>
      </div>
    </section>
  `;
}
