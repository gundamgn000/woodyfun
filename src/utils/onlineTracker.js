import { db } from "../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function getOrCreateSessionId() {
  const key = "onlineSessionId";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      (crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    localStorage.setItem(key, id);
  }
  return id;
}

export function startOnlineTracking() {
  const sessionId = getOrCreateSessionId();
  const ref = doc(db, "online_users", sessionId);

  const ping = async () => {
    try {
      await setDoc(ref, { lastActive: serverTimestamp() }, { merge: true });
      // console.log("online ping ok"); // 要除錯再打開
    } catch (e) {
      console.error("online ping failed:", e);
    }
  };

  ping();
  const timer = setInterval(ping, 15000);

  return () => clearInterval(timer);
}