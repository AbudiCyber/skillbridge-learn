export function renderProgressPage(state) {
  return `
    <section class="content-card">
      <h2 class="page-title">📊 التقدم</h2>
      <p>هنا سيرى المستخدم XP، Streak، الدروس المكتملة، والكلمات المحفوظة.</p>
      <div class="stat-grid">
        <div class="stat-card">XP<strong>${state.xp}</strong></div>
        <div class="stat-card">Streak<strong>${state.streak}</strong></div>
        <div class="stat-card">Lessons<strong>${state.completedLessons.length}</strong></div>
        <div class="stat-card">Saved<strong>${state.savedWords.length}</strong></div>
      </div>
    </section>
  `;
}
