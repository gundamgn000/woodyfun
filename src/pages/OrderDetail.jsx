// src/pages/OrderDetail.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import OrderStatusTracker from "../components/OrderStatusTracker";


const getOrderHintText = (order) => {
  if (!order) return "";

  const isCOD = order.paymentMethod === "貨到付款";

  if (isCOD) {
    switch (order.status) {
      case "pending":
        return "訂單已成立，將於出貨時再付款，請耐心等候出貨通知。";
      case "shipped":
        return "商品已出貨，請留意收件並準備付款。";
      case "completed":
        return "訂單已完成，感謝您的購買！";
      default:
        return "";
    }
  }

  // 非貨到付款（信用卡 / ATM）
  switch (order.status) {
    case "pending":
      return "付款處理中，請稍候系統確認。";
    case "completed":
      return "付款完成，訂單已成立，感謝您的購買！";
    default:
      return "";
  }
};


const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      const ref = doc(db, "orders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setOrder(snap.data());
      }
      setLoading(false);
    }

    loadDetail();
  }, [id]);

  if (loading) return <p className="p-6">讀取中...</p>;
  if (!order) return <p className="p-6">找不到訂單</p>;

  // 兼容多版本訂單格式
  const shippingInfo = order.shippingInfo || order.shipping;
  const orderItems = order.items || order.cart;
  const paymentMethod = order.paymentMethod || order.payment;

  // ✅ 判斷是否為貨到付款
  const isCOD =
    paymentMethod === "貨到付款" ||
    paymentMethod === "cod" ||
    paymentMethod === "cash_on_delivery";



  const getStatusMessage = (order) => {
    if (!order) return null;

    switch (order.status) {
      case "pending":
        return {
          text: "訂單已成立，等待出貨中。",
          className: "bg-gray-100 text-gray-700",
        };

      case "paid":
        return {
          text: "付款完成，準備為你出貨。",
          className: "bg-blue-100 text-blue-700",
        };

      case "shipped":
        return {
          text: "你的訂單已出貨，請留意收件。",
          className: "bg-blue-50 text-blue-800",
        };

      case "completed":
        return {
          text: "訂單已完成，感謝你的購買。",
          className: "bg-green-50 text-green-700",
        };

      case "cancelled":
        return {
          text: "此訂單已取消，如有疑問請聯絡客服。",
          className: "bg-red-50 text-red-700",
        };

      default:
        return null;
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/orders" className="text-blue-600 underline">
        ← 返回訂單列表
      </Link>

      <h2 className="text-2xl font-bold mt-4 mb-6">訂單明細</h2>

      <div className="border p-4 rounded shadow mb-6">
        <p><strong>訂單編號：</strong> {id}</p>
        <p>
          <strong>下單時間：</strong>
          {order.createdAt?.toDate().toLocaleString("zh-TW")}
        </p>
        <p><strong>狀態：</strong> {order.status}</p>
        <p><strong>付款方式：</strong> {paymentMethod || "無資料"}</p>
        {getOrderHintText(order) && (
          <div className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            {getOrderHintText(order)}
          </div>
        )}


        {/* 🚀 依付款方式顯示不同進度條 */}
        <div className="mt-6">
          <OrderStatusTracker
            status={order.status}
            paymentMethod={paymentMethod}
            isCOD={isCOD}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3">收件人資訊</h3>
      <div className="border p-4 rounded shadow mb-6">
        <p><strong>姓名：</strong> {shippingInfo?.name || "無資料"}</p>
        <p><strong>電話：</strong> {shippingInfo?.phone || "無資料"}</p>
        <p>
          <strong>地址：</strong>
          {(shippingInfo?.city || "") +
            (shippingInfo?.district || "") +
            (shippingInfo?.address || "無資料")}
        </p>
        <p><strong>Email：</strong> {order.email || "無資料"}</p>
      </div>

      <h3 className="text-xl font-bold mb-3">商品項目</h3>
      <div className="space-y-4">
        {orderItems?.map((item, idx) => (
          <div key={idx} className="flex gap-4 border p-4 rounded shadow">
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p>尺寸：{item.size}</p>
              <p>數量：{item.quantity}</p>
              <p className="text-pink-600 font-bold">NT$ {item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4 space-y-2 text-right">
        {order.subtotal != null && (
          <div className="flex justify-end gap-6 text-base text-gray-700">
            <span>商品小計</span>
            <span>NT$ {order.subtotal.toLocaleString()}</span>
          </div>
        )}

        {order.shippingFee > 0 && (
          <div className="flex justify-end gap-6 text-base text-gray-700">
            <span>運費</span>
            <span>NT$ {order.shippingFee.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-end gap-6 text-2xl font-bold mt-2">
          <span>總金額</span>
          <span>NT$ {order.total.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
};

export default OrderDetail;
