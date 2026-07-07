import { ROUTES } from "./constants.js";
import { loadUserState, saveUserState } from "./storage.js";
import { getState, setState } from "./state.js";
import { renderRoute } from "./router.js";
import { mountPage, setActiveNav } from "./ui.js";

function navigate(route) {
  const nextRoute = route || ROUTES.HOME;
  const state = setState({ route: nextRoute });
  saveUserState(state);
  mountPage(renderRoute(nextRoute, state));
  setActiveNav(nextRoute);
}

function bindNavigation() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-route]");
    if (!target) return;
    navigate(target.dataset.route);
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

function init() {
  setState(loadUserState());
  bindNavigation();
  navigate(getState().route || ROUTES.HOME);
  registerServiceWorker();
}

init();
