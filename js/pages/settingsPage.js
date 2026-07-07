import { createTranslator, normalizeLanguage } from "../i18n/i18n.js";

export function renderSettingsPage(state) {
  const language = normalizeLanguage(state.uiLanguage);
  const t = createTranslator(language);

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
      <ul class="page-list">
        <li>🎯 ${t("learningGoal")} — ${t("comingSoon")}</li>
        <li>🌙 ${t("theme")} — ${t("comingSoon")}</li>
      </ul>
    </section>
  `;
}
