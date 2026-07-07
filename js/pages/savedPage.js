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
            <p>عندما تظهر Word Cards داخل الدروس، سيتمكن المستخدم من حفظ الكلمات هنا.</p>
          </div>
        `
        : `
          <div class="saved-word-preview">
            ${savedWords.map((word) => `
              <article class="feature-card">
                <strong>${word}</strong>
                <p>سيظهر هنا الترجمة والمثال وعدد مرات المراجعة.</p>
              </article>
            `).join("")}
          </div>
        `
      }
    </section>
  `;
}
