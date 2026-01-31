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

  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const createOrder = async () => {
    try {
      if (!cart || cart.length === 0) return;

      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
        paymentMethod: checkoutInfo.paymentMethod,
        total: totalAmount,
        status: "pending",
        items: cart,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      if (checkoutInfo.paymentMethod === "信用卡") {
        const response = await fetch("https://createnewebpayorder-l7op6fj4oq-uc.a.run.app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            amount: totalAmount,
            itemDesc: "WoodyFunOrder", // 建議先用英文測試，穩定後再換回中文
            email: user.email,
          }),
        });

        // ✅ 修正點：變數名稱由 res 改為 response
        const data = await response.json(); 
        
        if (data.ok) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.action;

          Object.entries(data.params).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = v;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          alert("金流失敗: " + (data.error || "未知錯誤"));
        }
      } else {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error("訂單錯誤:", err);
      alert("訂單建立失敗，請檢查控制台");
    }
  };

  if (loading || !user) return <div className="py-40 text-center">驗證中...</div>;

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">確認訂單 (正式環境)</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
           <span className="text-gray-600">訂購人</span>
           <span className="font-medium">{checkoutInfo.name}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
           <span className="text-gray-600">付款方式</span>
           <span className="font-medium text-blue-600">{checkoutInfo.paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
           <span className="text-lg font-bold text-gray-800">應付金額</span>
           <span className="text-2xl font-bold text-orange-600">NT$ {totalAmount?.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={createOrder} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-bold text-lg transition shadow-lg">
        確認付款
      </button>
      <div className="text-center mt-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:underline">返回修改</button>
      </div>
    </div>
  );
}