import { formatReviewDate, getReviewRecord, getSavedWordsReviewSummary } from "../engines/reviewEngine.js";

function renderSavedWordCard(word, state) {
  const review = getReviewRecord(state, word.id);
  const confidenceLabel = {
    new: "جديدة",
    learning: "قيد التعلم",
    strong: "قوية"
  }[review.confidence] || review.confidence;

  return `
    <article class="feature-card">
      <div class="track-header">
        <strong>${word.word} = ${word.translation}</strong>
        <span class="status-badge ${review.confidence === "strong" ? "is-open" : "is-locked"}">${confidenceLabel}</span>
      </div>
      <p>${word.example}</p>
      <div class="category-meta">
        <span>Reviews: ${review.reviewCount}</span>
        <span>Last: ${formatReviewDate(review.lastReviewedAt)}</span>
      </div>
      <button class="primary-button" data-action="review-word" data-word-id="${word.id}" style="margin-top: 12px;">
        راجعت هذه الكلمة
      </button>
    </article>
  `;
}

export function renderSavedPage(state) {
  const savedWords = state.savedWords || [];
  const summary = getSavedWordsReviewSummary(state);

  return `
    <section class="content-card">
      <p class="section-label">Saved Review</p>
      <h2 class="page-title">⭐ مراجعة المحفوظات</h2>
      <p>الكلمات المحفوظة أصبحت مركز مراجعة بسيط. كل مراجعة تزيد قوة الكلمة تدريجياً.</p>
    </section>

    <section class="content-card">
      <h2>ملخص المراجعة</h2>
      <div class="stat-grid">
        <div class="stat-card">Saved<strong>${summary.totalSaved}</strong></div>
        <div class="stat-card">Reviewed<strong>${summary.reviewed}</strong></div>
        <div class="stat-card">Pending<strong>${summary.pending}</strong></div>
        <div class="stat-card">Strong<strong>${summary.strong}</strong></div>
      </div>
    </section>

    <section class="content-card">
      ${savedWords.length === 0
        ? `
          <div class="empty-state">
            <h3>لا توجد كلمات محفوظة بعد</h3>
            <p>افتح أي درس أو قسم مفردات، ثم اضغط حفظ الكلمة داخل Word Cards.</p>
          </div>
        `
        : `
          <div class="saved-word-preview">
            ${savedWords.map((word) => renderSavedWordCard(word, state)).join("")}
          </div>
        `
      }
    </section>
  `;
}
