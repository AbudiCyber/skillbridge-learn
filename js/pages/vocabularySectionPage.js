import { vocabularySections } from "../data/vocabularySections.js";
import { words } from "../data/words.js";
import { getVocabularySectionById, getWordsBySection } from "../engines/vocabularyEngine.js";

function isWordSaved(state, wordId) {
  return (state.savedWords || []).some((word) => word.id === wordId);
}

function renderSaveButton(word, state) {
  const saved = isWordSaved(state, word.id);

  return `
    <button class="${saved ? "secondary-button" : "ghost-button"}" data-action="save-word" data-word-id="${word.id}" ${saved ? "disabled" : ""}>
      ${saved ? "محفوظة بالفعل ✅" : "حفظ الكلمة"}
    </button>
  `;
}

function renderSectionWords(sectionWords, state) {
  if (!sectionWords.length) {
    return `
      <div class="empty-state">
        <h3>لا توجد كلمات في هذا القسم بعد</h3>
        <p>هذا القسم جاهز في المعمارية، وسيتم ملؤه تدريجياً في الإصدارات القادمة.</p>
      </div>
    `;
  }

  return `
    <div class="word-grid">
      ${sectionWords.map((word) => {
        const saved = isWordSaved(state, word.id);

        return `
          <article class="word-card ${saved ? "is-saved" : ""}">
            <div>
              <strong>${word.word}</strong>
              <span>${word.translation}</span>
            </div>
            <p>${word.example}</p>
            <div class="category-meta">
              <span>${word.category}</span>
              <span>${word.difficulty}</span>
              ${saved ? "<span>saved</span>" : ""}
            </div>
            ${renderSaveButton(word, state)}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

export function renderVocabularySectionPage(state) {
  const sectionId = state.activeVocabularySectionId || "school-vocabulary";
  const section = getVocabularySectionById(vocabularySections, sectionId) || vocabularySections[0];
  const sectionWords = getWordsBySection(words, section.id);

  return `
    <section class="content-card">
      <button class="ghost-button inline-back-button" data-route="library">← الرجوع إلى المكتبة</button>
      <div class="track-header" style="margin-top: 14px;">
        <div>
          <p class="section-label">Vocabulary Section</p>
          <h2 class="page-title">${section.icon} ${section.arabicTitle}</h2>
        </div>
        <span class="status-badge ${section.status === "active" ? "is-open" : "is-locked"}">${section.status}</span>
      </div>
      <p>${section.description}</p>
    </section>

    <section class="content-card">
      <h2>الكلمات داخل القسم</h2>
      <p>${sectionWords.length} كلمة مرتبطة بهذا القسم.</p>
      ${renderSectionWords(sectionWords, state)}
    </section>
  `;
}
