import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import "./CartDropdown.css";

const CartDropdown = ({ visible }) => {
  const { cart, removeFromCart } = useCart();

  // 🟪 新增：控制購物袋彈跳動畫
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (visible) {
      setBounce(true);
      setTimeout(() => setBounce(false), 300);
    }
  }, [visible]);

  // 僅顯示最新 4 筆
  const recentItems = cart.slice(-4).reverse();

  const subtotal = recentItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className={`cart-dropdown ${visible ? "show" : ""}`}>
      {/* 🟣 購物袋標題 + 彈跳動畫 */}
      <h4 className={`cart-dropdown-title ${bounce ? "bounce" : ""}`}>
        已加入商品
      </h4>

      {/* 商品清單 */}
      <div className="cart-dropdown-list">
        {recentItems.length === 0 ? (
          <div className="cart-dropdown-empty">購物袋是空的</div>
        ) : (
          recentItems.map((item) => (
            <div className="cart-dropdown-item" key={item.id}>
              
              {/* 商品圖 */}
              <img src={item.image} alt={item.name} />

              {/* 內容 */}
              <div className="cart-dropdown-info">
                <span className="name">{item.name}</span>
                <span className="size">尺寸：{item.size}</span>
                <span className="qty">數量：{item.quantity}</span>
              </div>

              {/* 價格 */}
              <div className="price">NT$ {item.price}</div>

              {/* ❌ 刪除按鈕 */}
              <button
                className="cart-remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="cart-dropdown-footer">
        <div className="subtotal">
          小計：<b>NT$ {subtotal}</b>
        </div>

        <a href="/cart" className="view-cart-btn">查看購物袋</a>
        <a href="/checkout" className="checkout-btn">前往結帳</a>
      </div>
    </div>
  );
};

export default CartDropdown;
