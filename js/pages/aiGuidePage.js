import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { buildGuideActivitySummary, buildGuideInsights, buildTodayPlan, getGuideMessage } from "../engines/aiGuideEngine.js";

const priorityLabels = {
  high: "مهم الآن",
  medium: "مناسب اليوم",
  low: "اختياري"
};

function getPriorityClass(priority) {
  if (priority === "high") return "is-open";
  if (priority === "medium") return "is-locked";
  return "";
}

function renderPlanCard(item, index) {
  return `
    <article class="guide-action-card">
      <div class="track-header">
        <h3>${index + 1}. ${item.title}</h3>
        <span class="status-badge ${getPriorityClass(item.priority)}">${priorityLabels[item.priority] || item.priority}</span>
      </div>
      <p>${item.description}</p>
      <div class="guide-reason-box">
        <strong>سبب الاقتراح</strong>
        <p>${item.reason || "هذه الخطوة مناسبة لحالتك الحالية."}</p>
      </div>
      <button class="secondary-button" data-route="${item.route}" ${item.lessonId ? `data-lesson-id="${item.lessonId}"` : ""} style="margin-top: 12px;">
        تنفيذ الخطوة
      </button>
    </article>
  `;
}

function renderInsightCard(insight) {
  return `
    <article class="stat-card">
      ${insight.label}
      <strong>${insight.value}</strong>
      <p>${insight.hint}</p>
    </article>
  `;
}

function renderActivityInsight(activity) {
  const strengthLabel = {
    none: "لم يبدأ",
    light: "خفيف",
    good: "جيد",
    excellent: "ممتاز"
  }[activity.strength] || activity.strength;

  return `
    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Activity Insight</p>
          <h2>📊 قراءة النشاط</h2>
        </div>
        <span class="status-badge ${activity.strength === "excellent" ? "is-open" : "is-locked"}">${strengthLabel}</span>
      </div>
      <p>${activity.advice}</p>
      <div class="stat-grid">
        <div class="stat-card">آخر 7 أيام<strong>${activity.weekActions}</strong></div>
        <div class="stat-card">كل النشاطات<strong>${activity.totalActions}</strong></div>
      </div>
    </section>
  `;
}

export function renderAiGuidePage(state) {
  const message = getGuideMessage(state, lessons, quizzes);
  const plan = buildTodayPlan(state, lessons, quizzes);
  const insights = buildGuideInsights(state, lessons, quizzes);
  const activity = buildGuideActivitySummary(state);
  const bestStep = plan[0] || { route: "learn" };

  return `
    <section class="premium-hero-card">
      <p class="premium-kicker">SkillBridge Guide</p>
      <h2>🤖 المساعد الذكي</h2>
      <p>${message}</p>
      <button class="primary-button" data-route="${bestStep.route}" ${bestStep.lessonId ? `data-lesson-id="${bestStep.lessonId}"` : ""}>
        🚀 نفّذ أفضل خطوة
      </button>
    </section>

    ${renderActivityInsight(activity)}

    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Daily Plan</p>
          <h2>خطة اليوم</h2>
        </div>
        <span class="status-badge is-open">${plan.length} خطوات</span>
      </div>
      <p>خطة قصيرة مبنية على الدروس، الكلمات، الاختبارات، الستريك، والتحليلات المحلية.</p>
      <div class="card-grid">
        ${plan.map(renderPlanCard).join("")}
      </div>
    </section>

    <section class="content-card">
      <h2>تشخيص سريع</h2>
      <div class="stat-grid">
        ${insights.map(renderInsightCard).join("")}
      </div>
    </section>

    <section class="content-card">
      <h2>كيف أفكر؟</h2>
      <ul class="page-list">
        <li>أقرأ نشاط آخر 7 أيام قبل اقتراح خطة اليوم.</li>
        <li>أقدم الكلمات المستحقة للمراجعة قبل الدروس الجديدة.</li>
        <li>أوازن بين الاختبارات والدروس.</li>
        <li>أجعل الخطة خفيفة عندما يكون نشاطك ممتازاً.</li>
      </ul>
    </section>
  `;
}
