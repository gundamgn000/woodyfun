import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import emailjs from "@emailjs/browser";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo, totalAmount } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
    if (!loading && (!checkoutInfo || !checkoutInfo.name)) {
      navigate("/checkout");
    }
  }, [loading, user, navigate, checkoutInfo]);

  const createOrder = async () => {
    try {
      // 0. 安全檢查
      if (!cart || cart.length === 0) {
        alert("購物車是空的");
        return;
      }

      console.log("Step 1: 正在準備訂單資料...");

      // 強制確保金額是整數
      const finalAmount = Math.round(Number(totalAmount));
      console.log("確認要送出的金額:", finalAmount);

      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
        paymentMethod: checkoutInfo.paymentMethod,
        total: finalAmount,
        status: "pending",
        items: cart,
      };

      // 1️⃣ 建立訂單
      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;
      console.log("Step 2: 訂單已寫入 Firestore, ID:", orderId);

      // ===============================
      // 準備寄信用資料
      // ===============================
      const itemsText = cart
        .map((item) => `${item.name} × ${item.quantity}`)
        .join("\n");

      const subtotal = finalAmount;
      const shippingFee = 0;

      // ===============================
      // EmailJS：客戶訂單成立通知
      // ===============================
      try {
        await emailjs.send(
          "service_4i7f37e",
          "template_ig9xw2j",
          {
            customer_name: checkoutInfo.name,
            customer_email: user.email,
            order_id: orderId,
            created_at: new Date().toLocaleString("zh-TW"),
            items: itemsText,
            subtotal: subtotal,
            shipping: shippingFee,
            payment_method: checkoutInfo.paymentMethod,
            total: finalAmount,
            address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
          },
          "jF4MDMUjdZNpY-Wi8"
        );

        console.log("📧 客戶訂單信已送出");
      } catch (e) {
        console.error("❌ 客戶信寄送失敗", e);
      }

      // ===============================
      // EmailJS：賣家通知
      // ===============================
      try {
        await emailjs.send(
          "service_4i7f37e",
          "template_qrt9ay5",
          {
            customer_name: checkoutInfo.name,
            customer_email: user.email,
            order_id: orderId,
            created_at: new Date().toLocaleString("zh-TW"),
            items: itemsText,
            payment_method: checkoutInfo.paymentMethod,
            subtotal: subtotal,
            shipping: shippingFee,
            total: finalAmount,
            address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
          },
          "jF4MDMUjdZNpY-Wi8"
        );

        console.log("📧 管理員訂單通知已送出");
      } catch (error) {
        console.error("❌ 管理員信寄送失敗", error);
      }

      // ===============================
      // 判斷是否需跳轉金流
      // ===============================
      const needsPaymentGateway =
        checkoutInfo.paymentMethod === "信用卡" ||
        checkoutInfo.paymentMethod === "超商取貨付款";

      if (needsPaymentGateway) {
        console.log(`Step 3: 呼叫金流後端... 方式: ${checkoutInfo.paymentMethod}`);

        const response = await fetch(
          "https://createnewebpayorder-l7op6fj4oq-uc.a.run.app",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              amount: finalAmount,
              itemDesc: "WoodyFunOrder",
              email: user.email,
              method: checkoutInfo.paymentMethod,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API 伺服器回報錯誤: ${errorText}`);
        }

        const data = await response.json();
        console.log("Step 4: API 回傳結果:", data);

        if (data.ok) {
          console.log("Step 5: 執行表單跳轉藍新...");

          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.action;

          Object.entries(data.params).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          throw new Error(data.error || "金流參數解析失敗");
        }
      } else {
        // 非線上支付
        console.log("非線上支付，直接完成");
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error("❌ 訂單流程中斷:", err);
      alert("訂單失敗: " + err.message);
    }
  };

  if (loading || !user)
    return <div className="py-40 text-center">驗證中...</div>;

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">確認訂單資訊</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-600">訂購人</span>
            <span className="font-medium">{checkoutInfo?.name}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-600">聯絡電話</span>
            <span className="font-medium">{checkoutInfo?.phone}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-600">付款方式</span>
            <span className="font-medium text-blue-600">
              {checkoutInfo?.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-800">應付金額</span>
            <span className="text-2xl font-bold text-orange-600">
              NT$ {totalAmount?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        className="w-full bg-[#ef9d51] hover:bg-[#d68a44] text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg active:scale-[0.98]"
      >
        {checkoutInfo.paymentMethod === "信用卡"
          ? "前往刷卡付款"
          : checkoutInfo.paymentMethod === "超商取貨付款"
          ? "選擇取貨門市"
          : "確認成立訂單"}
      </button>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-colors"
        >
          返回修改資訊
        </button>
      </div>
    </div>
  );
}
