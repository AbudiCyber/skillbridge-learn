import { createTranslator } from "../i18n/i18n.js";

export function renderHomePage(state) {
  const t = createTranslator(state.uiLanguage);
  const completedCount = state.completedLessons.length;
  const savedCount = state.savedWords.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 10) * 100));

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
        <h2>${t("todayLesson")}</h2>
        <span class="status-badge is-open">${t("open")}</span>
      </div>
      <p>${t("todayLessonText")}</p>
      <button class="secondary-button" data-route="learn">${t("viewTrack")}</button>
    </section>

    <section class="content-card">
      <h2>${t("progressSummary")}</h2>
      <div class="progress-bar" aria-label="Progress"><span style="width: ${progressPercent}%"></span></div>
      <div class="stat-grid" style="margin-top: 14px;">
        <div class="stat-card">XP<strong>${state.xp}</strong></div>
        <div class="stat-card">Streak<strong>${state.streak}</strong></div>
        <div class="stat-card">${t("lessons")}<strong>${completedCount}/10</strong></div>
        <div class="stat-card">${t("saved")}<strong>${savedCount}</strong></div>
      </div>
    </section>
  `;
}
