import { ROUTES } from "./constants.js";
import { renderHomePage } from "./pages/homePage.js";
import { renderLearnPage } from "./pages/learnPage.js";
import { renderLibraryPage } from "./pages/libraryPage.js";
import { renderProgressPage } from "./pages/progressPage.js";
import { renderSettingsPage } from "./pages/settingsPage.js";

const routeRenderers = {
  [ROUTES.HOME]: renderHomePage,
  [ROUTES.LEARN]: renderLearnPage,
  [ROUTES.LIBRARY]: renderLibraryPage,
  [ROUTES.PROGRESS]: renderProgressPage,
  [ROUTES.SETTINGS]: renderSettingsPage
};

export function renderRoute(route, state) {
  const render = routeRenderers[route] || routeRenderers[ROUTES.HOME];
  return render(state);
}
