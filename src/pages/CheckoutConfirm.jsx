import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import emailjs from "@emailjs/browser";

// ✅ 統一運費規則（共用）
import { calculateShipping, getNow } from "../utils/shipping";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const SHOW_DEBUG = false;

  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
    if (!loading && (!checkoutInfo || !checkoutInfo.name)) {
      navigate("/checkout");
    }
  }, [loading, user, navigate, checkoutInfo]);

  const getQty = (item) => (typeof item.quantity === "number" ? item.quantity : item.qty || 1);
  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price === "string") {
      const num = Number(item.price.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const subtotal = useMemo(() => Math.round((cart || []).reduce((sum, item) => sum + getQty(item) * getPrice(item), 0)), [cart]);
  
  // ✅ 獲取折扣數值（從 checkoutInfo 傳遞過來）
  const autoDiscount = checkoutInfo?.autoDiscountAmount || 0;
  const couponDiscount = checkoutInfo?.couponDiscount || 0;
  
  const now = getNow();
  const shippingFee = calculateShipping(checkoutInfo?.paymentMethod, now);
  
  // ✅ 計算最終金額
  const finalAmount = Math.round(subtotal + shippingFee - autoDiscount - couponDiscount);

  const createOrder = async () => {
    if (isProcessing) return;
    try {
      if (!checkoutInfo?.paymentMethod) {
        alert("請先選擇付款方式");
        navigate("/checkout");
        return;
      }
      if (!cart || cart.length === 0) return alert("購物車是空的");

      setIsProcessing(true);

      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),
        shippingInfo: checkoutInfo,
        taxId: checkoutInfo.taxId || "",
        paymentMethod: checkoutInfo.paymentMethod,
        subtotal,
        shippingFee,
        autoDiscount,   // 新增折扣記錄
        couponDiscount, // 新增折扣記錄
        couponCode: checkoutInfo.couponCode || "", // 新增優惠碼記錄
        total: finalAmount,
        status: "pending",
        items: cart,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      const itemsText = cart.map((item) => `${item.name} × ${getQty(item)}`).join("\n");
      const emailParams = {
        customer_name: checkoutInfo.name,
        customer_email: user.email,
        order_id: orderId,
        created_at: new Date().toLocaleString("zh-TW"),
        items: itemsText,
        subtotal,
        shipping: shippingFee,
        discount: autoDiscount + couponDiscount, // Email 顯示總折扣
        payment_method: checkoutInfo.paymentMethod,
        total: finalAmount,
        address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
      };

      Promise.all([
        emailjs.send("service_4i7f37e", "template_ig9xw2j", emailParams, "jF4MDMUjdZNpY-Wi8"),
        emailjs.send("service_4i7f37e", "template_qrt9ay5", emailParams, "jF4MDMUjdZNpY-Wi8")
      ]).catch(err => console.error("信件發送失敗:", err));

      if (["信用卡", "超商取貨付款"].includes(checkoutInfo.paymentMethod)) {
        const response = await fetch("https://createnewebpayorder-l7op6fj4oq-uc.a.run.app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount: finalAmount, itemDesc: "WoodyFunOrder", email: user.email, method: checkoutInfo.paymentMethod }),
        });
        
        const data = await response.json();
        if (data.ok) {
          const form = document.createElement("form");
          form.method = "POST"; form.action = data.action;
          Object.entries(data.params).forEach(([k, v]) => {
            const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; form.appendChild(i);
          });
          document.body.appendChild(form); form.submit();
        } else { throw new Error(data.error || "金流參數解析失敗"); }
      } else {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      }
    } catch (err) {
      alert("訂單失敗: " + err.message);
      setIsProcessing(false);
    }
  };

  if (loading || !user) return <div className="py-40 text-center">驗證中...</div>;

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">確認訂單資訊</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b"><span>訂購人</span><span>{checkoutInfo?.name}</span></div>
          <div className="flex justify-between pb-4 border-b"><span>聯絡電話</span><span>{checkoutInfo?.phone}</span></div>
          <div className="flex justify-between pb-4 border-b"><span>Line ID</span><span>{checkoutInfo?.lineId || "未填寫"}</span></div>
          <div className="flex justify-between pb-4 border-b"><span>統一編號</span><span>{checkoutInfo?.taxId || "未填寫"}</span></div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between"><span>商品小計</span><span>NT$ {subtotal.toLocaleString()}</span></div>
            
            {/* ✅ 折扣顯示邏輯 */}
            {autoDiscount > 0 && (
              <div className="flex justify-between text-red-500"><span>滿額折抵</span><span>- NT$ {autoDiscount.toLocaleString()}</span></div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-red-500"><span>優惠折扣 ({checkoutInfo.couponCode})</span><span>- NT$ {couponDiscount.toLocaleString()}</span></div>
            )}

            <div className="flex justify-between"><span>運費</span><span>NT$ {shippingFee.toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold pt-2 border-t text-xl text-[#ef9d51]">
              <span>總金額</span><span>NT$ {finalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={isProcessing}
        className={`w-full py-4 rounded-full text-lg font-medium transition-all ${
          isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-[#ef9d51] hover:bg-[#d68a44] text-white"
        }`}
      >
        {isProcessing ? "正在處理訂單，請稍候..." : "確認送出並付款"}
      </button>
      
      {isProcessing && (
        <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
          正在為您跳轉至安全支付頁面，請勿關閉視窗...
        </p>
      )}
    </div>
  );
}