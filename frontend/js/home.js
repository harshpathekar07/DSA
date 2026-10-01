import { navigateTo } from "./router.js";

function generateRandomASCII(length = 600) {
  const chars =
    "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function initMarquee() {
  const c1 = document.getElementById("marquee-copy-1");
  const c2 = document.getElementById("marquee-copy-2");
  if (!c1 || !c2) return;
  const text = generateRandomASCII(600);
  c1.textContent = text;
  c2.textContent = text; // MUST be identical for seamless loop
}

function initAccordions() {
  const headers = document.querySelectorAll(".accordion-header");
  headers.forEach(header => {
    // Remove existing listeners to avoid duplicates if initHome is called multiple times
    const clone = header.cloneNode(true);
    header.parentNode.replaceChild(clone, header);

    clone.addEventListener("click", () => {
      const item = clone.parentElement;
      const isActive = item.classList.contains("active");

      // Close all
      document.querySelectorAll(".accordion-item").forEach(el => el.classList.remove("active"));

      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

function initButtons() {
  // Nav Get Started is handled in updateNavRight in guards, but if there's a base one, map it
  const navHomeBtn = document.getElementById("nav-home");
  if (navHomeBtn) {
    navHomeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("home");
    });
  }

  const navProjectsBtn = document.getElementById("nav-projects");
  if (navProjectsBtn) {
    navProjectsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const whatIDo = document.getElementById("what-i-do");
      if (whatIDo) {
        whatIDo.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  const navContactBtn = document.getElementById("nav-contact");
  const contactModal = document.getElementById("contact-modal");
  if (navContactBtn && contactModal) {
    navContactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      contactModal.classList.remove("hidden");
    });
  }

  const closeModalBtn = document.getElementById("btn-close-modal");
  if (closeModalBtn && contactModal) {
    closeModalBtn.addEventListener("click", () => {
      contactModal.classList.add("hidden");
    });
  }

  const copyEmailBtn = document.getElementById("btn-copy-email");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("hello@codelearn.ai").then(() => {
        const originalText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = "Copied!";
        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
        }, 1500);
      });
    });
  }

  const heroGetStarted = document.getElementById("hero-get-started");
  if (heroGetStarted) {
    heroGetStarted.addEventListener("click", () => {
      navigateTo("auth");
    });
  }
}

export function initHome() {
  initMarquee();
  initAccordions();
  initButtons();

  // Highlight nav home
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const navHome = document.getElementById("nav-home");
  if (navHome) navHome.classList.add("active");
}
