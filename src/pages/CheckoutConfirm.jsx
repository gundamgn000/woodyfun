import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo, totalAmount } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isTestMode, setIsTestMode] = useState(true); // 預設為測試模式

  const createOrder = async () => {
    try {
      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
        paymentMethod: checkoutInfo.paymentMethod,
        total: totalAmount,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      if (checkoutInfo.paymentMethod === "信用卡") {
        const res = await fetch("https://us-central1-woodyfun-official.cloudfunctions.net/createNewebPayOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount: totalAmount, itemDesc: "WoodyFun", email: user.email, isTest: isTestMode }),
        });
        const data = await res.json();
        if (data.ok) {
          const form = document.createElement("form");
          form.method = "POST"; form.action = data.action;
          Object.entries(data.params).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden"; input.name = k; input.value = v;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) { alert("訂單失敗"); }
  };

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
        <span className="text-amber-800 font-bold">{isTestMode ? "🛠️ 測試模式" : "✅ 正式模式"}</span>
        <button onClick={() => setIsTestMode(!isTestMode)} className="bg-white px-3 py-1 rounded shadow text-sm">切換</button>
      </div>
      <h1 className="text-2xl font-bold mb-6">確認訂單</h1>
      <button onClick={createOrder} className="w-full bg-orange-500 text-white py-4 rounded-full font-bold">
        確認送出 {isTestMode ? "(測試)" : ""}
      </button>
    </div>
  );
}