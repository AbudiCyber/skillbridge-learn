const categories = [
  {
    icon: "🔤",
    title: "Alphabet",
    description: "الحروف الكبيرة والصغيرة، والنطق التقريبي لاحقاً.",
    meta: ["V1", "Beginner"]
  },
  {
    icon: "🧠",
    title: "Basic Vocabulary",
    description: "كلمات أساسية مترجمة مع أمثلة قصيرة.",
    meta: ["50 كلمة", "قريباً"]
  },
  {
    icon: "💬",
    title: "Basic Sentences",
    description: "جمل يومية قصيرة تساعد المستخدم على البدء بالمحادثة.",
    meta: ["Daily", "قريباً"]
  },
  {
    icon: "📘",
    title: "Grammar Lite",
    description: "قواعد خفيفة مثل الضمائر و a/an/the و question words.",
    meta: ["V2", "Future"]
  }
];

export function renderLibraryPage() {
  return `
    <section class="content-card">
      <p class="section-label">Library</p>
      <h2 class="page-title">🗂️ المكتبة</h2>
      <p>فهرس منظم للمحتوى، مستوحى من فكرة القواميس لكن بواجهة حديثة وسهلة.</p>
    </section>

    <section class="card-grid">
      ${categories.map((category) => `
        <article class="category-card">
          <div class="category-card-header">
            <h3>${category.icon} ${category.title}</h3>
          </div>
          <p>${category.description}</p>
          <div class="category-meta">
            ${category.meta.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      `).join("")}
    </section>
  `;
}
