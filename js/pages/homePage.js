import { achievements } from "../data/achievements.js";
import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { getUnlockedAchievements } from "../engines/achievementEngine.js";
import { buildProgressSummary } from "../engines/progressEngine.js";
import { getStreakMessage } from "../engines/streakEngine.js";
import { createTranslator } from "../i18n/i18n.js";

export function renderHomePage(state) {
  const t = createTranslator(state.uiLanguage);
  const summary = buildProgressSummary(state, {
    lessons: lessons.length,
    quizzes: quizzes.length
  });
  const unlockedAchievements = getUnlockedAchievements(achievements, state);

  return `
    <section class="hero-card">
      <p class="section-label">${t("guideLabel")}</p>
      <h2>${t("welcomeTitle")}</h2>
      <p>${t("welcomeText")}</p>
      <div class="button-row">
        <button class="primary-button" data-route="learn">${t("startLearning")}</button>
        <button class="ghost-button" data-route="guide">${t("askGuide")}</button>
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
