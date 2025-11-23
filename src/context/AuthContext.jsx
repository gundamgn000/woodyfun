// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth 使用者
  const [profile, setProfile] = useState(null); // Firestore 的會員資料
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 嘗試讀取 Firestore /users/{uid}
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            // 還沒有資料也不要報錯，給空值即可
            setProfile(null);
          }
        } catch (err) {
          console.error("讀取會員資料失敗:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    profile,            // Firestore 裡的 { name, email, ... }
    isLoggedIn: !!user, // Boolean
    setProfile,         // 讓 ProfileEdit 更新 context 裡的資料
    logout,
  };

  if (loading) {
    // 避免閃一下未登入畫面
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600">
        載入中…
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必須在 AuthProvider 中使用");
  return ctx;
}
