import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!orderId) return;
        const ref = doc(db, "orders", orderId);
        const snap = await getDoc(ref);

        if (snap.exists()) setOrder(snap.data());
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-10 text-center">讀取中...</div>;
  if (!order) return <div className="p-10 text-center">找不到訂單。</div>;

  const statusText = {
    pending: "等待付款",
    "atm-code-issued": "ATM 取號成功，等待匯款",
    paid: "付款完成",
    failed: "付款失敗",
    shipping: "訂單出貨中",
    completed: "訂單已完成",
  };

  // ✅ 相容舊資料：items / cart
  const items = order.items || order.cart || [];

  // ✅ 相容付款方式欄位
  const paymentMethod =
    order.paymentMethod || order.shippingInfo?.paymentMethod || order.checkoutInfo?.paymentMethod || "—";

  // ✅ 成立時間 Timestamp 顯示
  const createdAtText =
    order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString("zh-TW") : "—";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">訂單狀態追蹤</h1>

      <div className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">訂單資訊</h2>
        <p>訂單編號：{orderId}</p>
        <p>成立時間：{createdAtText}</p>
        <p>付款方式：{paymentMethod}</p>

        <p className="mt-3 font-bold">
          訂單狀態：{statusText[order.status] || "未知狀態"}
        </p>
      </div>

      {/* ATM 取號資料 */}
      {order.status === "atm-code-issued" && order.atmInfo && (
        <div className="border p-4 rounded mb-6 bg-yellow-50">
          <h2 className="text-lg font-semibold mb-2">ATM 付款資訊</h2>
          <p>銀行代碼：{order.atmInfo.BankCode}</p>
          <p>虛擬帳號：{order.atmInfo.vAccount}</p>
          <p>繳費期限：{order.atmInfo.ExpireDate}</p>
          <p className="text-red-700 mt-2">請在期限內完成匯款以避免訂單取消。</p>
        </div>
      )}

      {/* 商品清單 */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">商品項目</h2>

        {items.map((item, index) => {
          const itemImg =
            item.mainImageUrl ||
            item.image ||
            item.imageUrl ||
            "https://placehold.co/200x200?text=WoodyFun";

          const qty = Number(item.quantity ?? item.qty ?? 1);
          const price = Number(String(item.price ?? 0).replace(/[^0-9.]/g, "")) || 0;

          return (
            <div key={index} className="flex items-center mb-3">
              <img src={itemImg} alt="" className="w-16 h-16 object-cover mr-4" />
              <div>
                <p>{item.name}</p>
                <p>適合年齡: {item.ageRange || "全齡適用"}</p>
                <p>數量：{qty}</p>
                <p className="text-sm text-gray-500">單價：NT$ {price.toLocaleString("zh-TW")}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 金額 */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">訂單金額</h2>
        <p>商品總額：NT$ {Number(order.subtotal ?? 0).toLocaleString("zh-TW")}</p>
        <p>運費：NT$ {Number(order.shippingFee ?? 0).toLocaleString("zh-TW")}</p>
        <p>訂單總金額：NT$ {Number(order.total ?? 0).toLocaleString("zh-TW")}</p>
      </div>
    </div>
  );
}