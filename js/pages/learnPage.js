const lessons = [
  {
    title: "English Letters",
    description: "تعرف على الحروف الكبيرة والصغيرة كبداية للمبتدئين.",
    status: "open",
    meta: ["3 دقائق", "+20 XP", "Unit 0"]
  },
  {
    title: "Basic Greetings",
    description: "تعلم Hello و Good morning و Thank you بأمثلة بسيطة.",
    status: "locked",
    meta: ["4 دقائق", "+20 XP", "Unit 1"]
  },
  {
    title: "Simple Questions",
    description: "ابدأ بأسئلة قصيرة مثل: What? Where? How?",
    status: "locked",
    meta: ["5 دقائق", "+25 XP", "Unit 2"]
  }
];

export function renderLearnPage() {
  return `
    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Active Track</p>
          <h2 class="page-title">📚 English for Beginners</h2>
        </div>
        <span class="status-badge is-open">V1</span>
      </div>
      <p>مسار قصير للمبتدئين العرب: دروس صغيرة، كلمات، أمثلة، واختبارات بسيطة.</p>
    </section>

    <section class="card-grid">
      ${lessons.map((lesson) => `
        <article class="lesson-card">
          <div class="lesson-card-header">
            <h3>${lesson.title}</h3>
            <span class="status-badge ${lesson.status === "open" ? "is-open" : "is-locked"}">
              ${lesson.status === "open" ? "مفتوح" : "مقفل"}
            </span>
          </div>
          <p>${lesson.description}</p>
          <div class="lesson-meta">
            ${lesson.meta.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      `).join("")}
    </section>
  `;
}
