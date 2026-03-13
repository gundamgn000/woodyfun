import { useEffect } from "react";
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

  // ✅ 共用 mock now（跟 Cart / Checkout 同步）
  const now = getNow();

  // ✅ 共用運費規則（活動內=0 / 活動後：信用卡150，其它80）
  const shippingFee = calculateShipping(checkoutInfo?.paymentMethod, now);

  const finalAmount = Math.round(subtotal + shippingFee);

  // ===============================
  // 建立訂單
  // ===============================
  const createOrder = async () => {
    try {
      // 0) 防呆：付款方式一定要有（產品級必要）
      if (!checkoutInfo?.paymentMethod) {
        alert("請先選擇付款方式");
        navigate("/checkout");
        return;
      }

      if (!cart || cart.length === 0) {
        alert("購物車是空的");
        return;
      }

      console.log("subtotal:", subtotal);
      console.log("shippingFee:", shippingFee);
      console.log("finalAmount:", finalAmount);

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

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      const itemsText = cart
        .map((item) => `${item.name} × ${getQty(item)}`)
        .join("\n");

      // ===============================
      // 客戶信
      // ===============================
      await emailjs.send(
        "service_4i7f37e",
        "template_ig9xw2j",
        {
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
        },
        "jF4MDMUjdZNpY-Wi8"
      );

      // ===============================
      // 管理員信
      // ===============================
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
          subtotal,
          shipping: shippingFee,
          total: finalAmount,
          address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
        },
        "jF4MDMUjdZNpY-Wi8"
      );

      // ===============================
      // 金流
      // ===============================
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
              amount: finalAmount, // ✅ 含運費總額
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
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      console.error("❌ 訂單失敗:", err);
      alert("訂單失敗: " + err.message);
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

      {/* ✅ Debug 區塊：測試用（SHOW_DEBUG=true 才會顯示） */}
      {SHOW_DEBUG && (
        <div className="text-xs text-gray-400 pt-2">
          <div>now: {now.toString()}</div>
          <div>end: {OPENING_END.toString()}</div>
          <div>nowMs: {now.getTime()}</div>
          <div>endMs: {OPENING_END.getTime()}</div>
          <div>payment: {checkoutInfo?.paymentMethod || "(none)"}</div>
        </div>
      )}

      <button
        onClick={createOrder}
        className="w-full bg-[#ef9d51] text-white py-4 rounded-full text-lg font-medium"
      >
        確認送出並付款
      </button>
    </div>
  );
}