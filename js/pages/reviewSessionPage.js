import { getReviewRecord, getReviewStatus } from "../engines/reviewEngine.js";
import { getReviewSessionSnapshot } from "../engines/reviewSessionEngine.js";

const confidenceLabels = {
  new: "جديدة",
  weak: "ضعيفة",
  learning: "قيد التعلم",
  strong: "قوية"
};

const ratingLabels = {
  again: "نسيتها",
  hard: "صعبة",
  good: "جيدة"
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

function getSessionResultSummary(results = []) {
  return results.reduce((summary, result) => {
    if (result?.rating in summary) summary[result.rating] += 1;
    return summary;
  }, { again: 0, hard: 0, good: 0 });
}

function renderSessionResults(state, snapshot) {
  const results = Array.isArray(state.reviewSessionResults) ? state.reviewSessionResults : [];
  const counts = getSessionResultSummary(results);
  const successfulCount = counts.good + counts.hard;
  const successPercent = snapshot.total
    ? Math.round((successfulCount / snapshot.total) * 100)
    : 0;

  return `
    <section class="content-card review-session-card review-session-complete">
      <p class="section-label">Daily Review Session</p>
      <h2 class="page-title">🎉 أنهيت مراجعة اليوم</h2>
      <p>اكتملت الجلسة وتم حفظ نتائج كل كلمة في سجل المراجعة.</p>

      <div class="review-dashboard-grid">
        <div class="review-metric-card">
          <span>إجمالي الكلمات</span>
          <strong>${snapshot.total}</strong>
        </div>
        <div class="review-metric-card">
          <span>${ratingLabels.good}</span>
          <strong>${counts.good}</strong>
        </div>
        <div class="review-metric-card">
          <span>${ratingLabels.hard}</span>
          <strong>${counts.hard}</strong>
        </div>
        <div class="review-metric-card">
          <span>${ratingLabels.again}</span>
          <strong>${counts.again}</strong>
        </div>
      </div>

      <div class="review-progress-block">
        <div class="track-header">
          <strong>نسبة التذكر في الجلسة</strong>
          <span>${successPercent}%</span>
        </div>
        <div class="progress-bar" aria-label="نسبة التذكر في جلسة المراجعة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${successPercent}">
          <span style="width: ${successPercent}%"></span>
        </div>
        <p>${counts.again ? `توجد ${counts.again} كلمة تحتاج مراجعة أقرب.` : "ممتاز، لم تسجل أي كلمة على أنها منسية ✅"}</p>
      </div>

      <div class="button-row" style="margin-top: 16px;">
        <button class="primary-button" data-route="saved">العودة إلى المحفوظات</button>
        <button class="secondary-button" data-route="learn">متابعة التعلم</button>
      </div>
    </section>
  `;
}

function renderMissingWordState() {
  return `
    <section class="content-card review-session-card">
      <p class="section-label">Daily Review Session</p>
      <h2 class="page-title">تعذر تحميل الكلمة الحالية</h2>
      <p>قد تكون الكلمة حُذفت من المحفوظات بعد بدء الجلسة. ارجع إلى صفحة المحفوظات وابدأ جلسة جديدة.</p>
      <button class="primary-button" data-route="saved" style="margin-top: 16px;">العودة إلى المحفوظات</button>
    </section>
  `;
}

export function renderReviewSessionPage(state) {
  const snapshot = getReviewSessionSnapshot(state);

  if (snapshot.isComplete) {
    return renderSessionResults(state, snapshot);
  }

  const savedWords = Array.isArray(state.savedWords) ? state.savedWords : [];
  const activeWord = savedWords.find((word) => word.id === snapshot.activeWordId);
  if (!activeWord) return renderMissingWordState();

  const record = getReviewRecord(state, activeWord.id);
  const status = getReviewStatus(record);

  return `
    <section class="content-card review-session-card">
      <div class="track-header">
        <div>
          <p class="section-label">Daily Review Session</p>
          <h2>🧠 جلسة المراجعة اليومية</h2>
        </div>
        <span class="status-badge is-locked">${snapshot.position} / ${snapshot.total}</span>
      </div>

      <div class="review-progress-block">
        <div class="track-header">
          <strong>تقدم الجلسة</strong>
          <span>${snapshot.progressPercent}%</span>
        </div>
        <div class="progress-bar" aria-label="تقدم جلسة المراجعة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${snapshot.progressPercent}">
          <span style="width: ${snapshot.progressPercent}%"></span>
        </div>
        <p>أكملت ${snapshot.completed} من أصل ${snapshot.total} كلمة.</p>
      </div>

      <article class="review-focus-card">
        <div class="track-header">
          <strong>${activeWord.word}</strong>
          <span class="status-badge ${status.confidence === "strong" ? "is-open" : "is-locked"}">${getConfidenceLabel(status.confidence)}</span>
        </div>
        <p class="review-focus-translation">${activeWord.translation}</p>
        <p>${activeWord.example}</p>
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

      ${renderReviewActions(activeWord.id)}

      <button class="ghost-button" data-route="saved" style="margin-top: 12px;">إنهاء الجلسة مؤقتاً</button>
    </section>
  `;
}
