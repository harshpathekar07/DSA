import { state, resetWorkspaceState, showToast } from "./app.js";
import { navigateTo } from "./router.js";
import { generateStudyPack } from "./api.js";
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// UI Elements
let els = {};
function collectEls() {
  els = {
    titleInput: document.getElementById("ws-title"),
    btnHome: document.getElementById("ws-btn-home"),
    btnSidebar: document.getElementById("ws-btn-sidebar"),
    btnGenerate: document.getElementById("ws-btn-generate"),
    btnDuplicate: document.getElementById("ws-btn-duplicate"),
    btnAddSource: document.getElementById("ws-btn-add-source"),
    fileInput: document.getElementById("ws-file-input"),
    sourceList: document.getElementById("source-list"),
    sidebar: document.getElementById("ws-sidebar"),
    tabs: document.querySelectorAll(".ws-tab"),
    panes: document.querySelectorAll(".ws-tab-pane"),
    overlay: document.getElementById("ws-loading-overlay"),
    status: document.getElementById("loading-status"),
    mermaidContainer: document.getElementById("mermaid-container"),
    flashcardContainer: document.getElementById("flashcard-container"),
    flashcardControls: document.getElementById("flashcard-controls"),
    report: document.getElementById("report-body"),
    quizContainer: document.getElementById("quiz-container")
  };
}

function updateWorkspaceUI() {
  els.titleInput.value = state.currentModule.name;
  els.titleInput.disabled = state.readOnly;

  if (state.readOnly) {
    els.btnGenerate.classList.add("hidden");
    els.btnDuplicate.classList.remove("hidden");
    els.btnAddSource.classList.add("hidden");
    // Show outputs if they exist
    renderOutputs();
  } else {
    els.btnGenerate.classList.remove("hidden");
    els.btnDuplicate.classList.add("hidden");
    els.btnAddSource.classList.remove("hidden");
    els.btnGenerate.disabled = state.uploadedFiles.length === 0;
    renderSources();
    if (state.currentModule.mind_map) {
      renderOutputs();
    } else {
      clearOutputs();
    }
  }
}

function renderSources() {
  els.sourceList.innerHTML = "";
  state.uploadedFiles.forEach((file, index) => {
    const li = document.createElement("li");
    li.className = "source-item";
    li.innerHTML = `
      <div class="source-item-name">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        ${file.name}
      </div>
      <button class="source-item-remove icon-btn" data-index="${index}">×</button>
    `;
    els.sourceList.appendChild(li);
  });

  document.querySelectorAll(".source-item-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      state.uploadedFiles.splice(idx, 1);
      renderSources();
      els.btnGenerate.disabled = state.uploadedFiles.length === 0;
    });
  });
}

function clearOutputs() {
  els.mermaidContainer.innerHTML = `<div class="empty-ws">Generate a pack to see the mind map.</div>`;
  els.flashcardContainer.innerHTML = `<div class="empty-ws">Generate a pack to see flashcards.</div>`;
  els.flashcardControls.classList.add("hidden");
  els.report.innerHTML = `<div class="empty-ws">Generate a pack to see the report.</div>`;
  els.quizContainer.innerHTML = `<div class="empty-ws">Generate a pack to take the quiz.</div>`;
}

function renderOutputs() {
  renderMindMap();
  renderFlashcards();
  renderReport();
  renderQuiz();
}

function renderMindMap() {
  const data = state.currentModule.mind_map;
  if (!data) {
    els.mermaidContainer.innerHTML = `<div class="empty-ws">No mind map generated.</div>`;
    return;
  }

  els.mermaidContainer.innerHTML = `<div class="mermaid" id="mermaid-graph">${data}</div>`;
  try {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    mermaid.run({ nodes: [document.getElementById('mermaid-graph')] });
  } catch (err) {
    els.mermaidContainer.innerHTML = `<div class="empty-ws">Failed to render mind map.</div>`;
  }
}

function renderFlashcards() {
  const cards = state.currentModule.flashcards;
  if (!cards || cards.length === 0) {
    els.flashcardContainer.innerHTML = `<div class="empty-ws">No flashcards generated.</div>`;
    els.flashcardControls.classList.add("hidden");
    return;
  }

  els.flashcardControls.classList.remove("hidden");
  const current = state.currentFlashcardIndex;
  const card = cards[current];

  els.flashcardContainer.innerHTML = `
    <div class="flashcard" id="flashcard">
      <div class="flashcard-inner">
        <div class="flashcard-front">${card.question}</div>
        <div class="flashcard-back">${card.answer}</div>
      </div>
    </div>
  `;

  document.getElementById("flashcard").addEventListener("click", function() {
    this.classList.toggle("flipped");
  });

  document.getElementById("fc-counter").textContent = `${current + 1} / ${cards.length}`;
}

function renderReport() {
  const data = state.currentModule.report;
  if (!data) {
    els.report.innerHTML = `<div class="empty-ws">No report generated.</div>`;
    return;
  }

  const rawHtml = marked.parse(data);
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  els.report.innerHTML = cleanHtml;
}

function renderQuiz() {
  const quiz = state.currentModule.quiz;
  if (!quiz || quiz.length === 0) {
    els.quizContainer.innerHTML = `<div class="empty-ws">No quiz generated.</div>`;
    return;
  }

  if (state.quizState.index >= quiz.length) {
    // Show results
    els.quizContainer.innerHTML = `
      <div class="quiz-results">
        <h2 style="margin-bottom: 24px;">Quiz Complete</h2>
        <div class="quiz-score-large">${state.quizState.score} / ${quiz.length}</div>
        <p style="color: var(--text-secondary); margin-bottom: 32px;">${Math.round((state.quizState.score / quiz.length) * 100)}%</p>
        <button id="btn-retake-quiz" class="btn btn-primary">Retake Quiz</button>
      </div>
    `;
    document.getElementById("btn-retake-quiz").addEventListener("click", () => {
      // Fisher-Yates shuffle could be applied here if requested, but instructions say "shuffle via Fisher–Yates"
      state.quizState = { index: 0, score: 0, answered: false };

      // Shuffle logic
      const shuffledQuiz = [...state.currentModule.quiz];
      for (let i = shuffledQuiz.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuiz[i], shuffledQuiz[j]] = [shuffledQuiz[j], shuffledQuiz[i]];
      }
      state.currentModule.quiz = shuffledQuiz;

      renderQuiz();
    });
    return;
  }

  const qData = quiz[state.quizState.index];

  let optionsHtml = '';
  qData.options.forEach((opt, i) => {
    optionsHtml += `<button class="quiz-option" data-index="${i}">${opt}</button>`;
  });

  els.quizContainer.innerHTML = `
    <div class="quiz-progress">Question ${state.quizState.index + 1} of ${quiz.length}</div>
    <div class="quiz-question">${qData.question}</div>
    <div class="quiz-options" id="quiz-options">
      ${optionsHtml}
    </div>
    <button id="btn-next-question" class="btn btn-primary hidden" style="margin-top: 24px; float: right;">Next Question</button>
  `;

  const options = document.querySelectorAll(".quiz-option");
  const nextBtn = document.getElementById("btn-next-question");

  options.forEach(opt => {
    opt.addEventListener("click", (e) => {
      if (state.quizState.answered) return;
      state.quizState.answered = true;

      const selectedIdx = parseInt(e.target.dataset.index, 10);
      options.forEach(o => o.disabled = true);

      if (selectedIdx === qData.correct) {
        e.target.classList.add("correct");
        state.quizState.score++;
      } else {
        e.target.classList.add("incorrect");
        options[qData.correct].classList.add("correct");
      }

      nextBtn.classList.remove("hidden");
    });
  });

  nextBtn.addEventListener("click", () => {
    state.quizState.index++;
    state.quizState.answered = false;
    renderQuiz();
  });
}

function switchTab(tabId) {
  els.tabs.forEach(t => t.classList.remove("active"));
  els.panes.forEach(p => p.classList.add("hidden"));

  const tab = document.querySelector(`.ws-tab[data-tab="${tabId}"]`);
  const pane = document.getElementById(`tab-${tabId}`);

  if (tab && pane) {
    tab.classList.add("active");
    pane.classList.remove("hidden");
  }
}

async function saveModuleToFirestore(data) {
  try {
    const docRef = await addDoc(collection(db, "users", state.user.uid, "modules"), {
      name: state.currentModule.name,
      createdAt: serverTimestamp(),
      mind_map: data.mind_map,
      flashcards: data.flashcards,
      report: data.report,
      quiz: data.quiz
    });
    state.currentModule.id = docRef.id;
    state.hasUnsavedWork = false;
  } catch (error) {
    console.error("Save failed", error);
    showToast("Generated but not saved. <button id='retry-save' class='btn btn-small'>Retry Save</button>");
    state.hasUnsavedWork = true;
    document.getElementById("retry-save")?.addEventListener("click", () => saveModuleToFirestore(data));
  }
}

async function doGeneratePack() {
  els.overlay.classList.remove("hidden");
  els.sidebar.style.pointerEvents = "none";
  els.sidebar.style.opacity = "0.5";

  const statuses = [
    "Extracting text...",
    "Generating mind map...",
    "Writing flashcards...",
    "Composing report...",
    "Building quiz...",
    "Saving to your library..."
  ];
  let statusIdx = 0;
  const statusInterval = setInterval(() => {
    statusIdx = (statusIdx + 1) % statuses.length;
    els.status.textContent = statuses[statusIdx];
  }, 1200);

  const formData = new FormData();
  state.uploadedFiles.forEach(f => formData.append("files", f));

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 120000);

  try {
    const res = await generateStudyPack(formData, abortController.signal);
    clearTimeout(timeoutId);

    if (res.status === 429) {
      throw new Error("AI quota reached. Try again in a minute.");
    } else if (res.status === 401) {
      navigateTo("auth");
      return;
    } else if (!res.ok) {
      throw new Error("Something went wrong. Check the console for details.");
    }

    const data = await res.json();

    state.currentModule = { ...state.currentModule, ...data };

    clearInterval(statusInterval);
    els.status.textContent = statuses[5];

    await saveModuleToFirestore(data);

    updateWorkspaceUI();
    switchTab("mindmap");

  } catch (err) {
    if (err.name === 'AbortError') {
      showToast("Generation timed out after 120 seconds.");
    } else {
      showToast(err.message || "An error occurred.");
    }
  } finally {
    clearInterval(statusInterval);
    els.overlay.classList.add("hidden");
    els.sidebar.style.pointerEvents = "auto";
    els.sidebar.style.opacity = "1";
    clearTimeout(timeoutId);
  }
}

function bindEvents() {
  els.btnHome.replaceWith(els.btnHome.cloneNode(true));
  els.btnSidebar.replaceWith(els.btnSidebar.cloneNode(true));
  els.btnGenerate.replaceWith(els.btnGenerate.cloneNode(true));
  els.btnDuplicate.replaceWith(els.btnDuplicate.cloneNode(true));
  els.btnAddSource.replaceWith(els.btnAddSource.cloneNode(true));
  els.fileInput.replaceWith(els.fileInput.cloneNode(true));
  els.titleInput.replaceWith(els.titleInput.cloneNode(true));

  collectEls();

  els.btnHome.addEventListener("click", () => {
    if (state.hasUnsavedWork) {
      if (confirm("You have unsaved work. Leave anyway?")) {
        resetWorkspaceState();
        navigateTo("dashboard");
      }
    } else {
      resetWorkspaceState();
      navigateTo("dashboard");
    }
  });

  els.btnSidebar.addEventListener("click", () => {
    els.sidebar.classList.toggle("collapsed");
  });

  const handleTitleChange = (e) => {
    state.currentModule.name = e.target.value || "Untitled Module";
  };
  els.titleInput.addEventListener("blur", handleTitleChange);
  els.titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      els.titleInput.blur();
    }
  });

  els.btnAddSource.addEventListener("click", () => {
    els.fileInput.click();
  });

  els.fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    let skipped = false;
    let totalSize = state.uploadedFiles.reduce((acc, f) => acc + f.size, 0);

    files.forEach(f => {
      // 15MB limit per file
      if (f.size > 15 * 1024 * 1024) {
        showToast(`File ${f.name} is too large (max 15MB)`);
        return;
      }

      const isDuplicate = state.uploadedFiles.some(existing => existing.name === f.name && existing.size === f.size);
      if (isDuplicate) {
        skipped = true;
      } else {
        if (totalSize + f.size > 30 * 1024 * 1024) {
          showToast(`Total size exceeds 30MB limit`);
          return;
        }
        totalSize += f.size;
        state.uploadedFiles.push(f);
      }
    });

    if (skipped) {
      showToast("Some duplicate files were skipped.");
    }

    els.fileInput.value = "";
    updateWorkspaceUI();
  });

  els.btnGenerate.addEventListener("click", doGeneratePack);

  els.btnDuplicate.addEventListener("click", () => {
    const dataToCopy = { ...state.currentModule };
    delete dataToCopy.id;
    dataToCopy.name = `Copy of ${dataToCopy.name}`;

    resetWorkspaceState();
    state.currentModule = dataToCopy;
    state.hasUnsavedWork = true; // Need to save it to persist
    updateWorkspaceUI();

    // Concurrent tabs not handled gracefully - commented out per §15.10
    // "Concurrent Tabs: Not handled. Comment in workspace.js."
  });

  els.tabs.forEach(tab => {
    const clone = tab.cloneNode(true);
    tab.parentNode.replaceChild(clone, tab);
    clone.addEventListener("click", (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Need to collect tabs again after cloning
  collectEls();

  const prevBtn = document.getElementById("fc-prev");
  const nextBtn = document.getElementById("fc-next");
  if (prevBtn) {
    const pClone = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(pClone, prevBtn);
    pClone.addEventListener("click", () => {
      const fc = document.getElementById("flashcard");
      if (fc && fc.classList.contains("flipped")) fc.classList.remove("flipped");

      setTimeout(() => {
        const len = state.currentModule.flashcards.length;
        state.currentFlashcardIndex = (state.currentFlashcardIndex - 1 + len) % len;
        renderFlashcards();
      }, 150); // slight delay for unflip
    });
  }

  if (nextBtn) {
    const nClone = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(nClone, nextBtn);
    nClone.addEventListener("click", () => {
      const fc = document.getElementById("flashcard");
      if (fc && fc.classList.contains("flipped")) fc.classList.remove("flipped");

      setTimeout(() => {
        const len = state.currentModule.flashcards.length;
        state.currentFlashcardIndex = (state.currentFlashcardIndex + 1) % len;
        renderFlashcards();
      }, 150);
    });
  }
}

export function initWorkspace() {
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  collectEls();
  bindEvents();
  updateWorkspaceUI();
  switchTab("mindmap");
}