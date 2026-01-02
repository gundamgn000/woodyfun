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
            `${item.name}（尺寸：${item.size}，數量：${item.quantity}）`
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
          "service_ra9779e",
          "template_jdanagy",
          {
            customerName: checkoutInfo.name,
            orderId: orderId,
            orderDate: new Date().toLocaleString("zh-TW"),
            items: itemsText,
            payment: checkoutInfo.paymentMethod,
            total: totalAmount,
            address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
            email: user.email,
          },
          "_0T9aM48V9I1olpb9"
        );


        // ===============================
        // EmailJS：賣家（Admin）新訂單通知
        // ===============================
        try {
          await emailjs.send(
            "service_ra9779e",
            "template_hr9jbus", // admin_order_notice
            {
              orderId: orderId,
              orderDate: new Date().toLocaleString("zh-TW"),
              customerName: checkoutInfo.name,
              email: user.email, // 買家 email（顯示用）
              items: itemsText,
              payment: checkoutInfo.paymentMethod,
              total: Math.round(Number(totalAmount)),
              address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
            },
            "_0T9aM48V9I1olpb9"
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

      // ✅ 信用卡（綠界）
      if (checkoutInfo.paymentMethod === "信用卡") {
        try {
          const res = await fetch("http://localhost:3000/api/ecpay/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,                 // ⭐ Firestore 訂單 ID
              totalAmount: Math.round(Number(totalAmount)), // ⭐ 一定是整數
            }),
          });

          const data = await res.json();

          // 🔴 關鍵：你的後端是回 action + params（不是 html）
          const { action, params } = data;

          if (!action || !params) {
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

          document.body.appendChild(form);
          form.submit();
          return;
        } catch (err) {
          console.error("❌ 信用卡金流錯誤:", err);
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
      <h1 className="text-3xl font-bold mb-8">訂單確認</h1>

      <div className="border p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">收件資訊</h2>
        <p>姓名：{checkoutInfo.name}</p>
        <p>電話：{checkoutInfo.phone}</p>
        <p>
          地址：{checkoutInfo.city}
          {checkoutInfo.district}
          {checkoutInfo.address}
        </p>
        <p>付款方式：{checkoutInfo.paymentMethod}</p>
      </div>

      <div className="border p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">商品項目</h2>

        {cart.map((item, idx) => {
          const price = parseInt(String(item.price).replace(/[^0-9]/g, ""), 10);
          const lineTotal = price * item.quantity;

          return (
            <div key={idx} className="flex justify-between py-3 border-b">
              <div className="flex space-x-4">
                <img
                  src={item.image}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm">
                    尺寸：{item.size}／數量：{item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-semibold">
                NT$ {lineTotal.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border p-6 rounded-xl bg-gray-50 mb-8 space-y-3">
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

        <div className="border-t pt-4 flex justify-between text-xl font-bold">
          <span>總金額</span>
          <span className="text-red-600">
            NT$ {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>


      <button
        className="w-full bg-pink-600 text-white py-3 rounded-lg"
        onClick={createOrder}
      >
        確認送出訂單
      </button>
    </div>
  );
}
