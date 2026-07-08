import { vocabularySections } from "../data/vocabularySections.js";
import { words } from "../data/words.js";
import { buildVocabularySectionSummary } from "../engines/vocabularyEngine.js";

const statusLabels = {
  active: "متاح",
  planned: "مخطط",
  future: "مستقبلي"
};

function renderSectionCard(section) {
  const statusClass = section.status === "active" ? "is-open" : "is-locked";
  const canOpen = section.status === "active" || section.wordCount > 0;

  return `
    <article class="category-card">
      <div class="category-card-header">
        <h3>${section.icon} ${section.arabicTitle}</h3>
        <span class="status-badge ${statusClass}">${statusLabels[section.status] || section.status}</span>
      </div>
      <p>${section.description}</p>
      <div class="category-meta">
        <span>${section.title}</span>
        <span>${section.wordCount} كلمات</span>
        <span>${section.group}</span>
      </div>
      <button class="${canOpen ? "primary-button" : "secondary-button"}" data-route="vocabulary-section" data-section-id="${section.id}" ${canOpen ? "" : "disabled"} style="margin-top: 12px;">
        ${canOpen ? "فتح القسم" : "قريباً"}
      </button>
    </article>
  `;
}

function renderSectionGroup(title, sections) {
  if (!sections.length) return "";

  return `
    <section class="content-card">
      <h2>${title}</h2>
      <div class="card-grid">
        ${sections.map(renderSectionCard).join("")}
      </div>
    </section>
  `;
}

export function renderLibraryPage() {
  const summaries = vocabularySections
    .map((section) => buildVocabularySectionSummary(section, words))
    .sort((a, b) => a.order - b.order);

  const activeSections = summaries.filter((section) => section.status === "active");
  const plannedSections = summaries.filter((section) => section.status === "planned");
  const futureSections = summaries.filter((section) => section.status === "future");

  return `
    <section class="content-card">
      <p class="section-label">Vocabulary Library</p>
      <h2 class="page-title">🗂️ مكتبة المفردات</h2>
      <p>المفردات الآن منظمة داخل أقسام واضحة حتى يتعلم المستخدم كلمات مترابطة، وليس كلمات عشوائية.</p>
    </section>

    ${renderSectionGroup("الأقسام المتاحة", activeSections)}
    ${renderSectionGroup("الأقسام المخطط لها", plannedSections)}
    ${renderSectionGroup("الأقسام المستقبلية", futureSections)}
  `;
}
