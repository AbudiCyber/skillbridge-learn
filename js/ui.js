import { createTranslator } from "./i18n/i18n.js";

const navLabelKeys = {
  home: "navHome",
  learn: "navLearn",
  library: "navLibrary",
  saved: "navSaved",
  guide: "navGuide",
  settings: "navSettings"
};

export function setActiveNav(route) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.route === route);
  });
}

export function updateNavigationLanguage(language) {
  const t = createTranslator(language);
  document.querySelectorAll(".nav-item").forEach((item) => {
    const key = navLabelKeys[item.dataset.route];
    if (key) item.textContent = t(key);
  });
}

export function mountPage(html) {
  const root = document.querySelector("#app-root");
  if (!root) return;
  root.innerHTML = html;
}
