import { auth } from "./firebase-config.js";
import { state } from "./app.js";
import { navigateTo } from "./router.js";

// The route guarding is already handled in router.js inside showView().
// Authed fetch is asked to be put in guards.js in section 13 of the prompt.
// We will also put the display name logic here as a utility, and the firestore timestamp formatting.

export async function authedFetch(url, options) {
  if (!auth.currentUser) throw new Error("Not authenticated");

  let token = await auth.currentUser.getIdToken();
  let res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });

  if (res.status === 401) {
    token = await auth.currentUser.getIdToken(true);
    res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
  }

  return res;
}

export function getDisplayNameFallback(user) {
  if (!user) return "?";
  return ((user.displayName || user.email || "?")[0]).toUpperCase();
}

export function formatFirestoreTimestamp(module) {
  const date = module.createdAt?.toDate?.() || new Date();
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function updateNavRight() {
  const navRight = document.getElementById("nav-right");
  if (!navRight) return;

  if (state.user) {
    const initial = getDisplayNameFallback(state.user);
    const email = state.user.email || "";

    navRight.innerHTML = `
      <div class="user-avatar-btn" id="nav-avatar-btn">
        ${initial}
        <div class="dropdown-menu hidden" id="nav-dropdown">
          <div class="dropdown-item-text">${email}</div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item-btn" id="btn-signout">Sign Out</button>
        </div>
      </div>
    `;

    const avatarBtn = document.getElementById("nav-avatar-btn");
    const dropdown = document.getElementById("nav-dropdown");

    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
      }
    });

    const signOutBtn = document.getElementById("btn-signout");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        import("firebase/auth").then(({ signOut }) => {
          signOut(auth);
        });
      });
    }

  } else {
    navRight.innerHTML = `
      <button id="nav-get-started-auth" class="btn btn-primary">Get Started</button>
    `;
    const getStartedBtn = document.getElementById("nav-get-started-auth");
    if (getStartedBtn) {
      getStartedBtn.addEventListener("click", () => {
        navigateTo("auth");
      });
    }
  }
}
