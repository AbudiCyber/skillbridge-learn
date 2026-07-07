import { getGuideMessage } from "../engines/aiGuideEngine.js";

const guideActions = [
  {
    title: "اقترح الدرس التالي",
    description: "سيختار المساعد الدرس المناسب حسب تقدم المستخدم."
  },
  {
    title: "اشرح طريقة استخدام التطبيق",
    description: "رسائل قصيرة توضّح أين يبدأ المستخدم وماذا يفعل بعد ذلك."
  },
  {
    title: "راجع الكلمات المحفوظة",
    description: "لاحقاً سيقترح مراجعة الكلمات التي تحتاج تثبيتاً."
  }
];

export function renderAiGuidePage(state) {
  const message = getGuideMessage(state);

  return `
    <section class="content-card">
      <p class="section-label">SkillBridge Guide</p>
      <h2 class="page-title">🤖 المساعد</h2>
      <div class="guide-message">
        <p>${message}</p>
      </div>
    </section>

    <section class="card-grid">
      ${guideActions.map((action) => `
        <article class="guide-action-card">
          <h3>${action.title}</h3>
          <p>${action.description}</p>
        </article>
      `).join("")}
    </section>
  `;
}
