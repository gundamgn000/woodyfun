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
      // 0. 安全檢查
      if (!cart || cart.length === 0) {
        alert("購物車是空的");
        return;
      }

      console.log("Step 1: 正在建立 Firestore 訂單...");
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
      console.log("Step 2: 訂單已寫入，ID:", orderId);

      if (checkoutInfo.paymentMethod === "信用卡") {
        console.log("Step 3: 呼叫金流 API...");
        
        // 建議這裡加入 try-catch 專門包覆 fetch，因為最容易斷在這裡
        const response = await fetch("https://createnewebpayorder-l7op6fj4oq-uc.a.run.app", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            // 如果還是無回應，可以嘗試移除不需要的 headers，讓請求更簡單
          },
          body: JSON.stringify({
            orderId: orderId,
            amount: totalAmount,
            itemDesc: "WoodyFunOrder", 
            email: user.email,
          }),
        }).catch(fetchErr => {
           // 這裡能抓到連線被擋住（如 CORS）的錯誤
           throw new Error("無法連線至金流伺服器: " + fetchErr.message);
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API 伺服器回報錯誤 (${response.status}): ${errorText}`);
        }

        const data = await response.json(); 
        console.log("Step 4: API 回傳結果:", data);
        
        if (data.ok) {
          console.log("Step 5: 準備導向藍新付款頁面...");
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
          throw new Error(data.error || "金流參數解析失敗");
        }
      } else {
        // 非信用卡支付邏輯
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error("❌ 訂單流程中斷:", err);
      // 把錯誤訊息直接顯示出來，這樣你測試時才知道發生什麼事
      alert("訂單失敗: " + err.message); 
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