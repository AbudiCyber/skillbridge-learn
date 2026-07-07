export function renderSavedPage(state) {
  const savedWords = state.savedWords || [];

  return `
    <section class="content-card">
      <p class="section-label">Saved Library</p>
      <h2 class="page-title">⭐ المحفوظات</h2>
      <p>الكلمات التي يحفظها المستخدم ستصبح مركز المراجعة اليومية لاحقاً.</p>
    </section>

    <section class="content-card">
      ${savedWords.length === 0
        ? `
          <div class="empty-state">
            <h3>لا توجد كلمات محفوظة بعد</h3>
            <p>افتح أي درس، ثم اضغط حفظ الكلمة داخل Word Cards.</p>
          </div>
        `
        : `
          <div class="saved-word-preview">
            ${savedWords.map((word) => `
              <article class="feature-card">
                <strong>${word.word} = ${word.translation}</strong>
                <p>${word.example}</p>
              </article>
            `).join("")}
          </div>
        `
      }
    </section>
  `;
}
