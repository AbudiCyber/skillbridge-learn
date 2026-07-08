import { ROUTES } from "../constants.js";
import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { units } from "../data/units.js";
import { vocabularySections } from "../data/vocabularySections.js";
import { words } from "../data/words.js";
import { runContentQA } from "../engines/contentQaEngine.js";

const routePages = {
  [ROUTES.HOME]: "./js/pages/homePage.js",
  [ROUTES.LEARN]: "./js/pages/learnPage.js",
  [ROUTES.LESSON]: "./js/pages/lessonPage.js",
  [ROUTES.TEST]: "./js/pages/quizPage.js",
  [ROUTES.LIBRARY]: "./js/pages/libraryPage.js",
  [ROUTES.VOCABULARY_SECTION]: "./js/pages/vocabularySectionPage.js",
  [ROUTES.PROGRESS]: "./js/pages/progressPage.js",
  [ROUTES.SAVED]: "./js/pages/savedPage.js",
  [ROUTES.GUIDE]: "./js/pages/aiGuidePage.js",
  [ROUTES.SETTINGS]: "./js/pages/settingsPage.js",
  [ROUTES.CONTENT_QA]: "./js/pages/contentQaPage.js"
};

const requiredEngines = [
  "./js/engines/analyticsEngine.js",
  "./js/engines/lessonEngine.js",
  "./js/engines/quizEngine.js",
  "./js/engines/xpEngine.js",
  "./js/engines/vocabularyEngine.js",
  "./js/engines/reviewEngine.js",
  "./js/engines/streakEngine.js",
  "./js/engines/achievementEngine.js",
  "./js/engines/aiGuideEngine.js",
  "./js/engines/contentQaEngine.js"
];

const appShellAssets = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icons/icon.svg",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/pages.css",
  "./css/themes.css",
  "./js/app.js",
  "./js/constants.js",
  "./js/router.js",
  "./js/state.js",
  "./js/storage.js",
  "./js/ui.js",
  "./js/i18n/i18n.js",
  "./js/i18n/translations.js",
  ...Object.values(routePages),
  ...requiredEngines,
  "./js/data/achievements.js",
  "./js/data/learningGoals.js",
  "./js/data/lessons.js",
  "./js/data/quizzes.js",
  "./js/data/tracks.js",
  "./js/data/units.js",
  "./js/data/words.js",
  "./js/data/vocabularySections.js"
];

const requiredAssets = [
  "./index.html",
  "./manifest.json",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./js/app.js",
  "./js/constants.js",
  "./js/router.js",
  "./js/state.js"
];

function renderCheck(check) {
  const passed = check.status === "pass";
  const details = Array.isArray(check.details) && check.details.length
    ? check.details.join(", ")
    : "No issues";

  return `
    <article class="feature-card">
      <div class="track-header">
        <h3>${passed ? "✅" : "⚠️"} ${check.title}</h3>
        <span class="status-badge ${passed ? "is-open" : "is-locked"}">${check.status}</span>
      </div>
      <p>${details}</p>
    </article>
  `;
}

export function renderContentQaPage() {
  const report = runContentQA({
    lessons,
    units,
    words,
    quizzes,
    vocabularySections,
    routes: ROUTES,
    routePages,
    appShellAssets,
    requiredAssets,
    requiredEngines
  });
  const failedChecks = report.checks.filter((check) => check.status === "fail");

  return `
    <section class="content-card">
      <button class="ghost-button inline-back-button" data-route="settings">← الرجوع إلى الإعدادات</button>
      <p class="section-label" style="margin-top: 14px;">Content QA</p>
      <h2 class="page-title">🧪 فحص تناسق المحتوى</h2>
      <p>هذا التقرير يفحص الدروس، الكلمات، الاختبارات، المسارات، ملفات الصفحات، وملفات العمل دون اتصال.</p>
      <span class="status-badge ${report.status === "pass" ? "is-open" : "is-locked"}">
        ${report.status === "pass" ? "All checks passed" : "Needs review"}
      </span>
    </section>

    <section class="content-card">
      <h2>ملخص المحتوى</h2>
      <div class="stat-grid">
        <div class="stat-card">Lessons<strong>${report.totals.lessons}</strong></div>
        <div class="stat-card">Units<strong>${report.totals.units}</strong></div>
        <div class="stat-card">Words<strong>${report.totals.words}</strong></div>
        <div class="stat-card">Quizzes<strong>${report.totals.quizzes}</strong></div>
        <div class="stat-card">Routes<strong>${report.totals.routes}</strong></div>
        <div class="stat-card">Assets<strong>${report.totals.appShellAssets}</strong></div>
        <div class="stat-card">Passed<strong>${report.totals.passed}/${report.totals.checks}</strong></div>
        <div class="stat-card">Failed<strong>${report.totals.failed}</strong></div>
      </div>
    </section>

    ${failedChecks.length
      ? `
        <section class="content-card">
          <h2>⚠️ يحتاج مراجعة</h2>
          <div class="card-grid">
            ${failedChecks.map(renderCheck).join("")}
          </div>
        </section>
      `
      : `
        <section class="content-card">
          <div class="empty-state">
            <h3>كل الفحوصات ناجحة ✅</h3>
            <p>المحتوى والمسارات وملفات العمل دون اتصال متناسقة حالياً.</p>
          </div>
        </section>
      `
    }

    <section class="content-card">
      <h2>نتائج الفحص الكامل</h2>
      <div class="card-grid">
        ${report.checks.map(renderCheck).join("")}
      </div>
    </section>
  `;
}
