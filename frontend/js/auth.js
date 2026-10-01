import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

function toggleForms(isLogin) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");

  if (isLogin) {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    tabLogin.classList.remove("active");
    tabSignup.classList.add("active");
  }
}

function setBtnLoading(btn, isLoading, defaultText) {
  const textSpan = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".btn-spinner");

  if (isLoading) {
    btn.disabled = true;
    textSpan.textContent = btn.id === "btn-login" ? "Signing in…" : "Creating account…";
    spinner.classList.remove("hidden");
  } else {
    btn.disabled = false;
    textSpan.textContent = defaultText;
    spinner.classList.add("hidden");
  }
}

export function initAuth() {
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");

  // Clean up listeners by cloning
  if (tabLogin && tabSignup) {
    const cloneLogin = tabLogin.cloneNode(true);
    const cloneSignup = tabSignup.cloneNode(true);
    tabLogin.parentNode.replaceChild(cloneLogin, tabLogin);
    tabSignup.parentNode.replaceChild(cloneSignup, tabSignup);

    cloneLogin.addEventListener("click", () => toggleForms(true));
    cloneSignup.addEventListener("click", () => toggleForms(false));
  }

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");

  if (loginForm) {
    // Clone to reset
    const newLoginForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newLoginForm, loginForm);

    newLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.classList.add("hidden");
      loginError.textContent = "";

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const btn = document.getElementById("btn-login");

      setBtnLoading(btn, true, "Sign In");
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // On success, state observer will handle navigation
      } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove("hidden");
        setBtnLoading(btn, false, "Sign In");
      }
    });
  }

  if (signupForm) {
    // Clone to reset
    const newSignupForm = signupForm.cloneNode(true);
    signupForm.parentNode.replaceChild(newSignupForm, signupForm);

    newSignupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      signupError.classList.add("hidden");
      signupError.textContent = "";

      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById("signup-confirm").value;
      const btn = document.getElementById("btn-signup");

      if (password !== confirmPassword) {
        signupError.textContent = "Passwords do not match.";
        signupError.classList.remove("hidden");
        return;
      }

      setBtnLoading(btn, true, "Create Account");
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // observer handles navigation
      } catch (error) {
        signupError.textContent = error.message;
        signupError.classList.remove("hidden");
        setBtnLoading(btn, false, "Create Account");
      }
    });
  }

  // Highlight nav correctly
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
}