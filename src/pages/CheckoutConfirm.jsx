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

  // 檢查登入狀態
  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // 建立訂單與金流跳轉
  const createOrder = async () => {
    try {
      if (!cart || cart.length === 0) return;

      // 1. 建立 Firestore 訂單資料
      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
        paymentMethod: checkoutInfo.paymentMethod,
        total: totalAmount,
        status: "pending", // 初始狀態
        items: cart,       // 保留購物車內容快照
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      // 2. 判斷付款方式
      if (checkoutInfo.paymentMethod === "信用卡") {
        
        // 呼叫後端 API
        const res = await fetch("https://us-central1-woodyfun-official.cloudfunctions.net/createNewebPayOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            amount: totalAmount,
            itemDesc: "WoodyFun Order", 
            email: user.email
          }),
        });

        const data = await res.json();
        
        if (data.ok) {
          // 動態建立表單並自動送出
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.action; // 指向藍新金流網址

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
          alert("金流系統連線失敗，請稍後再試");
        }
      } else {
        // 貨到付款或其他方式
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error("訂單建立錯誤:", err);
      alert("訂單建立失敗，請檢查網路連線");
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
      
      <button 
        onClick={createOrder} 
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-bold text-lg transition shadow-lg"
      >
        確認付款
      </button>

      <div className="text-center mt-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:underline">
          返回修改
        </button>
      </div>
    </div>
  );
}