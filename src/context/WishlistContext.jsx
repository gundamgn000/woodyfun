import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // -----------------------------
  // 📌 載入 Firestore 收藏
  // -----------------------------
  const loadWishlist = async () => {
    if (!user) {
      setWishlistIds([]);
      setLoadingWishlist(false);
      return;
    }

    setLoadingWishlist(true);

    try {
      const ref = collection(db, "users", user.uid, "wishlist");
      const snap = await getDocs(ref);

      const ids = snap.docs.map((d) => d.id);
      setWishlistIds(ids);
    } catch (err) {
      console.error("Load wishlist error:", err);
      setWishlistIds([]);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // -----------------------------
  // 📌 Optimistic UI 收藏切換
  // -----------------------------
  const toggleWishlist = async (productId) => {
    if (!user) {
      showToast("請先登入");
      return;
    }

   if (typeof productId !== "string") {
    console.warn("toggleWishlist 收到非 productId:", productId);
    return;
  }

    const isInList = wishlistIds.includes(productId);

    // ----- 1. UI 立即更新（不等待 Firestore） -----
    const previousList = wishlistIds;
    let newList;

    if (isInList) {
      newList = previousList.filter((id) => id !== productId);
      setWishlistIds(newList);
      showToast("已取消收藏");
    } else {
      newList = [...previousList, productId];
      setWishlistIds(newList);
      showToast("已加入收藏");
    }

    // ----- 2. Firestore 在背景慢慢寫入 -----
    try {
      const userRef = collection(db, "users", user.uid, "wishlist");

      if (isInList) {
        // 移除單一商品
        await deleteDoc(doc(db, "users", user.uid, "wishlist", productId));
      } else {
        // 新增單一商品
        await setDoc(doc(db, "users", user.uid, "wishlist", productId), {
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("Update wishlist error:", err);

      // ❌ Firestore 寫入失敗 → UI 還原
      setWishlistIds(previousList);
      showToast("操作失敗，請稍後再試");
    }
  };

  // -----------------------------
  // 📌 判斷是否已收藏
  // -----------------------------
  const isWishlisted = (productId) => Array.isArray(wishlistIds) && wishlistIds.includes(productId);

  // -----------------------------
  // 📌 當 user 變動，自動刷新 wishlist
  // -----------------------------
  useEffect(() => {
    loadWishlist();
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        loadingWishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
