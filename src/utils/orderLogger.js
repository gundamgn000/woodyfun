import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * 訂單操作紀錄（Audit Log）
 */
export const logOrderAction = async ({
  orderId,
  action,
  from,
  to,
  user,
}) => {
  if (!orderId) return;

  try {
    const logRef = collection(db, "orders", orderId, "logs");

    await addDoc(logRef, {
      action,
      from: from || null,
      to: to || null,
      byUid: user?.uid || "system",
      byEmail: user?.email || "system",
      byRole: user?.userRole || "system",
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("寫入訂單操作紀錄失敗：", err);
  }
};
