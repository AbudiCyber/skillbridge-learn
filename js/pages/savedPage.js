import { buildReviewQueue, formatReviewDate, getReviewRecord, getReviewStatus, getSavedWordsReviewSummary } from "../engines/reviewEngine.js";

const confidenceLabels = {
  new: "جديدة",
  weak: "ضعيفة",
  learning: "قيد التعلم",
  strong: "قوية"
};

function getConfidenceLabel(confidence) {
  return confidenceLabels[confidence] || confidence;
}

function renderReviewActions(wordId) {
  return `
    <div class="review-rating-grid" aria-label="تقييم المراجعة">
      <button class="review-rating-button is-again" data-action="rate-review" data-word-id="${wordId}" data-rating="again">
        🔴 نسيتها
      </button>
      <button class="review-rating-button is-hard" data-action="rate-review" data-word-id="${wordId}" data-rating="hard">
        🟡 صعبة
      </button>
      <button class="review-rating-button is-good" data-action="rate-review" data-word-id="${wordId}" data-rating="good">
        🟢 جيدة
      </button>
    </div>
  `;
}

function renderSavedWordCard(word, state) {
  const review = getReviewRecord(state, word.id);
  const status = getReviewStatus(review);
  const confidenceLabel = getConfidenceLabel(status.confidence);

  return `
    <article class="feature-card review-card ${status.isDue ? "is-due" : ""}">
      <div class="track-header">
        <strong>${word.word} = ${word.translation}</strong>
        <span class="status-badge ${status.confidence === "strong" ? "is-open" : "is-locked"}">${confidenceLabel}</span>
      </div>
      <p>${word.example}</p>
      <div class="category-meta">
        <span>المراجعات: ${review.reviewCount}</span>
        <span>الصحيحة: ${review.correctCount}</span>
        <span>الخاطئة: ${review.wrongCount}</span>
        <span>آخر مراجعة: ${formatReviewDate(review.lastReviewedAt)}</span>
        <span>القادمة: ${status.nextReviewHint}</span>
      </div>
      ${renderReviewActions(word.id)}
    </article>
  `;
}

function renderQueueCard(item) {
  const confidenceLabel = getConfidenceLabel(item.status.confidence);

  return `
    <article class="feature-card review-card is-due">
      <div class="track-header">
        <strong>${item.word.word}</strong>
        <span class="status-badge ${item.status.confidence === "strong" ? "is-open" : "is-locked"}">${confidenceLabel}</span>
      </div>
      <p>${item.word.translation} — ${item.word.example}</p>
      <div class="category-meta">
        <span>الأولوية: ${item.status.priority}</span>
        <span>المراجعات: ${item.record.reviewCount}</span>
        <span>القادمة: ${item.status.nextReviewHint}</span>
      </div>
      ${renderReviewActions(item.word.id)}
    </article>
  `;
}

function renderQueueContent(savedWords, reviewQueue) {
  if (!savedWords.length) {
    return `
      <div class="empty-state">
        <h3>لا توجد كلمات محفوظة بعد</h3>
        <p>افتح أي درس أو قسم مفردات، ثم اضغط حفظ الكلمة داخل Word Cards.</p>
        <button class="secondary-button" data-route="learn" style="margin-top: 12px;">اذهب إلى الدروس</button>
      </div>
    `;
  }

  if (!reviewQueue.length) {
    return `
      <div class="empty-state">
        <h3>لا توجد كلمات عاجلة اليوم ✅</h3>
        <p>يمكنك مراجعة خفيفة من القائمة الكاملة أو إضافة كلمات جديدة من المكتبة.</p>
        <button class="secondary-button" data-route="library" style="margin-top: 12px;">فتح المكتبة</button>
      </div>
    `;
  }

  return `<div class="saved-word-preview">${reviewQueue.map(renderQueueCard).join("")}</div>`;
}

export function renderSavedPage(state) {
  const savedWords = state.savedWords || [];
  const summary = getSavedWordsReviewSummary(state);
  const reviewQueue = buildReviewQueue(state, 5).filter((item) => item.status.isDue);

  return `
    <section class="content-card">
      <p class="section-label">Saved Review</p>
      <h2 class="page-title">⭐ مراجعة المحفوظات</h2>
      <p>قيّم كل كلمة حسب صعوبتها، وسيحسب SkillBridge موعد المراجعة القادمة تلقائياً.</p>
    </section>

    <section class="content-card">
      <h2>ملخص المراجعة</h2>
      <div class="stat-grid">
        <div class="stat-card">Saved<strong>${summary.totalSaved}</strong></div>
        <div class="stat-card">Due<strong>${summary.due}</strong></div>
        <div class="stat-card">Weak<strong>${summary.weak}</strong></div>
        <div class="stat-card">Strong<strong>${summary.strong}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Review Queue</p>
          <h2>🔁 الكلمات المقترحة للمراجعة</h2>
        </div>
        <span class="status-badge ${reviewQueue.length ? "is-locked" : "is-open"}">${reviewQueue.length ? `Due ${reviewQueue.length}` : "Clear"}</span>
      </div>
      ${renderQueueContent(savedWords, reviewQueue)}
    </section>

    <section class="content-card">
      <h2>كل الكلمات المحفوظة</h2>
      ${savedWords.length === 0
        ? `<p class="empty-state">لا توجد كلمات محفوظة بعد.</p>`
        : `<div class="saved-word-preview">${savedWords.map((word) => renderSavedWordCard(word, state)).join("")}</div>`
      }
    </section>
  `;
}
