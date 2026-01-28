import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import emailjs from "@emailjs/browser";

export default function CheckoutConfirm() {
 const {
  cart,
  clearCart,
  checkoutInfo,
  subtotal,
  shippingFee,
  totalAmount,
} = useCart();

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  

  // -----------------------------
  // 檢查購物車是否為空
  // -----------------------------
  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl mb-4">購物車是空的</h1>
        <p className="text-gray-600">請先加入商品再進入結帳。</p>
        <Link to="/products" className="text-blue-600 underline mt-4 block">
          前往商品頁
        </Link>
      </div>
    );
  }

  // -----------------------------
  // 檢查登入狀態
  // -----------------------------
  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="py-40 text-center">正在驗證會員身份...</div>;
  }

  // -----------------------------
  // 建立訂單
  // -----------------------------
  const createOrder = async () => {
    console.log("付款方式 =", checkoutInfo.paymentMethod);

    console.log("👉 createOrder 被按到");

    try {
      if (!checkoutInfo || !checkoutInfo.name) {
        alert("收件資料不完整");
        return;
      }

      // 🔑【關鍵修正】組 Email 用的商品文字（原本不存在）
      const itemsText = cart
        .map(
          (item) =>
            `${item.name}（適合年齡：${item.ageRange || "全齡適用"}，數量：${item.quantity}）`
        )
        .join("\n");

      // Firestore 新增訂單
      const orderData = {
        userId: user.uid,
        email: user.email || "",
        createdAt: Timestamp.now(),

        shippingInfo: checkoutInfo,
        paymentMethod: checkoutInfo.paymentMethod,
        status: "pending",

        items: cart.map((item) => ({
          ...item,
          price: parseInt(String(item.price).replace(/[^0-9]/g, ""), 10),
        })),

         subtotal: subtotal,
         shippingFee: shippingFee,
         total: totalAmount,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      // ===============================
      // EmailJS：訂單成立通知
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
            total: totalAmount,
            address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
          },
          "jF4MDMUjdZNpY-Wi8"
        );


        // ===============================
        // EmailJS：賣家（Admin）新訂單通知
        // ===============================
        try {
          await emailjs.send(
            "service_4i7f37e",
            "template_qrt9ay5", // admin_order_notice
            {
              customer_name: checkoutInfo.name,
              customer_email: user.email,
              order_id: orderId,
              created_at: new Date().toLocaleString("zh-TW"),
              items: itemsText,
              payment_method: checkoutInfo.paymentMethod,
              subtotal: subtotal,
              shipping: shippingFee,
              total: totalAmount,
              address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
            },
            "jF4MDMUjdZNpY-Wi8"
          );

          console.log("📧 admin_order_notice（賣家信）已送出");
        } catch (error) {
          console.error("❌ admin_order_notice 寄送失敗", error);
        }

        console.log("📧 EmailJS 訂單成立信已送出");
      } catch (e) {
        console.error("❌ EmailJS 發信失敗", e);
      }

      console.log("📌 Firestore 訂單已建立:", orderId);

      // ✅ 貨到付款（你原本的，保持不變）
      if (checkoutInfo.paymentMethod === "貨到付款") {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
        return;
      }

      // ✅ 信用卡（NewebPay）
      if (checkoutInfo.paymentMethod === "信用卡") {
        try {
          const res = await fetch(
            "https://us-central1-woodyfun-official.cloudfunctions.net/createNewebPayOrder", 
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId,                 // ⭐ Firestore 訂單 ID
                 amount: Math.round(Number(totalAmount)), // ⭐ 後端要的是 amount
                 itemDesc: cart.map(i => i.name).join(" / "), // ⭐ 必填
                 email: user.email || "", 
              }),
            }
          );

          const data = await res.json();

          // 🔴 關鍵：你的後端是回 action + params（不是 html）
          const { ok, action, params  } = data;

          if ( !ok || !action || !params) {
            alert("金流資料異常，請稍後再試");
            return;
          }

          // ✅ 動態建立 form → 導向綠界
          const form = document.createElement("form");
          form.method = "POST";
          form.action = action;

          Object.keys(params).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
          });

          console.log("🚀 redirect to NewebPay", action, params); // ✅ 放這裡

          document.body.appendChild(form);
          form.submit();
          return;
        } catch (err) {
          console.error("❌ NewebPay 金流錯誤:", err);
          alert("信用卡付款失敗，請稍後再試");
          return;
        }
      }

      // ❌ 真的未知的付款方式
      alert("未知付款方式");


    } catch (err) {
      console.error("❌ createOrder 錯誤:", err);
      alert("無法建立訂單");
    }
  };

  

  // -----------------------------
  // UI（完全未動）
  // -----------------------------
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
       {/* ⚠️ 測試階段提示（只影響 UI，不影響狀態） */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm leading-relaxed">
        ⚠️ 本網站目前為測試階段，付款流程僅供系統測試使用，
        本次交易不會實際請款或產生任何費用。
      </div>
      <h1 className="text-3xl font-bold mb-8">訂單確認</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">收件資訊</h2>
        <p className="text-sm text-gray-700">姓名：{checkoutInfo.name}</p>
        <p className="text-sm text-gray-700">電話：{checkoutInfo.phone}</p>
        <p className="text-sm text-gray-700">
          地址：{checkoutInfo.city}{checkoutInfo.district}{checkoutInfo.address}
        </p>
        <p className="text-sm text-gray-700">付款方式：{checkoutInfo.paymentMethod}</p>
      </div>

      <div className="border p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">商品項目</h2>

        {cart.map((item, idx) => {
          const price = parseInt(String(item.price).replace(/[^0-9]/g, ""), 10);
          const lineTotal = price * item.quantity;
          const itemImg =
            item.mainImageUrl ||
            item.image ||
            item.imageUrl ||
            "https://placehold.co/200x200?text=WoodyFun";


          return (
            <div
              key={idx}
              className="flex justify-between items-center py-4 last:border-b-0 border-b border-gray-100"
            >
              {/* 左側：圖片 + 資訊 */}
              <div className="flex items-center gap-4">
                {/* 圖片 */}
                <div className="w-16 h-16 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                  <img
                    src={itemImg}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/200x200?text=WoodyFun";
                    }}
                  />
                </div>

                {/* 商品文字資訊（⬅️ 關鍵：移到圖片外） */}
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-500 text-sm">
                    適合年齡：{item.ageRange || "全齡適用"}／數量：{item.quantity}
                  </p>
                </div>
              </div>

              {/* 右側：金額 */}
              <p className="font-medium text-gray-800">
                NT$ {lineTotal.toLocaleString()}
              </p>
            </div>

          );
        })}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl mb-10 space-y-3">
        {/* 商品小計 */}
        <div className="flex justify-between text-sm text-gray-700">
          <span>商品小計</span>
          <span>NT$ {subtotal.toLocaleString()}</span>
        </div>

        {/* 有商品才顯示運費 */}
        {cart.length > 0 && shippingFee > 0 && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>運費</span>
            <span>NT$ {shippingFee.toLocaleString()}</span>
          </div>
        )}

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-base font-medium">總金額</span>
          <span className="text-2xl font-semibold text-gray-900">
            NT$ {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        className="w-full bg-orange-400 text-white py-4 rounded-full text-base hover:bg-orange-200 active:bg-orange-600 transition"
        onClick={createOrder}
      >
        確認送出訂單
      </button>
      
      <div className="flex justify-center mt-4">
        <button
          onClick={() => navigate("/checkout")}
          className="text-gray-400 text-sm hover:text-gray-600 hover:underline py-2"
        >
          回上一步修改
        </button>
      </div>




      
    </div>

    
  );
}
