import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { totalItems, cart, subtotal } = useCart();
  const { user, authLoading, userRole, logout, userProfile } = useAuth();

  const [setDynamicCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = userProfile?.name || user?.email || "會員";
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const cats = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category) cats.add(data.category);
      });
      setDynamicCategories(Array.from(cats));
    };
    fetchCategories();
  }, [setDynamicCategories]);

  return (
    <>
      {/* =========================
          Mobile Top Navbar
         ========================= */}
      <div className="mobile-navbar">
        {/* 左：漢堡 */}
        <button
          className="mobile-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="開啟選單"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect y="3" width="22" height="2" rx="1" fill="#6a625d" />
            <rect y="10" width="22" height="2" rx="1" fill="#6a625d" />
            <rect y="17" width="22" height="2" rx="1" fill="#6a625d" />
          </svg>
        </button>

        {/* 中：Logo 置中 */}
        <Link to="/" className="mobile-navbar-logo">
          <img src="/logo.png" alt="Woodyfun" className="mobile-navbar-logo-img" />
          <span className="mobile-navbar-logo-text">木趣小屋</span>
        </Link>

        {/* 右：購物車 */}
        <Link to="/cart" className="mobile-cart" aria-label="購物車">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
              stroke="#6a625d"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="3" y1="6" x2="21" y2="6" stroke="#6a625d" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M16 10a4 4 0 01-8 0"
              stroke="#6a625d"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {totalItems > 0 && (
            <span className="mobile-cart-badge">{totalItems}</span>
          )}
        </Link>
      </div>

      {/* =========================
          Desktop Sidebar / Mobile Drawer
         ========================= */}
      <aside
        className={`fixed left-0
        top-[56px] md:top-0
        h-[calc(100vh-56px)] md:h-screen
        w-[260px]
        bg-[#faf9f6] border-r border-gray-100
        flex flex-col z-50 p-4 md:p-6
        overflow-y-auto transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex flex-col items-center gap-2 mb-12 mt-4 no-underline"
          onClick={() => setMenuOpen(false)}
        >
          <img src="/logo.png" alt="Woodyfun Logo" className="h-16 w-auto" />
          <div className="text-center">
            <div className="text-xl tracking-[0.15em] font-bold text-[#6a625d]">
              木趣小屋
            </div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#94a672] font-semibold">
              Woodyfun
            </div>
          </div>
        </Link>

        {/* 主導覽 */}
        <nav className="flex flex-col gap-2 flex-grow">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-side-link ${isActive ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            首頁
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-side-link ${isActive && !location.search.includes("filter=popular") ? "active" : ""}`
            }
            onClick={() => setMenuOpen(false)}
          >
            所有商品
          </NavLink>

          <NavLink
            to="/products?filter=popular"
            className={() =>
              `nav-side-link ${
                location.search.includes("filter=popular")
                  ? "active text-[#ef9d51] font-bold"
                  : "text-[#f39c42]"
              }`
            }
            onClick={() => setMenuOpen(false)}
          >
            🔥 熱門商品
          </NavLink>

          {/* 分類 */}
          <div className="flex flex-col gap-1 mt-4 pl-4 border-l-2 border-gray-100">
            <span className="text-[11px] text-gray-400 tracking-widest mb-2 uppercase">
              玩具分類
            </span>
            {["專注力玩具", "拼圖系列", "親子桌遊", "角色扮演"].map((cat) => (
              <NavLink
                key={cat}
                to={`/products?category=${cat}`}
                className="text-sm text-[#6a625d] hover:text-[#f39c42] py-1.5 no-underline"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </NavLink>
            ))}
          </div>
        </nav>

        <NavLink
          to="/Wishlist"
          className={({ isActive }) => `nav-side-link ${isActive ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          我的收藏
        </NavLink>

        {/* 底部功能 */}
        <div className="border-t border-gray-200 pt-6 mt-auto flex flex-col gap-2">
          {/* 購物車 */}
          <div
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex items-center justify-between text-[#6a625d] cursor-pointer hover:bg-white/60 p-2 rounded-xl"
          >
            <span className="text-sm font-medium">購物清單</span>
            {totalItems > 0 && (
              <span className="bg-[#f39c42] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </div>

          {isCartOpen && (
            <div className="bg-white/50 rounded-xl p-3 border shadow-sm">
              {cart.length === 0 ? (
                <div className="text-center text-xs text-gray-400">
                  購物車空空的 🧸
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="text-xs truncate">
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                  <div className="mt-2 text-right text-sm font-bold text-[#f39c42]">
                    ${subtotal}
                  </div>
                  <Link
                    to="/cart"
                    className="block mt-2 bg-[#f39c42] text-white text-center text-xs py-2 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    查看購物車
                  </Link>
                </>
              )}
            </div>
          )}

          {/* 會員 */}
          {!authLoading && user ? (
            <>
              <div
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="cursor-pointer text-sm p-2 rounded-xl hover:bg-white/60"
              >
                Hi, {displayName.split("@")[0]}
              </div>
              {isUserOpen && (
                <div className="pl-4 text-xs flex flex-col gap-1">
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                    個人資料 / 訂單
                  </NavLink>
                  {userRole === "admin" && (
                    <NavLink to="/admin">後台管理</NavLink>
                  )}
                  <button onClick={handleLogout} className="text-left text-red-600">
                    登出
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-[#f39c42] text-white text-sm py-2 rounded-xl"
            >
              會員登入
            </button>
          )}
        </div>
      </aside>

      {/* 手機遮罩 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
