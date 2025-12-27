// src/pages/CheckoutSuccess.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function CheckoutSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 情況 A：綠界 callback 沒帶 orderId
  // -----------------------------
  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-light mb-6 text-green-600">付款成功！</h1>

        <p className="text-lg mb-8">
          系統尚未取得訂單編號，但付款流程已完成。
        </p>

        <Link
          to="/orders"
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          查看訂單列表
        </Link>
      </div>
    );
  }

  // orderId 是 undefined 字串（某些情況）
  if (orderId === "undefined") {
    return (
      <div className="py-40 text-center text-red-600 text-xl">
        ⚠️ 錯誤：綠界回傳的訂單編號無效（orderId=undefined）
      </div>
    );
  }

  // -----------------------------
  // 情況 B：綠界正常傳回 orderId → 讀取 Firestore
  // -----------------------------
  useEffect(() => {
    async function loadOrder() {
      try {
        const ref = doc(db, "orders", orderId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setOrder(snap.data());
        }
      } catch (err) {
        console.error("讀取訂單錯誤：", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading)
    return <div className="py-40 text-center">讀取訂單中…</div>;

  if (!order)
    return (
      <div className="py-40 text-center">
        找不到訂單資料（orderId：{orderId}）
      </div>
    );

  const shippingInfo = order.shippingInfo || order.checkoutInfo || {};
  const items = order.items || order.cart || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-light mb-10 text-green-600">訂單完成！</h1>

      <div className="border p-5 rounded mb-4">
        <p>訂單編號：<span className="font-mono">{orderId}</span></p>
        <p>下單時間：{order.createdAt?.toDate().toLocaleString("zh-TW")}</p>
      </div>

      <div className="border p-5 rounded mb-10">
        <h2 className="text-lg font-medium mb-4">收件資訊</h2>
        <p>姓名：{shippingInfo.name}</p>
        <p>電話：{shippingInfo.phone}</p>
        <p>
          地址：
          {(shippingInfo.city || "") +
            (shippingInfo.district || "") +
            (shippingInfo.address || "")}
        </p>
        <p>Email：{order.email}</p>
        <p>付款方式：{order.paymentMethod}</p>
      </div>

      <div className="border p-5 rounded mb-10">
        <h2 className="text-lg font-medium mb-4">商品項目</h2>

        {items.map((item, i) => (
          <div key={i} className="flex gap-4 border-b pb-4 mb-4">
            <img src={item.image} className="w-20 h-20 rounded object-cover" />
            <div>
              <p>{item.name}</p>
              <p>尺寸：{item.size}</p>
              <p>數量：{item.quantity}</p>
              <p>NT$ {item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border p-5 rounded mb-10">
        <h2 className="text-lg font-medium">訂單金額</h2>
        <div className="flex justify-between border-b py-2">
          <span>商品總額</span>
          <span>NT$ {order.subtotal?.toLocaleString()}</span>
        </div>

        <div className="flex justify-between border-b py-2">
          <span>運費</span>
          <span>NT$ 80</span>
        </div>

        <div className="flex justify-between pt-4 text-xl font-bold text-pink-600">
          <span>總計</span>
          <span>NT$ {order.total?.toLocaleString()}</span>
        </div>
      </div>

      <div className="text-center">
        <Link
          to={`/order/${orderId}`}
          className="text-white bg-blue-600 py-3 px-8 rounded-full inline-block hover:bg-blue-700 transition"
        >
          查看訂單詳情
        </Link>
      </div>
    </div>
  );
}
