import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // 🔑 讀取 Firestore 使用者角色
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || "user");
          } else {
            setUserRole("user");
          }
        } catch (err) {
          console.error("讀取使用者角色失敗：", err);
          setUserRole("user");
        }
      } else {
        setUser(null);
        setUserRole(null);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,     // ⭐ 關鍵：後台權限來源
        authLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
