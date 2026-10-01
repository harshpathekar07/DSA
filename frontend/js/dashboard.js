import { db } from "./firebase-config.js";
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from "firebase/firestore";
import { state, resetWorkspaceState } from "./app.js";
import { navigateTo } from "./router.js";
import { formatFirestoreTimestamp } from "./guards.js";

function renderModules(modules) {
  const grid = document.getElementById("modules-grid");
  const emptyState = document.getElementById("modules-empty");
  const loading = document.getElementById("modules-loading");

  loading.classList.add("hidden");

  if (!modules || modules.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  grid.innerHTML = "";

  modules.forEach(mod => {
    const card = document.createElement("div");
    card.className = "module-card";

    const title = document.createElement("h3");
    title.textContent = mod.name || "Untitled Module";

    const subtitle = document.createElement("p");
    subtitle.textContent = `Created ${formatFirestoreTimestamp(mod)}`;

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete-module icon-btn";
    delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation(); // prevent card click
      if (confirm("Delete this module?")) {
        try {
          await deleteDoc(doc(db, "users", state.user.uid, "modules", mod.id));
          card.remove();
          if (grid.children.length === 0) {
            emptyState.classList.remove("hidden");
          }
        } catch (err) {
          console.error("Delete failed", err);
        }
      }
    });

    card.addEventListener("click", () => {
      // Load saved JSON into workspace in read-only mode
      resetWorkspaceState();
      state.currentModule = { ...mod };
      state.readOnly = true;
      navigateTo("workspace");
    });

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(delBtn);
    grid.appendChild(card);
  });
}

export async function initDashboard() {
  const btnNewModule = document.getElementById("btn-new-module");
  if (btnNewModule) {
    const clone = btnNewModule.cloneNode(true);
    btnNewModule.parentNode.replaceChild(clone, btnNewModule);
    clone.addEventListener("click", () => {
      resetWorkspaceState();
      navigateTo("workspace");
    });
  }

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));

  const loading = document.getElementById("modules-loading");
  const emptyState = document.getElementById("modules-empty");
  const grid = document.getElementById("modules-grid");

  loading.classList.remove("hidden");
  emptyState.classList.add("hidden");
  grid.innerHTML = "";

  try {
    const q = query(
      collection(db, "users", state.user.uid, "modules"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const modules = [];
    querySnapshot.forEach((docSnap) => {
      modules.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderModules(modules);
  } catch (err) {
    console.error("Error fetching modules", err);
    loading.classList.add("hidden");
  }
}