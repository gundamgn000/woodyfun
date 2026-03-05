// src/utils/visitorCounter.js
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function recordVisitor() {
  const today = getTodayKey();
  console.log("recordVisitor fired");

  const visitedKey = `visited-${today}`;
  const visitedVal = localStorage.getItem(visitedKey);
  console.log("visitedKey =", visitedKey, "value =", visitedVal);

  if (visitedVal) return;

  try {
    const ref = doc(db, "analytics_daily", today);

    // ✅ 先讀取目前 visitors（保證 visitors 是 number）
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().visitors ?? 0) : 0;

    // ✅ 再寫回 number + timestamp
    await setDoc(
      ref,
      {
        visitors: current + 1,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("visitor recorded OK");
    localStorage.setItem(visitedKey, "true");
  } catch (err) {
    console.error("recordVisitor failed:", err);
  }
}