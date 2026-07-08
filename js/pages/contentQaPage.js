import { ROUTES } from "../constants.js";
import { CACHE_PREFIX, CACHE_VERSION, APP_VERSION } from "../config/appMeta.js";
import { CORE_ASSETS, REQUIRED_ASSETS, REQUIRED_ENGINES, ROUTE_PAGES } from "../config/appShellAssets.js";
import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { units } from "../data/units.js";
import { vocabularySections } from "../data/vocabularySections.js";
import { words } from "../data/words.js";
import { runContentQA } from "../engines/contentQaEngine.js";
import { runRuntimeQA } from "../engines/runtimeQaEngine.js";

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
    routePages: ROUTE_PAGES,
    appShellAssets: CORE_ASSETS,
    requiredAssets: REQUIRED_ASSETS,
    requiredEngines: REQUIRED_ENGINES,
    appVersion: APP_VERSION,
    cacheVersion: CACHE_VERSION,
    cachePrefix: CACHE_PREFIX
  });
  const runtimeReport = runRuntimeQA({ routes: ROUTES, lessons, vocabularySections });
  const failedChecks = report.checks.filter((check) => check.status === "fail");
  const failedRuntimeChecks = runtimeReport.checks.filter((check) => check.status === "fail");
  const finalStatus = report.status === "pass" && runtimeReport.status === "pass" ? "pass" : "fail";

  return `
    <section class="content-card">
      <button class="ghost-button inline-back-button" data-route="settings">← الرجوع إلى الإعدادات</button>
      <p class="section-label" style="margin-top: 14px;">Content QA</p>
      <h2 class="page-title">🧪 فحص تناسق المحتوى</h2>
      <p>هذا التقرير يفحص الدروس، الكلمات، الاختبارات، المسارات، ملفات الصفحات، ملفات العمل دون اتصال، وحالات التشغيل الطرفية.</p>
      <span class="status-badge ${finalStatus === "pass" ? "is-open" : "is-locked"}">
        ${finalStatus === "pass" ? "All checks passed" : "Needs review"}
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
        <div class="stat-card">Content QA<strong>${report.totals.passed}/${report.totals.checks}</strong></div>
        <div class="stat-card">Runtime QA<strong>${runtimeReport.totals.passed}/${runtimeReport.totals.checks}</strong></div>
      </div>
    </section>

    ${failedChecks.length || failedRuntimeChecks.length
      ? `
        <section class="content-card">
          <h2>⚠️ يحتاج مراجعة</h2>
          <div class="card-grid">
            ${[...failedChecks, ...failedRuntimeChecks].map(renderCheck).join("")}
          </div>
        </section>
      `
      : `
        <section class="content-card">
          <div class="empty-state">
            <h3>كل الفحوصات ناجحة ✅</h3>
            <p>المحتوى، المسارات، ملفات offline، وحالات التشغيل الطرفية متناسقة حالياً.</p>
          </div>
        </section>
      `
    }

    <section class="content-card">
      <h2>Runtime QA</h2>
      <p>فحص لحالات مثل route غير معروف، lessonId غير موجود، sectionId غير موجود، وpayload غير مناسب.</p>
      <div class="card-grid">
        ${runtimeReport.checks.map(renderCheck).join("")}
      </div>
    </section>

    <section class="content-card">
      <h2>نتائج الفحص الكامل</h2>
      <div class="card-grid">
        ${report.checks.map(renderCheck).join("")}
      </div>
    </section>
  `;
}
