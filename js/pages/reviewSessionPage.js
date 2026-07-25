import { buildReviewQueue, getReviewRecord, getReviewStatus } from "../engines/reviewEngine.js";

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
    <div class="review-rating-grid review-session-actions" aria-label="تقييم المراجعة">
      <button class="review-rating-button is-again" data-action="rate-review-session" data-word-id="${wordId}" data-rating="again">
        🔴 نسيتها
      </button>
      <button class="review-rating-button is-hard" data-action="rate-review-session" data-word-id="${wordId}" data-rating="hard">
        🟡 صعبة
      </button>
      <button class="review-rating-button is-good" data-action="rate-review-session" data-word-id="${wordId}" data-rating="good">
        🟢 جيدة
      </button>
    </div>
  `;
}

export function renderReviewSessionPage(state) {
  const fullQueue = buildReviewQueue(state, 100).filter((item) => item.status.isDue);
  const sessionIndex = Math.max(0, Number(state.reviewSessionIndex) || 0);
  const activeItem = fullQueue[0] || null;
  const completedCount = Math.max(0, Number(state.reviewSessionCompleted) || 0);
  const sessionTotal = Math.max(completedCount + fullQueue.length, Number(state.reviewSessionTotal) || 0);
  const progressPercent = sessionTotal
    ? Math.min(100, Math.round((completedCount / sessionTotal) * 100))
    : 100;

  if (!activeItem) {
    return `
      <section class="content-card review-session-card review-session-complete">
        <p class="section-label">Daily Review Session</p>
        <h2 class="page-title">🎉 أنهيت مراجعة اليوم</h2>
        <p>تمت معالجة جميع الكلمات المستحقة في هذه الجلسة.</p>
        <div class="review-progress-block">
          <div class="track-header">
            <strong>تقدم الجلسة</strong>
            <span>100%</span>
          </div>
          <div class="progress-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">
            <span style="width: 100%"></span>
          </div>
        </div>
        <div class="button-row" style="margin-top: 16px;">
          <button class="primary-button" data-route="saved">العودة إلى المحفوظات</button>
          <button class="secondary-button" data-route="learn">متابعة التعلم</button>
        </div>
      </section>
    `;
  }

  const record = getReviewRecord(state, activeItem.word.id);
  const status = getReviewStatus(record);
  const position = completedCount + 1;

  return `
    <section class="content-card review-session-card">
      <div class="track-header">
        <div>
          <p class="section-label">Daily Review Session</p>
          <h2>🧠 جلسة المراجعة اليومية</h2>
        </div>
        <span class="status-badge is-locked">${position} / ${sessionTotal || fullQueue.length}</span>
      </div>

      <div class="review-progress-block">
        <div class="track-header">
          <strong>تقدم الجلسة</strong>
          <span>${progressPercent}%</span>
        </div>
        <div class="progress-bar" aria-label="تقدم جلسة المراجعة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
          <span style="width: ${progressPercent}%"></span>
        </div>
      </div>

      <article class="review-focus-card">
        <div class="track-header">
          <strong>${activeItem.word.word}</strong>
          <span class="status-badge ${status.confidence === "strong" ? "is-open" : "is-locked"}">${getConfidenceLabel(status.confidence)}</span>
        </div>
        <p class="review-focus-translation">${activeItem.word.translation}</p>
        <p>${activeItem.word.example}</p>
        <div class="category-meta">
          <span>الدقة: ${status.accuracy}%</span>
          <span>الأولوية: ${status.priority}</span>
          <span>المراجعات: ${record.reviewCount}</span>
        </div>
      </article>

      <div class="review-session-prompt">
        <strong>هل تذكرت معنى الكلمة؟</strong>
        <p>اختر التقييم الأقرب إلى مستوى تذكرك، وسيحدد المحرك موعد المراجعة القادمة.</p>
      </div>

      ${renderReviewActions(activeItem.word.id)}

      <button class="ghost-button" data-route="saved" style="margin-top: 12px;">إنهاء الجلسة مؤقتاً</button>
    </section>
  `;
}
