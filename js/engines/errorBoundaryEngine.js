export function getErrorMessage(error) {
  if (!error) return "Unknown render error";
  if (error instanceof Error) return error.message || "Render error";
  return String(error);
}

export function reportRenderError(error, context = {}) {
  console.error("SkillBridge render error:", {
    route: context.route || "unknown",
    message: getErrorMessage(error),
    error
  });
}

export function renderErrorBoundary({ route = "home", error } = {}) {
  const safeMessage = getErrorMessage(error);

  return `
    <section class="content-card error-boundary-card">
      <p class="section-label">Render Safety</p>
      <h2 class="page-title">🧯 حدث خطأ في عرض الصفحة</h2>
      <p>لم يتم كسر التطبيق. يمكنك الرجوع للرئيسية ثم المحاولة من جديد.</p>
      <div class="empty-state" style="margin: 14px 0; text-align: start;">
        <strong>Route:</strong> ${route}<br />
        <strong>Reason:</strong> ${safeMessage}
      </div>
      <button class="primary-button" data-route="home">الرجوع للرئيسية</button>
    </section>
  `;
}

export function safelyRenderRoute(render, state, context = {}) {
  try {
    return render(state);
  } catch (error) {
    reportRenderError(error, context);
    return renderErrorBoundary({ route: context.route, error });
  }
}
