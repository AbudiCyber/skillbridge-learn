export function setActiveNav(route) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.route === route);
  });
}

export function mountPage(html) {
  const root = document.querySelector("#app-root");
  if (!root) return;
  root.innerHTML = html;
}
