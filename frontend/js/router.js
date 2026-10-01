import { state } from "./app.js";

export const VIEWS = ["home", "auth", "dashboard", "workspace"];
export const PROTECTED_VIEWS = ["dashboard", "workspace"];
export const DEFAULT_VIEW = "home";

let currentView = null;
const listeners = {};

export function registerView(name, initFn) { listeners[name] = initFn; }

export function navigateTo(viewName, { replace = false } = {}) {
  if (!VIEWS.includes(viewName)) viewName = DEFAULT_VIEW;
  const targetHash = "#" + viewName;
  if (window.location.hash === targetHash) { showView(viewName); return; }
  if (replace) {
    window.history.replaceState({ view: viewName }, "", targetHash);
    showView(viewName);
  } else {
    window.location.hash = targetHash;
  }
}

export function showView(viewName) {
  if (PROTECTED_VIEWS.includes(viewName) && !state.user) {
    navigateTo("auth", { replace: true }); return;
  }
  if (viewName === "auth" && state.user) {
    navigateTo("dashboard", { replace: true }); return;
  }

  document.querySelectorAll("[data-view]").forEach(el => el.classList.add("hidden"));

  const target = document.querySelector(`[data-view="${viewName}"]`);
  if (!target) { navigateTo(DEFAULT_VIEW, { replace: true }); return; }

  target.classList.remove("hidden");
  if (currentView !== viewName) window.scrollTo(0, 0);
  currentView = viewName;

  const initFn = listeners[viewName];
  if (typeof initFn === "function") {
    try { initFn(); } catch (err) { console.error(`[router] init failed:`, err); }
  }
}

export function getCurrentViewFromHash() {
  const raw = window.location.hash.replace("#", "").trim();
  return VIEWS.includes(raw) ? raw : DEFAULT_VIEW;
}

export function startRouter() {
  const initialView = getCurrentViewFromHash();
  window.history.replaceState({ view: initialView }, "", "#" + initialView);
  showView(initialView);
  window.addEventListener("hashchange", () => showView(getCurrentViewFromHash()));
}