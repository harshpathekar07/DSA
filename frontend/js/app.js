import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";
import { startRouter, registerView, navigateTo, getCurrentViewFromHash, showView } from "./router.js";
import { initHome } from "./home.js";
import { initAuth } from "./auth.js";
import { initDashboard } from "./dashboard.js";
import { initWorkspace } from "./workspace.js";
import { updateNavRight } from "./guards.js";

// Global State
export const state = {
  user: null,
  uploadedFiles: [],
  currentModule: { id: null, name: "Untitled Module", data: null },
  currentFlashcardIndex: 0,
  quizState: { index: 0, score: 0, answered: false },
  hasUnsavedWork: false,
  readOnly: false
};

export function resetWorkspaceState() {
  state.uploadedFiles = [];
  state.currentModule = { id: null, name: "Untitled Module", data: null };
  state.currentFlashcardIndex = 0;
  state.quizState = { index: 0, score: 0, answered: false };
  state.hasUnsavedWork = false;
  state.readOnly = false;
}

export function showToast(messageHtml) {
  const toast = document.getElementById("toast");
  toast.innerHTML = messageHtml;
  toast.classList.remove("hidden");

  if (!messageHtml.includes("<button")) {
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 4000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  registerView("home", initHome);
  registerView("auth", initAuth);
  registerView("dashboard", initDashboard);
  registerView("workspace", initWorkspace);

  // Network listener
  window.addEventListener("offline", () => {
    showToast("You are offline. Some features may not work.");
  });
  window.addEventListener("online", () => {
    document.getElementById("toast").classList.add("hidden");
  });

  onAuthStateChanged(auth, (user) => {
    state.user = user;
    updateNavRight();

    const view = getCurrentViewFromHash();
    // Re-evaluate routes based on auth state
    if (["dashboard", "workspace"].includes(view) && !user) {
      navigateTo("auth", { replace: true });
    } else if (view === "auth" && user) {
      navigateTo("dashboard", { replace: true });
    } else {
      showView(view);
    }
  });

  startRouter();
});