import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { buildGuideInsights, buildTodayPlan, getGuideMessage } from "../engines/aiGuideEngine.js";

function renderPlanCard(item) {
  return `
    <article class="guide-action-card">
      <div class="track-header">
        <h3>${item.title}</h3>
        <span class="status-badge ${item.priority === "high" ? "is-open" : "is-locked"}">${item.priority}</span>
      </div>
      <p>${item.description}</p>
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

export function renderAiGuidePage(state) {
  const message = getGuideMessage(state, lessons, quizzes);
  const plan = buildTodayPlan(state, lessons, quizzes);
  const insights = buildGuideInsights(state, lessons, quizzes);

  return `
    <section class="content-card">
      <p class="section-label">SkillBridge Guide</p>
      <h2 class="page-title">🤖 المساعد الذكي</h2>
      <div class="guide-message">
        <p>${message}</p>
      </div>
    </section>

    <section class="content-card">
      <h2>خطة اليوم</h2>
      <p>خطة قصيرة مبنية على الدروس، الكلمات المحفوظة، الاختبارات، والستريك.</p>
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
        <li>أقترح الدرس التالي إذا كان هناك درس غير مكتمل.</li>
        <li>أقدم مراجعة الكلمات إذا وجدت كلمات محفوظة غير مراجعة.</li>
        <li>أدفع المستخدم للاختبار إذا كان الدرس الحالي لديه اختبار غير مكتمل.</li>
        <li>أراقب XP والستريك حتى تبقى الخطة خفيفة ومستمرة.</li>
      </ul>
    </section>
  `;
}
