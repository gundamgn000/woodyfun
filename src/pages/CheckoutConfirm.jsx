import { useEffect, useState } from "react"; // ✅ 新增 useState
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import emailjs from "@emailjs/browser";

// ✅ 統一運費規則（共用）
import { calculateShipping, getNow, OPENING_END } from "../utils/shipping";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ 新增：處理中狀態，防止重複點擊並提供視覺反饋
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Debug 開關：本地測試改 true，上線務必 false
  const SHOW_DEBUG = false;

  // ===============================
  // 登入與資料檢查
  // ===============================
  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
    if (!loading && (!checkoutInfo || !checkoutInfo.name)) {
      navigate("/checkout");
    }
  }, [loading, user, navigate, checkoutInfo]);

  // ===============================
  // 金額計算（以 cart 為準）
  // ===============================
  const getQty = (item) => {
    if (typeof item.quantity === "number") return item.quantity;
    if (typeof item.qty === "number") return item.qty;
    return 1;
  };

  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price === "string") {
      const num = Number(item.price.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const subtotal = Math.round(
    (cart || []).reduce((sum, item) => sum + getQty(item) * getPrice(item), 0)
  );

  const now = getNow();
  const shippingFee = calculateShipping(checkoutInfo?.paymentMethod, now);
  const finalAmount = Math.round(subtotal + shippingFee);

  // ===============================
  // 建立訂單
  // ===============================
  const createOrder = async () => {
    // 防止重複執行
    if (isProcessing) return;
    
    try {
      // 0) 防呆
      if (!checkoutInfo?.paymentMethod) {
        alert("請先選擇付款方式");
        navigate("/checkout");
        return;
      }

      if (!cart || cart.length === 0) {
        alert("購物車是空的");
        return;
      }

      // 開始處理
      setIsProcessing(true);

      console.log("正在建立訂單...", { subtotal, shippingFee, finalAmount });

      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
        paymentMethod: checkoutInfo.paymentMethod,
        subtotal,
        shippingFee,
        total: finalAmount,
        status: "pending",
        items: cart,
      };

      // 1) 優先寫入 Firebase (這是最重要的資料，必須 await)
      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      // 2) 準備 Email 內容
      const itemsText = cart
        .map((item) => `${item.name} × ${getQty(item)}`)
        .join("\n");

      const emailParams = {
        customer_name: checkoutInfo.name,
        customer_email: user.email,
        order_id: orderId,
        created_at: new Date().toLocaleString("zh-TW"),
        items: itemsText,
        subtotal,
        shipping: shippingFee,
        payment_method: checkoutInfo.paymentMethod,
        total: finalAmount,
        address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
      };

      // 3) 🚀 非同步發送信件 (不再 await，讓它在背景跑)
      // 這樣程式會立刻跳到下方的金流邏輯，不用等 Email 伺服器回應
      Promise.all([
        emailjs.send("service_4i7f37e", "template_ig9xw2j", emailParams, "jF4MDMUjdZNpY-Wi8"), // 客戶信
        emailjs.send("service_4i7f37e", "template_qrt9ay5", emailParams, "jF4MDMUjdZNpY-Wi8")  // 管理員信
      ]).catch(err => console.error("信件背景發送失敗:", err));

      // 4) 金流與跳轉邏輯
      const needsPaymentGateway =
        checkoutInfo.paymentMethod === "信用卡" ||
        checkoutInfo.paymentMethod === "超商取貨付款";

      if (needsPaymentGateway) {
        const response = await fetch(
          "https://createnewebpayorder-l7op6fj4oq-uc.a.run.app",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
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

        if (data.ok) {
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
        // 非金流支付（如貨到付款/轉帳）直接成功
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error("❌ 訂單失敗:", err);
      alert("訂單失敗: " + err.message);
      setIsProcessing(false); // 失敗時務必恢復按鈕，讓客戶可以重試
    }
  };

  if (loading || !user) return <div className="py-40 text-center">驗證中...</div>;

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">確認訂單資訊</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b">
            <span>訂購人</span>
            <span>{checkoutInfo?.name}</span>
          </div>

          <div className="flex justify-between pb-4 border-b">
            <span>聯絡電話</span>
            <span>{checkoutInfo?.phone}</span>
          </div>

          <div className="flex justify-between pb-4 border-b">
            <span>Line ID</span>
            <span className={checkoutInfo?.lineId ? "text-gray-800" : "text-gray-400"}>
              {checkoutInfo?.lineId || "未填寫"}
            </span>
          </div>

          {/* 金額區塊 */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between">
              <span>商品小計</span>
              <span>NT$ {subtotal.toLocaleString("zh-TW")}</span>
            </div>

            <div className="flex justify-between">
              <span>運費</span>
              <span>NT$ {shippingFee.toLocaleString("zh-TW")}</span>
            </div>

            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>總金額</span>
              <span>NT$ {finalAmount.toLocaleString("zh-TW")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Debug 區塊 */}
      {SHOW_DEBUG && (
        <div className="text-xs text-gray-400 pt-2 mb-4">
          <div>now: {now.toString()}</div>
          <div>payment: {checkoutInfo?.paymentMethod || "(none)"}</div>
        </div>
      )}

      {/* ✅ 優化後的按鈕：根據狀態變換顏色與文字 */}
      <button
        onClick={createOrder}
        disabled={isProcessing}
        className={`w-full py-4 rounded-full text-lg font-medium transition-colors ${
          isProcessing 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-[#ef9d51] hover:bg-[#d68a44] text-white"
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            {/* 這裡可以放個簡單的 loading spinner 轉圈圈 */}
            正在處理訂單，請稍候...
          </span>
        ) : (
          "確認送出並付款"
        )}
      </button>
      
      {isProcessing && (
        <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
          正在為您跳轉至安全支付頁面，請勿關閉視窗...
        </p>
      )}
    </div>
  );
}