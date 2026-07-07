import { getGuideMessage } from "../engines/aiGuideEngine.js";

export function renderAiGuidePage(state) {
  const message = getGuideMessage(state);

  return `
    <section class="content-card">
      <h2 class="page-title">🤖 المساعد</h2>
      <p>${message}</p>
      <ul class="page-list">
        <li>اقترح الدرس التالي — قريباً</li>
        <li>اشرح طريقة استخدام التطبيق — قريباً</li>
        <li>راجع الكلمات المحفوظة — قريباً</li>
      </ul>
    </section>
  `;
}
