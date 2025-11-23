// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// === Your Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyDr-zx9iQfDrU_lmfzSBO7-VjqgMelb538",
  authDomain: "adiaforos-store.firebaseapp.com",
  projectId: "adiaforos-store",
  storageBucket: "adiaforos-store.firebasestorage.app",
  messagingSenderId: "187555369706",
  appId: "1:187555369706:web:73748c4cde65e22ea867e7"
};

// === Initialize Firebase ===
const app = initializeApp(firebaseConfig);

// === Export Auth + Firestore ===
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
