export function renderProgressPage(state) {
  const completedCount = state.completedLessons.length;
  const savedCount = state.savedWords.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 10) * 100));

  return `
    <section class="content-card">
      <p class="section-label">Progress Dashboard</p>
      <h2 class="page-title">📊 التقدم</h2>
      <p>كل إنجاز صغير يجب أن يظهر للمستخدم حتى يشعر أن جهده محفوظ.</p>
      <div class="progress-bar" aria-label="Overall progress"><span style="width: ${progressPercent}%"></span></div>
    </section>

    <section class="content-card">
      <h2>الإحصائيات</h2>
      <div class="stat-grid">
        <div class="stat-card">XP<strong>${state.xp}</strong></div>
        <div class="stat-card">Streak<strong>${state.streak}</strong></div>
        <div class="stat-card">Lessons<strong>${completedCount}/10</strong></div>
        <div class="stat-card">Saved<strong>${savedCount}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <h2>الإنجازات القادمة</h2>
      <ul class="page-list">
        <li>🏆 First Lesson — أكمل أول درس</li>
        <li>🔥 3-Day Streak — تعلم 3 أيام متتالية</li>
        <li>📚 10 Saved Words — احفظ 10 كلمات</li>
      </ul>
    </section>
  `;
}
