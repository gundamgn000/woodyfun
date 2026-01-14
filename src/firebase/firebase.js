// src/firebase/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyATEHVLiVa8JE6-tUxwXxmwqgUwzsbc8SU",
  authDomain: "woodyfun-official.firebaseapp.com",
  projectId: "woodyfun-official",
  storageBucket: "woodyfun-official.appspot.com",
  messagingSenderId: "918695965004",
  appId: "1:918695965004:web:96e30994d4a2392f9e5fe9"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);