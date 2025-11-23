import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  // 表單資料
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "credit-card",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitOrder = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("請完整填寫收件資訊");
      return;
    }

    // 送出訂單
    clearCart();
    navigate("/order-success");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* 標題 */}
      <h1 className="text-4xl font-['Playfair_Display'] tracking-wide text-gray-900 mb-12 text-center">
        結帳資訊
      </h1>

      {/* 主容器 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* ===== 左側：收件資訊 ===== */}
        <div className="md:col-span-2 bg-white border border-gray-300 rounded-xl shadow-sm p-8">

          <h2 className="text-xl font-['Playfair_Display'] mb-6">
            收件人資訊
          </h2>

          {/* 姓名 */}
          <div className="mb-5">
            <label className="block text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              name="name"
              placeholder="請輸入收件人姓名"
              value={formData.name}
              onChange={handleChange}
              className="
                w-full px-4 py-3 border border-gray-300 rounded-md
                focus:outline-none focus:border-gray-500 transition
              "
            />
          </div>

          {/* 電話 */}
          <div className="mb-5">
            <label className="block text-gray-700 mb-2">電話</label>
            <input
              type="text"
              name="phone"
              placeholder="請輸入收件人電話"
              value={formData.phone}
              onChange={handleChange}
              className="
                w-full px-4 py-3 border border-gray-300 rounded-md
                focus:outline-none focus:border-gray-500 transition
              "
            />
          </div>

          {/* 地址 */}
          <div className="mb-5">
            <label className="block text-gray-700 mb-2">收件地址</label>
            <textarea
              name="address"
              placeholder="請輸入完整地址"
              value={formData.address}
              onChange={handleChange}
              className="
                w-full px-4 py-3 border border-gray-300 rounded-md
                focus:outline-none focus:border-gray-500 transition
              "
              rows="3"
            ></textarea>
          </div>

          {/* 付款方式 */}
          <div className="mb-5">
            <label className="block text-gray-700 mb-2">付款方式</label>

            <select
              name="payment"
              value={formData.payment}
              onChange={handleChange}
              className="
                w-full px-4 py-3 border border-gray-300 rounded-md
                bg-white text-gray-800
                focus:outline-none focus:border-gray-500 transition
              "
            >
              <option value="credit-card">信用卡付款</option>
              <option value="line-pay">LINE Pay</option>
              <option value="cod">貨到付款</option>
            </select>
          </div>
        </div>

        {/* ===== 右側：訂單摘要 ===== */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-8 h-max sticky top-24">

          <h2 className="text-xl font-['Playfair_Display'] mb-6">
            訂單摘要
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-600">購物車目前沒有商品。</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3 mb-3"
                >
                  <span className="text-gray-800">{item.name} × {item.quantity}</span>
                  <span className="text-gray-700">{item.price}</span>
                </div>
              ))}

              <div className="flex justify-between mt-6 mb-10 text-lg font-semibold">
                <span className="text-gray-800">總計</span>
                <span className="text-gray-900">{totalAmount}</span>
              </div>

              <button
                onClick={submitOrder}
                className="
                  w-full py-3 bg-black text-white rounded-full shadow
                  hover:bg-gray-800 transition text-sm tracking-wide
                "
              >
                提交訂單
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
