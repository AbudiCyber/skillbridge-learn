export function renderHomePage(state) {
  const completedCount = state.completedLessons.length;
  const savedCount = state.savedWords.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 10) * 100));

  return `
    <section class="hero-card">
      <p class="section-label">SkillBridge Guide</p>
      <h2>مرحباً بك 👋</h2>
      <p>
        ابدأ بخطوة صغيرة اليوم. درس قصير، اختبار بسيط، ثم ترى تقدمك محفوظاً.
      </p>
      <div class="button-row">
        <button class="primary-button" data-route="learn">ابدأ التعلم</button>
        <button class="ghost-button" data-route="guide">اسأل المساعد</button>
      </div>
    </section>

    <section class="content-card">
      <div class="track-header">
        <h2>درس اليوم</h2>
        <span class="status-badge is-open">مفتوح</span>
      </div>
      <p>English Letters — تعرف على فكرة الحروف الإنجليزية الكبيرة والصغيرة.</p>
      <button class="secondary-button" data-route="learn">عرض المسار</button>
    </section>

    <section class="content-card">
      <h2>ملخص التقدم</h2>
      <div class="progress-bar" aria-label="Progress"><span style="width: ${progressPercent}%"></span></div>
      <div class="stat-grid" style="margin-top: 14px;">
        <div class="stat-card">XP<strong>${state.xp}</strong></div>
        <div class="stat-card">Streak<strong>${state.streak}</strong></div>
        <div class="stat-card">Lessons<strong>${completedCount}/10</strong></div>
        <div class="stat-card">Saved<strong>${savedCount}</strong></div>
      </div>
    </section>
  `;
}
