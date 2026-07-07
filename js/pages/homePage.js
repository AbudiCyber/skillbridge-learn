export function renderHomePage(state) {
  return `
    <section class="hero-card">
      <h2>مرحباً بك 👋</h2>
      <p>
        هذا هو مركز البداية. في النسخ القادمة سيظهر هنا الدرس المقترح، تقدمك، ورسالة SkillBridge Guide.
      </p>
      <button class="primary-button" data-route="learn">ابدأ التعلم</button>
    </section>

    <section class="content-card">
      <h2>ملخص التقدم</h2>
      <div class="stat-grid">
        <div class="stat-card">XP<strong>${state.xp}</strong></div>
        <div class="stat-card">Streak<strong>${state.streak}</strong></div>
      </div>
    </section>
  `;
}
