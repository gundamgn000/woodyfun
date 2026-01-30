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

  // 檢查購物車
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

  useEffect(() => {
    if (!loading && !user) {
      alert("請先登入會員才能結帳");
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="py-40 text-center">正在驗證會員身份...</div>;
  }

  const createOrder = async () => {
    try {
      if (!checkoutInfo || !checkoutInfo.name) {
        alert("收件資料不完整");
        return;
      }

      const itemsText = cart
        .map((item) => `${item.name}（數量：${item.quantity}）`)
        .join("\n");

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
        subtotal,
        shippingFee,
        total: totalAmount,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      // EmailJS 通知 (客戶 & 賣家)
      try {
        const emailParams = {
          customer_name: checkoutInfo.name,
          customer_email: user.email,
          order_id: orderId,
          created_at: new Date().toLocaleString("zh-TW"),
          items: itemsText,
          subtotal,
          shipping: shippingFee,
          payment_method: checkoutInfo.paymentMethod,
          total: totalAmount,
          address: `${checkoutInfo.city}${checkoutInfo.district}${checkoutInfo.address}`,
        };

        await emailjs.send("service_4i7f37e", "template_ig9xw2j", emailParams, "jF4MDMUjdZNpY-Wi8");
        await emailjs.send("service_4i7f37e", "template_qrt9ay5", emailParams, "jF4MDMUjdZNpY-Wi8");
      } catch (e) {
        console.error("📧 Email 寄送失敗:", e);
      }

      // 付款跳轉
      if (checkoutInfo.paymentMethod === "貨到付款") {
        clearCart();
        navigate(`/checkout/success/${orderId}`);
      } else if (checkoutInfo.paymentMethod === "信用卡") {
        const res = await fetch(
          "https://us-central1-woodyfun-official.cloudfunctions.net/createNewebPayOrder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              amount: Math.round(totalAmount),
              itemDesc: "WoodyFun 官網訂單",
              email: user.email || "",
            }),
          }
        );

        const data = await res.json();
        if (!data.ok) throw new Error("金流初始化失敗");

        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.action;

        Object.keys(data.params).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.params[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      console.error("❌ 建立訂單失敗:", err);
      alert("無法建立訂單，請檢查網路連線");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm">
        ⚠️ 本網站目前為測試階段，付款流程僅供系統測試使用。
      </div>
      <h1 className="text-3xl font-bold mb-8">訂單確認</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">收件資訊</h2>
        <p className="text-sm">姓名：{checkoutInfo.name}</p>
        <p className="text-sm">電話：{checkoutInfo.phone}</p>
        <p className="text-sm">地址：{checkoutInfo.city}{checkoutInfo.district}{checkoutInfo.address}</p>
        <p className="text-sm">付款方式：{checkoutInfo.paymentMethod}</p>
      </div>

      <div className="border p-6 rounded-xl mb-8 space-y-4">
        <h2 className="text-xl font-semibold mb-4">商品項目</h2>
        {cart.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-4">
              <img src={item.mainImageUrl || "https://placehold.co/100x100"} alt={item.name} className="w-16 h-16 rounded object-cover" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500 text-sm">數量：{item.quantity}</p>
              </div>
            </div>
            <p className="font-medium">NT$ {(parseInt(String(item.price).replace(/[^0-9]/g, "")) * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl mb-10 space-y-3">
        <div className="flex justify-between text-sm"><span>商品小計</span><span>NT$ {subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span>運費</span><span>NT$ {shippingFee.toLocaleString()}</span></div>
        <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
          <span>總金額</span><span>NT$ {totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <button onClick={createOrder} className="w-full bg-orange-400 text-white py-4 rounded-full text-lg hover:bg-orange-500 transition">
        確認送出訂單
      </button>

      <div className="text-center mt-4">
        <button onClick={() => navigate("/checkout")} className="text-gray-400 text-sm hover:underline">回上一步修改</button>
      </div>
    </div>
  );
}