import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

// 讓其他元件用這個 hook 拿購物車資料
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart 必須在 <CartProvider> 裡使用");
  }
  return ctx;
}

// 依使用者狀態決定 localStorage key（✅ WoodyFun 專用，避免跟其他站互相污染）
function getCartKey(user) {
  return user ? `woodyfun_cart_${user.uid}` : "woodyfun_cart_guest";
}

export function CartProvider({ children }) {
  const { user } = useAuth();

  const cartKey = useMemo(() => getCartKey(user), [user]);

  // 1️⃣ 初始化購物車（依 key 讀取）
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(cartKey);
    return saved ? JSON.parse(saved) : [];
  });

  // 2️⃣ 使用者切換時，自動載入對應購物車
  useEffect(() => {
    const saved = localStorage.getItem(cartKey);
    setCart(saved ? JSON.parse(saved) : []);
  }, [cartKey]);

  // 3️⃣ 同步寫入目前 key
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // 📦 結帳用收件資料
  const [checkoutInfo, setCheckoutInfo] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    paymentMethod: "",
  });

  // ✨ 動畫用
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // ─────────────────────────────
  // 🧮 金額計算（唯一真實來源：subtotal）
  // 產品級原則：運費與總額請各頁面依 utils/shipping.js 計算，避免不同步
  // ─────────────────────────────

  const getSafePrice = (price) => {
    if (price == null) return 0;
    const num = Number(String(price).replace(/[^0-9.]/g, ""));
    return Number.isNaN(num) ? 0 : num;
  };

  const getSafeQty = (item) => {
    // 兼容 quantity / qty，避免資料不一致
    if (typeof item.quantity === "number") return item.quantity;
    if (typeof item.qty === "number") return item.qty;
    const n = Number(item.quantity);
    return Number.isNaN(n) ? 0 : n;
  };

  // 商品小計
  const subtotal = useMemo(() => {
    return Math.round(
      cart.reduce((sum, item) => {
        const price = getSafePrice(item.price);
        const qty = getSafeQty(item);
        return sum + price * qty;
      }, 0)
    );
  }, [cart]);

  // 商品總數量
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + getSafeQty(item), 0);
  }, [cart]);

  // ─────────────────────────────
  // 🧩 購物車操作
  // ─────────────────────────────

  const addToCart = (newItem) => {
    setCart((prev) => {
      const exists = prev.find(
        (item) => item.id === newItem.id && item.size === newItem.size
      );

      let next;
      if (exists) {
        next = prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size
            ? {
                ...item,
                quantity:
                  (Number(item.quantity) || 0) +
                  (Number(newItem.quantity) || 1),
              }
            : item
        );
      } else {
        next = [
          ...prev,
          {
            ...newItem,
            quantity: Number(newItem.quantity) || 1,
          },
        ];
      }

      setLastAddedItem(newItem);
      return next;
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const updateQuantity = (id, size, quantity) => {
    const safeQty = Math.max(1, Number(quantity) || 1);
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: safeQty }
          : item
      )
    );
  };

  const increaseQty = (id, size) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: (Number(item.quantity) || 0) + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id, size) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity: (Number(item.quantity) || 0) - 1 }
            : item
        )
        .filter((item) => (Number(item.quantity) || 0) > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setLastAddedItem(null);
    localStorage.removeItem(cartKey);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,

    increaseQty,
    decreaseQty,
    updateQuantity,

    totalItems,
    subtotal,

    checkoutInfo,
    setCheckoutInfo,

    lastAddedItem,
    setLastAddedItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}