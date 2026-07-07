export function renderSavedPage(state) {
  const savedWords = state.savedWords || [];

  return `
    <section class="content-card">
      <h2 class="page-title">⭐ المحفوظات</h2>
      <p>هنا ستظهر الكلمات والجمل التي يحفظها المستخدم للمراجعة لاحقاً.</p>
      ${savedWords.length === 0
        ? `<p class="empty-state">لم تحفظ أي كلمات بعد.</p>`
        : `<ul class="page-list">${savedWords.map((word) => `<li>${word}</li>`).join("")}</ul>`
      }
    </section>
  `;
}
