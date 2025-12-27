// src/pages/Cart.jsx (請用此內容覆蓋)

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cart, totalAmountNumber, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // ✅ 運費（只新增這一行）
  const SHIPPING_FEE = 80;

  // 取得數量（兼容 quantity / qty）
  const getQty = (item) => {
    if (typeof item.quantity === "number") return item.quantity;
    if (typeof item.qty === "number") return item.qty;
    return 1;
  };

  // 處理價格欄位，確保是數字
  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price === "string") {
      const num = Number(item.price.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const getLineTotal = (item) => getQty(item) * getPrice(item);

  // 商品小計
  const computedTotal = (cart || []).reduce(
    (sum, item) => sum + getLineTotal(item),
    0
  );

  // ✅ 最終總金額（只改這裡）
  const finalTotal = computedTotal + SHIPPING_FEE;

  const handleRemove = (item) => {
    if (window.confirm(`確定移除 ${item.name} (${item.size}) 嗎？`)) {
      removeFromCart(item.id, item.size);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-40 text-center">
        <h1 className="text-3xl mb-4">購物車是空的</h1>
        <p className="text-gray-600">請先選購商品後再進行結帳。</p>
        <Link to="/products" className="text-blue-600 underline mt-4 block">
          前往商品列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-light mb-10">購物車 ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左：商品列表 */}
        <div className="lg:col-span-2">
          {cart.map((item) => {
            const lineTotal = getLineTotal(item);
            return (
              <div
                key={`${item.id}-${item.size}`}
                className="flex items-start border-b py-6 last:border-b-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg mr-6"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">尺寸：{item.size}</p>
                  <p className="text-sm text-gray-500">數量：{getQty(item)}</p>
                  <p className="font-semibold mt-1">
                    NT$ {getPrice(item).toLocaleString()} / 件
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl mb-4">
                    NT$ {lineTotal.toLocaleString()}
                  </p>
                  <button
                    className="text-sm text-red-500 hover:text-red-700"
                    onClick={() => handleRemove(item)}
                  >
                    移除
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 右：結帳總覽 */}
        <div className="border rounded-xl p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">訂單摘要</h2>

          <div className="flex justify-between text-sm mb-2">
            <span>商品金額</span>
            <span>NT$ {computedTotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm mb-4">
            <span>運費</span>
            <span>NT$ {SHIPPING_FEE}</span>
          </div>

          <div className="border-t pt-4 flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">總金額</span>
            <span className="text-2xl font-bold text-pink-600">
              NT$ {finalTotal.toLocaleString()}
            </span>
          </div>

          <button
            className="w-full bg-black text-white py-3 rounded-full text-lg"
            onClick={() => navigate("/checkout")}
          >
            前往結帳（第1步）
          </button>

          <button
            className="w-full border border-gray-400 text-gray-700 py-3 rounded-full text-sm tracking-widest hover:bg-gray-100 mt-3"
            onClick={() => {
              if (window.confirm("確定清空購物車嗎？")) {
                clearCart();
              }
            }}
          >
            清空購物車
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
