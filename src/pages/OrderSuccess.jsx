import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const emailSentRef = useRef(false);

  useEffect(() => {
    if (!orderId || emailSentRef.current) return;

    const sendBuyerEmail = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          console.warn("❌ 找不到訂單，略過寄信");
          return;
        }

        const order = orderSnap.data();

        // ✅ 只抓「買家 email」
        const receiverEmail =
          order.email ||
          order.customerEmail ||
          order.userEmail ||
          order.shipping?.email ||
          "";

        if (!receiverEmail) {
          console.warn("⚠️ 無買家 Email，取消寄信");
          return;
        }

        // ✅ 避免 React 重渲染造成重複寄送
        emailSentRef.current = true;

        // 商品整理
        const itemsText = (order.items || [])
          .map(
            (item) =>
              `${item.name} × ${item.quantity}（NT$ ${item.price}）`
          )
          .join("\n");

        const templateParams = {
          // ⛔ 關鍵：只給買家 email
          email: receiverEmail,
          to_email: receiverEmail,
          reply_to: receiverEmail,

          customerName: order.customerName || order.name || "顧客",
          orderId: orderId,
          orderDate: new Date(
            order.createdAt?.seconds * 1000
          ).toLocaleString("zh-TW"),
          items: itemsText,
          payment: order.paymentMethod || "未提供",
          total: order.total || 0,
          address: order.address || "",
        };

        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_ORDER_CONFIRM_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        console.log("✅ 買家訂單成立通知已寄出");
      } catch (error) {
        console.error("❌ 買家信寄送失敗：", error);
      }
    };

    sendBuyerEmail();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-4">訂單完成</h1>
      <p className="text-gray-600 mb-8 text-center">
        感謝您的訂購，訂單已成功成立。
        <br />
        我們已寄送訂單確認信至您的電子郵件。
      </p>

      <Link
        to="/"
        className="px-6 py-3 rounded-full bg-black text-white text-sm"
      >
        返回首頁
      </Link>
    </div>
  );
}
