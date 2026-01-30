import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo, totalAmount } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const createOrder = async () => {
    try {
      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo, totalAmount } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
        // 發送請求到後端
        const res = await fetch("https://us-central1-woodyfun-official.cloudfunctions.net/createNewebPayOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: totalAmount,
            itemDesc: "WoodyFun Order", // 建議先用純英文測試，避免中文編碼問題
            email: user.email
          }),
        });

        const data = await res.json();
        if (data.ok) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.action;
          Object.entries(data.params).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden"; input.name = k; input.value = v;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        } else {
          alert("付款系統回應錯誤，請稍後再試");
        }
      } else {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error(err);
      alert("訂單建立失敗");
    }
  };

  if (loading || !user) return <div className="py-40 text-center">驗證中...</div>;

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <h1 className="text-2xl font-bold mb-6">訂單確認 (正式環境)</h1>
      <div className="bg-gray-50 p-6 rounded-2xl mb-8">
        <p className="text-xl font-bold text-orange-600">總金額：NT$ {totalAmount?.toLocaleString()}</p>
      </div>
      <button onClick={createOrder} className="w-full bg-orange-500 text-white py-4 rounded-full font-bold hover:bg-orange-600 transition">
        立即付款
      </button>
    </div>
  );
}