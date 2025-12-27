import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import emailjs from "@emailjs/browser";

// ✅ 獨立寄信 function（保持 UI/功能不動，只補強收件欄位與log）
const sendOrderEmail = async (order) => {
  console.log("📧 [EmailJS] 準備寄送訂單 Email", order);

  const shipping = order.shippingInfo || {};

  // 收件者 email：優先 order.email，其次 shippingInfo.email，再不行就空字串
  const receiverEmail =
    order.email ||
    shipping.email ||
    order.customerEmail ||
    order.userEmail ||
    "";

  if (!receiverEmail) {
    console.warn("⚠️ [EmailJS] 找不到收件者 Email（order.email / shippingInfo.email 都沒有）");
    // 這裡直接不送，避免 EmailJS 送到空收件者造成你誤判
    return { skipped: true, reason: "missing_receiver_email" };
  }

  const itemsText = (order.items || [])
    .map((item) => `${item.name}（${item.size}）x${item.quantity} - NT$ ${item.price}`)
    .join("\n");

  const templateParams = {
    customer_name: shipping.name || "顧客",
    order_id: order.id || "",
    date: new Date().toLocaleString("zh-TW"),
    payment: order.paymentMethod || "",
    total: order.total || "",
    address: shipping.address || "",
    items: itemsText,

    // ✅ 重要：同時提供多個常見收件欄位名稱，避免你模板「To」綁的是 to_email 但你只傳 email
    email: receiverEmail,
    to_email: receiverEmail,
    reply_to: receiverEmail,
  };

  try {
    const res = await emailjs.send(
      "service_ra9779e",
      "template_jdanagy",
      templateParams,
      "_0T9aM48V9I1olpb9"
    );

    console.log("✅ [EmailJS] 寄送成功", res);
    return res;
  } catch (err) {
    console.error("❌ [EmailJS] 寄送失敗（完整錯誤）:", err);
    throw err;
  }
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 用 ref 防止重複寄信（重點）
  const emailSentRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.error("找不到訂單資料");
          return;
        }

        const orderData = docSnap.data();

        if (!isMounted) return;
        setOrder(orderData);

        // ✅ 只寄一次
        if (!emailSentRef.current) {
          emailSentRef.current = true;

          await sendOrderEmail({
            ...orderData,
            id: orderId,
          });

          console.log("✅ 訂單 Email 流程已執行（成功/略過/失敗請看上方 log）");
        }
      } catch (error) {
        console.error("讀取訂單或寄信錯誤:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return <div className="py-40 text-center text-xl tracking-wider">讀取訂單中…</div>;
  }

  if (!order) {
    return (
      <div className="py-40 text-center text-xl tracking-wider">
        找不到訂單資料。
        <div className="mt-6">
          <Link to="/products" className="px-6 py-3 bg-black text-white rounded-full">
            回商品頁
          </Link>
        </div>
      </div>
    );
  }

  const shipping = order.shippingInfo || {};
  const items = order.items || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-light tracking-widest mb-10">訂單完成！</h1>

      <div className="border p-5 rounded mb-10">
        <p className="text-lg tracking-wider">
          <span className="font-medium">訂單編號：</span> {orderId}
        </p>
      </div>

      <div className="border p-5 rounded mb-10">
        <h2 className="text-xl mb-4 font-medium">收件資訊</h2>
        <p>姓名：{shipping.name || "未提供"}</p>
        <p>電話：{shipping.phone || "未提供"}</p>
        <p>地址：{shipping.address || "未提供"}</p>
        <p>付款方式：{order.paymentMethod || "未提供"}</p>
        <p>Email：{order.email || shipping.email || "未提供"}</p>
      </div>

      <div className="border p-5 rounded mb-10">
        <h2 className="text-xl mb-4 font-medium">商品項目</h2>

        {items.length === 0 ? (
          <p className="text-gray-500">沒有商品資料</p>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 border-b pb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p>尺寸：{item.size}</p>
                  <p>數量：{item.quantity}</p>
                  <p>NT$ {item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border p-5 rounded mb-10">
        <h2 className="text-xl mb-4 font-medium">訂單金額</h2>
        <p className="text-lg">NT$ {order.total}</p>
      </div>

      <div className="flex gap-4">
        <Link to="/" className="flex-1 text-center py-3 rounded-full border tracking-widest">
          回首頁
        </Link>

        <Link
          to="/products"
          className="flex-1 text-center py-3 rounded-full bg-black text-white tracking-widest"
        >
          繼續購物
        </Link>
      </div>
    </div>
  );
}
