import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";



const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
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
            const data = userSnap.data();
            setUserRole(data.role || "user");

            // ⭐ 新增：存使用者顯示資料
            setUserProfile({
              name: data.name || null,
              email: data.email || currentUser.email,
            });
          } else {
            setUserRole("user");
            setUserProfile(null);
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
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      setUserProfile(snap.data());
    }
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,     // ⭐ 關鍵：後台權限來源
        userProfile,   // ⭐ 新增
        authLoading,
        logout,
        refreshProfile, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
