import { learningGoals } from "../data/learningGoals.js";
import { createTranslator, normalizeLanguage } from "../i18n/i18n.js";

function renderGoalCard(goal, selectedGoal) {
  const isSelected = selectedGoal === goal.id;

  return `
    <article class="feature-card">
      <div class="track-header">
        <h3>${goal.icon} ${goal.arabicTitle}</h3>
        <span class="status-badge ${isSelected ? "is-open" : "is-locked"}">${isSelected ? "محدد" : "اختياري"}</span>
      </div>
      <p>${goal.arabicDescription}</p>
      <button class="${isSelected ? "primary-button" : "ghost-button"}" data-action="set-goal" data-goal-id="${goal.id}" style="margin-top: 12px;">
        ${isSelected ? "الهدف الحالي" : "اختيار الهدف"}
      </button>
    </article>
  `;
}

export function renderSettingsPage(state) {
  const language = normalizeLanguage(state.uiLanguage);
  const t = createTranslator(language);
  const selectedGoal = state.selectedGoal || "daily-lesson";
  const resetArmed = Boolean(state.resetConfirmArmed);

  return `
    <section class="content-card">
      <h2 class="page-title">${t("settingsTitle")}</h2>
      <p>${t("settingsDescription")}</p>
    </section>

    <section class="content-card">
      <p class="section-label">Localization</p>
      <h2>${t("languageTitle")}</h2>
      <p>${t("languageDescription")}</p>
      <div class="button-row">
        <button class="${language === "ar" ? "primary-button" : "ghost-button"}" data-action="set-language" data-language="ar">
          ${t("arabic")}
        </button>
        <button class="${language === "en" ? "primary-button" : "ghost-button"}" data-action="set-language" data-language="en">
          ${t("english")}
        </button>
      </div>
      <p style="margin-top: 14px;">${t("currentLanguage")}: <strong>${language.toUpperCase()}</strong></p>
    </section>

    <section class="content-card">
      <p class="section-label">Learning Goal</p>
      <h2>🎯 هدف التعلم</h2>
      <p>اختر هدفاً رئيسياً حتى يستطيع المساعد لاحقاً ترتيب الخطة اليومية بناءً عليه.</p>
      <div class="card-grid">
        ${learningGoals.map((goal) => renderGoalCard(goal, selectedGoal)).join("")}
      </div>
    </section>

    <section class="content-card">
      <p class="section-label">Theme</p>
      <h2>🌙 الثيم</h2>
      <p>الوضع الداكن مفعل حالياً كخيار أساسي للنسخة الأولى.</p>
      <div class="stat-grid">
        <div class="stat-card">Mode<strong>${state.themeMode || "dark"}</strong></div>
        <div class="stat-card">Version<strong>V1</strong></div>
      </div>
    </section>

    <section class="content-card">
      <p class="section-label">Danger Zone</p>
      <h2>🧹 إعادة التقدم</h2>
      <p>هذه العملية تحذف XP والدروس والاختبارات والكلمات والمراجعات، لكنها تبقي اللغة والهدف الحالي.</p>
      <button class="${resetArmed ? "primary-button" : "ghost-button"}" data-action="reset-progress">
        ${resetArmed ? "تأكيد حذف التقدم" : "إعادة التقدم"}
      </button>
      ${resetArmed ? `<p style="margin-top: 12px;">اضغط مرة ثانية للتأكيد. لا يمكن التراجع بعد الحذف.</p>` : ""}
    </section>

    <section class="content-card">
      <p class="section-label">App Info</p>
      <h2>ℹ️ معلومات التطبيق</h2>
      <ul class="page-list">
        <li>SkillBridge Learn — Small lessons. Real progress.</li>
        <li>Storage — LocalStorage على هذا الجهاز.</li>
        <li>Mode — PWA / Mobile-first.</li>
      </ul>
    </section>
  `;
}
