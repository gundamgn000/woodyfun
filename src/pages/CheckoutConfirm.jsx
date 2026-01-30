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
        const res = await fetch("https://us-central1-woodyfun-official.cloudfunctions.net/createNewebPayOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: totalAmount,
            itemDesc: "WoodyFun 訂單",
            email: user.email
            // 移除 isTest 參數，後端預設即為正式
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
        }
      } else {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) { alert("訂單建立失敗，請稍後再試"); }
  };

  if (loading || !user) return <div className="py-40 text-center">驗證中...</div>;

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <h1 className="text-2xl font-bold mb-6">確認訂單</h1>
      <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
           <span className="text-gray-600">收件人</span>
           <span className="font-medium">{checkoutInfo.name}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
           <span className="text-gray-600">總金額</span>
           <span className="text-xl font-bold text-orange-600">NT$ {totalAmount?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
           <span className="text-gray-600">付款方式</span>
           <span className="font-medium text-blue-600">信用卡 (藍新金流)</span>
        </div>
      </div>
      
      <button onClick={createOrder} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-bold transition shadow-lg">
        前往付款
      </button>
    </div>
  );
}