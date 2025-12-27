import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// 加入收藏
export const addToWishlist = async (userId, productId) => {
  const ref = doc(db, "users", userId, "wishlist", productId);
  await setDoc(ref, {
    createdAt: Timestamp.now(),
  });
};

// 移除收藏
export const removeFromWishlist = async (userId, productId) => {
  const ref = doc(db, "users", userId, "wishlist", productId);
  await deleteDoc(ref);
};

// 單品是否在收藏中
export const isInWishlist = async (userId, productId) => {
  const ref = doc(db, "users", userId, "wishlist", productId);
  const snap = await getDoc(ref);
  return snap.exists();
};

// 取得該使用者所有收藏商品 id
export const getWishlistProducts = async (userId) => {
  const snap = await getDocs(collection(db, "users", userId, "wishlist"));
  return snap.docs.map((doc) => doc.id);
};
