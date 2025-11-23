import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 加入購物車
  const addToCart = (product, quantity = 1, size = "M") => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, size, quantity }];
    });
  };

  // 移除單一商品
  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  // 清空購物車
  const clearCart = () => setCart([]);

  // 增加數量
  const increaseQuantity = (id, size) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // 減少數量
  const decreaseQuantity = (id, size) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
    );
  };

  // 商品總數
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // 計算總金額
  const totalAmountNumber = useMemo(() => {
    return cart.reduce((sum, item) => {
      const numeric = parseInt(String(item.price).replace(/[^0-9]/g, ""), 10) || 0;
      return sum + numeric * item.quantity;
    }, 0);
  }, [cart]);

  const totalAmount = `NT$ ${totalAmountNumber.toLocaleString()}`;

  const value = {
    cart,
    cartCount,
    totalAmount,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart 必須在 CartProvider 中使用");
  return ctx;
}
