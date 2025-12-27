// src/pages/CheckoutConfirm.jsx (請用此內容覆蓋)

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CheckoutConfirm() {
  const { cart, clearCart, checkoutInfo, totalAmountNumber } = useCart();
  // ✅ 修正：解構 user 和 loading
  const { user, loading } = useAuth(); 
  const navigate = useNavigate();

  // 1. 如果購物車是空的，直接顯示錯誤或導向
  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl mb-4">購物車是空的</h1>
        <p className="text-gray-600">請先選購商品後再進行結帳。</p>
        <Link to="/products" className="text-blue-600 underline mt-4 block">
          前往商品列表
        </Link>
      </div>
    );
  }

  // 2. 🚨 檢查 AuthContext 是否還在讀取中
  if (loading) {
    return <div className="py-40 text-center">正在確認會員狀態...</div>;
  }
  
  // 3. 🚨 如果資料不齊全 (例如用戶直接跳轉，或資訊未填寫)，導回填寫頁
  if (!checkoutInfo.name || !checkoutInfo.paymentMethod) {
    alert("請先完成結帳資訊填寫");
    navigate("/checkout");
    return null; // 返回 null 或 loading state 防止渲染錯誤
  }


  const createOrder = async () => {
    // 檢查用戶是否登入
    if (!user) { // 將 currentUser 改為 user
      alert("請先登入");
      navigate("/login");
      return;
    }

    try {
      const orderData = {
        // 使用修正後的 user 變數
        userId: user.uid,
        email: user.email,
        createdAt: Timestamp.now(),

        // 新的訂單資料結構
        shippingInfo: {
          name: checkoutInfo.name,
          phone: checkoutInfo.phone,
          city: checkoutInfo.city,
          district: checkoutInfo.district,
          address: checkoutInfo.address,
        },

        paymentMethod: checkoutInfo.paymentMethod,
        status: "pending",

        // 商品項目
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
        })),

        subtotal: totalAmountNumber,
        shippingFee: 0,
        total: totalAmountNumber,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      // 成功後清空購物車並導向成功頁
      clearCart();
      navigate(`/checkout/success/${docRef.id}`);

    } catch (error) {
      console.error("建立訂單失敗：", error);
      alert("訂單建立失敗，請稍後再試一次。");
    }
  };


  // 檢查資料是否完整 (防止跳頁) - 這裡再次檢查，如果缺少重要欄位，提醒用戶
  const isFormComplete = checkoutInfo.name && checkoutInfo.phone && checkoutInfo.address && checkoutInfo.paymentMethod;
  
  if (!isFormComplete) {
    // 這個 if 區塊主要是預防性的，上面的 useEffect 應該已經處理了
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl mb-4">結帳資訊不完整</h1>
        <p className="text-gray-600">請返回上一步填寫完整資料。</p>
        <Link to="/checkout" className="text-blue-600 underline mt-4 block">
          返回結帳頁
        </Link>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl mb-8">訂單確認</h1>

      {/* 收件資訊 */}
      <div className="border p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">收件資訊</h2>
        <p>姓名：{checkoutInfo.name}</p>
        <p>電話：{checkoutInfo.phone}</p>
        <p>地址：{checkoutInfo.city + checkoutInfo.district + checkoutInfo.address}</p>
        <p>付款方式：{checkoutInfo.paymentMethod}</p>
      </div>

      {/* 購物車商品列表 */}
      <div className="border p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">商品項目</h2>
        {cart.map((item, index) => (
          <div key={`${item.id}-${item.size}-${index}`} className="flex justify-between items-center border-b py-3 last:border-b-0">
            <div className="flex items-center space-x-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  尺寸: {item.size} / 數量: {item.quantity}
                </p>
              </div>
            </div>
            <p className="font-semibold">
              NT$ {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* 總金額 */}
      <div className="border p-6 rounded-xl bg-gray-50 mb-8">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>總金額</span>
          <span className="text-red-600">
            NT$ {totalAmountNumber.toLocaleString()}
          </span>
        </div>
      </div>

      <button 
        className="w-full bg-pink-600 text-white py-3 rounded-full text-lg hover:bg-pink-700 transition"
        onClick={createOrder}
      >
        確認下單 (NT$ {totalAmountNumber.toLocaleString()})
      </button>

      <p className="text-center mt-4 text-sm text-gray-500">點擊確認下單即表示您同意我們的購買條款。</p>
    </div>
  );
}