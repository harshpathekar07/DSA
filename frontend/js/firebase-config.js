import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXQ6kLIw-oGDKjna6uzvdcF2S_uDmlhjU",
  authDomain: "codelearn-ai-65110.firebaseapp.com",
  projectId: "codelearn-ai-65110",
  storageBucket: "codelearn-ai-65110.firebasestorage.app",
  messagingSenderId: "1081673133035",
  appId: "1:1081673133035:web:55d7a02c77b189ac4c47ae",
  measurementId: "G-VBTG6WVMVB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };