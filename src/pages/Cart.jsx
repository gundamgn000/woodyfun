// src/pages/Cart.jsx (Woodyfun 最終校正版)

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculateShipping, getNow } from "../utils/shipping";

const CartPage = () => {
  const { cart, removeFromCart, clearCart, increaseQty, decreaseQty} = useCart();
  const navigate = useNavigate();

  // Cart 頁尚未選付款方式：活動內=0；活動後用「超商取貨付款」80 當預估運費（避免跟後面頁面不同步）
  const now = getNow();
  const SHIPPING_FEE = calculateShipping("超商取貨付款", now);
  const getQty = (item) => {
    if (typeof item.quantity === "number") return item.quantity;
    if (typeof item.qty === "number") return item.qty;
    return 1;
  };

  // 處理價格（兼容數字與字串格式）
  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price === "string") {
      const num = Number(item.price.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const getLineTotal = (item) => getQty(item) * getPrice(item);

  const computedTotal = (cart || []).reduce(
    (sum, item) => sum + getLineTotal(item),
    0
  );

  const finalTotal = Math.round(computedTotal + SHIPPING_FEE);

  const handleRemove = (item) => {
    if (window.confirm(`確定要將「${item.name}」移出購物籃嗎？`)) {
      removeFromCart(item.id, item.size);
    }
  };

  // 購物車為空的狀態
  if (cart.length === 0) {
    return (
      <div className="lg:pl-[260px] py-40 text-center px-6 min-h-screen flex flex-col justify-center items-center">
        <div className="mb-6 inline-block p-10 bg-gray-50 rounded-full">
           <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
           </svg>
        </div>
        <h1 className="text-2xl font-medium text-gray-800 mb-2">購物車目前空空的</h1>
        <p className="text-gray-500 mb-8">快去為孩子挑選第一份溫暖的木製禮物吧！</p>
        <Link 
          to="/products" 
          className="bg-[#ef9d51] text-white px-8 py-3 rounded-full hover:bg-[#d68a44] transition-all shadow-md"
        >
          探索木育玩具
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:pl-[260px] px-6 py-16 lg:py-24 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">購物車</h1>
          <p className="text-gray-400 mt-2 italic text-sm">Shopping Cart ({cart.length} items)</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* 左：商品列表 */}
          <div className="xl:col-span-2 space-y-8">
            {cart.map((item) => {
              const lineTotal = getLineTotal(item);
              // 自動匹配資料庫欄位，確保圖片顯示
              const itemImg = item.mainImageUrl || item.image || item.imageUrl || "https://placehold.co/200x200?text=No+Image";
              
              return (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex items-start border-b border-gray-50 pb-8 last:border-b-0 group"
                >
                  {/* 圖片展示：縮小並靠左 */}
                  <div className="flex-shrink-0 mr-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = "https://placehold.co/200x200?text=WoodyFun"; }}
                      />
                    </div>
                  </div>

                  {/* 商品資訊區 */}
                  <div className="flex-grow flex flex-col sm:flex-row justify-between min-h-[5rem]">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-[#ef9d51] transition-colors">
                        {item.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* 適合年齡標籤 */}
                        <span className="bg-[#fff7ed] text-[#d68a44] px-3 py-1 rounded-full text-[10px] font-medium border border-[#ffedd5] flex items-center">
                          <span className="mr-1">👶</span>
                          適合年齡：{item.ageRange || "全齡適用"}
                        </span>
                        <div className="flex items-center gap-2 mt-2 bg-gray-50 px-2 py-1 rounded-full">
                          <button
                            onClick={() => decreaseQty(item.id, item.size)}
                            disabled={getQty(item) <= 1}
                            className={`w-7 h-7 flex items-center justify-center rounded-full border
                              ${getQty(item) <= 1
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"}
                            `}
                          >
                            −
                          </button>


                          <span className="min-w-[28px] text-center text-sm font-medium">
                            {getQty(item)}
                          </span>

                          <button
                            onClick={() => increaseQty(item.id, item.size)}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                      </div>
                      
                      <p className="text-gray-400 text-xs mt-3 italic">
                        單價 NT$ {getPrice(item).toLocaleString()}
                      </p>
                    </div>

                    {/* 右側：價格與移除按鈕 */}
                    <div className="flex flex-col justify-between items-end mt-4 sm:mt-0 sm:pl-4">
                      <p className="font-bold text-xl text-gray-800">
                        NT$ {lineTotal.toLocaleString()}
                      </p>
                      <button
                        className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center group/btn font-medium"
                        onClick={() => handleRemove(item)}
                      >
                        <span className="mr-1 group-hover/btn:underline">移除商品</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 右：結帳總覽卡片 */}
          <div className="xl:col-span-1">
            <div className="lg:sticky lg:top-24 border border-gray-100 rounded-3xl p-8 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                訂單摘要
                <div className="ml-2 h-1 w-8 bg-[#ef9d51] rounded-full"></div>
              </h2>

              <div className="space-y-4 mb-8 text-gray-600">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-light">商品合計 Subtotal</span>
                  <span className="font-medium text-gray-800">NT$ {computedTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-light">預估運費 Shipping</span>
                  <span className="font-medium text-gray-800">
                    NT$ {SHIPPING_FEE.toLocaleString("zh-TW")}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-6 flex justify-between items-center mb-8">
                <span className="text-gray-800 font-bold">應付總額 Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#ef9d51]">
                    NT$ {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 前往結帳按鈕 */}
              <button
                className="w-full bg-[#ef9d51] text-white py-4 rounded-full text-lg font-medium hover:bg-[#d68a44] transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
                onClick={() => navigate("/checkout")}
              >
                前往結帳 Checkout
              </button>

              {/* 清空購物車按鈕：樣式同步 */}
              <button
                className="w-full mt-4 bg-gray-100 text-gray-500 py-4 rounded-full text-sm font-medium hover:bg-gray-200 transition-all active:scale-[0.98]"
                onClick={() => {
                  if (window.confirm("確定要清空購物籃中所有商品嗎？")) {
                    clearCart();
                  }
                }}
              >
                清空購物車 CLEAR ALL
              </button>
              
              {/* 中文品牌標語 */}
              <div className="mt-8 p-6 bg-[#fffcf9] rounded-2xl border border-orange-50">
                  <p className="text-[12px] text-[#d68a44] leading-relaxed text-center font-medium">
                    「 每一件木製玩具，都承載著自然的溫度與成長的故事 」
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;