import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function CheckoutSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 情況 A：綠界 callback 未帶 orderId
  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-light mb-6 text-green-600">付款成功！</h1>
        <p className="text-gray-600 mb-8">
          系統尚未取得訂單編號，但付款流程已完成。
        </p>

        <Link
          to="/orders"
          className="inline-block px-6 py-3 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition"
        >
          查看訂單列表
        </Link>
      </div>
    );
  }

  // orderId 為字串 "undefined" 的保護
  if (orderId === "undefined") {
    return (
      <div className="py-40 text-center text-red-600 text-xl">
        ⚠️ 錯誤：訂單編號無效（orderId=undefined）
      </div>
    );
  }

  // 情況 B：正常 orderId → 讀取 Firestore
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

  if (loading) {
    return <div className="py-40 text-center">讀取訂單中…</div>;
  }

  if (!order) {
    return (
      <div className="py-40 text-center">
        找不到訂單資料（orderId：{orderId}）
      </div>
    );
  }

  const shippingInfo = order.shippingInfo || order.checkoutInfo || {};
  const items = order.items || order.cart || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-light mb-10 text-green-600">
        訂單完成！
      </h1>

      {/* 訂單資訊 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
        <p>
          訂單編號：
          <span className="font-mono ml-2">{orderId}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          下單時間：
          {order.createdAt?.toDate().toLocaleString("zh-TW")}
        </p>
      </div>

      {/* 收件資訊 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-10">
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

      {/* 商品項目 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-10">
        <h2 className="text-lg font-medium mb-6">商品項目</h2>

        {items.map((item, i) => {
          const itemImg =
            item.mainImageUrl ||
            item.image ||
            item.imageUrl ||
            "https://placehold.co/200x200?text=WoodyFun";

          return (
            <div
              key={i}
              className="flex justify-between items-center py-4 last:border-b-0 border-b border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                  <img
                    src={itemImg}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/200x200?text=WoodyFun";
                    }}
                  />
                </div>

                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    適合年齡: {item.ageRange || "全齡適用"}／數量：{item.quantity}
                  </p>
                </div>
              </div>

              <p className="font-medium text-gray-800">
                NT$ {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* 訂單金額 */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-12">
        <h2 className="text-lg font-medium mb-4">訂單金額</h2>

        <div className="flex justify-between py-2 text-sm text-gray-600">
          <span>商品總額</span>
          <span>NT$ {order.subtotal?.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-2 text-sm text-gray-600">
          <span>運費</span>
          <span>NT$ 80</span>
        </div>

        <div className="flex justify-between pt-4 text-xl font-semibold text-gray-900">
          <span>總計</span>
          <span>NT$ {order.total?.toLocaleString()}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to={`/order/${orderId}`}
          className="inline-block bg-orange-500 text-white py-3 px-8 rounded-full
                     hover:bg-orange-400 active:bg-orange-600 transition"
        >
          查看訂單詳情
        </Link>
      </div>
    </div>
  );
}
