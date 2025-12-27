import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
  totalItems,
  cart,
  subtotal,
  shippingFee,
  totalAmount
} = useCart();


  // ✅ 關鍵修正：用 user + authLoading
  const { user, authLoading, userRole, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);

  const isHome = location.pathname === "/";
  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "會員";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const updateNavbarState = () => {
      if (isHome) {
        setScrolled(window.scrollY > 20);
      } else {
        setScrolled(true);
      }
    };

    updateNavbarState();
    window.addEventListener("scroll", updateNavbarState);
    return () => window.removeEventListener("scroll", updateNavbarState);
  }, [isHome]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const cats = querySnapshot.docs.map(doc => doc.data().category);
        // 使用 Set 過濾重複項目，並移除空值或「全部」
        const uniqueCats = [...new Set(cats)].filter(c => c && c !== "全部");
        setDynamicCategories(uniqueCats);
      } catch (error) {
        console.error("抓取分類失敗:", error);
      }
    };
    fetchCategories();
  }, []);

  

  return (
    <>
      <header
        className={`navbar ${
          scrolled ? "navbar-scrolled" : "navbar-top"
        }`}
      >
        <Link to="/" className="navbar-logo font-serif tracking-[0.2em] text-xl">
          ADIAFOROS
        </Link>

        {/* 桌機選單 */}
        <div className="navbar-right desktop-menu">
          <nav className="navbar-links flex gap-10">
            <NavLink to="/">首頁</NavLink>
            <div className="nav-item-dropdown">
            <NavLink to="/products" className="nav-main-link">
              商品
            </NavLink>
            
            {/* 下拉夾層區塊 */}
            <div className="nav-submenu">
              <NavLink to="/products/new">新品上架</NavLink>
              {/* 未來可以在這裡輕鬆新增：熱銷排行、分類等 */}
              {/* <NavLink to="/products/sale">SALE / 優惠活動</NavLink> */}
              {/* 這裡就是動態生成的地方 */}
              {dynamicCategories.map((cat) => (
                <NavLink 
                  key={cat} 
                  to={`/products?category=${cat}`}
                  // ✅ 加入這行，點擊時強制導向該網址
                  onClick={() => navigate(`/products?category=${cat}`)} 
                >
                {cat.toUpperCase()}
              </NavLink>
              ))}
            </div>
          </div>
          {/* --- 商品夾層結束 --- */}
                  
            {/* --- 會員中心夾層 --- */}
            <div className="nav-item-dropdown">
              <NavLink to="/profile" className="nav-main-link">
               會員中心
              </NavLink>
              
              {/* 會員中心下拉夾層 */}
              <div className="nav-submenu-centered">
                <NavLink to="/profile">個人資料</NavLink>
                <NavLink to="/profile/edit"> 編輯資料</NavLink>
                <NavLink to="/profile/password"> 修改密碼</NavLink>
                <NavLink to="/wishlist"> 我的收藏</NavLink>
                <NavLink to="/orders"> 歷史訂單</NavLink>
              </div>
            </div>

            {!authLoading && user && userRole === "admin" && (
              <NavLink to="/admin">後台</NavLink>
            )}
          </nav>

          {/* ⭐ 這段是重點 */}
          {authLoading ? null : user ? (
            <>
              <span className="navbar-user">Hi, {displayName}</span>
              <button className="navbar-button" onClick={handleLogout}>
                登出
              </button>
            </>
          ) : (
            <>
              <button
                className="navbar-button"
                onClick={() => navigate("/login")}
              >
                會員登入
              </button>
              <button
                className="navbar-button"
                onClick={() => navigate("/register")}
              >
                註冊
              </button>
            </>
          )}

          

          {/* --- 購物車預覽區塊：精準修正版 --- */}
          <div className="nav-item-dropdown">
            <NavLink to="/cart" className="navbar-cart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {totalItems > 0 && <span className="navbar-cart-badge">{totalItems}</span>}
            </NavLink>

            {/* 下拉抽屜本體：確保所有內容都在這裡面 */}
            <div className="nav-submenu-right cart-preview-box">
              <div className="cart-preview-title">SHOPPING BAG</div>
              
              <div className="cart-preview-items">
                {cart && cart.length > 0 ? (
                  cart.slice(0, 3).map((item) => (
                    <div className="cart-preview-item" key={`${item.id}-${item.size}`}>
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-qty-price">
                        {item.quantity} x NT$ {Number(item.price || 0).toLocaleString()}
                      </span>
                    </div>
                ))
              ) : (
                <div className="cart-empty-msg">購物袋是空的</div>
              )}
            </div>

              <div className="cart-preview-divider"></div>

              {/* 商品小計 */}
              <div className="cart-preview-row">
                <span>商品小計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>

              {/* ✅ 只有購物車內有商品才顯示運費 */}
              {cart.length > 0 && shippingFee > 0 && (
                <div className="cart-preview-row">
                  <span>運費</span>
                  <span>NT$ {shippingFee.toLocaleString()}</span>
                </div>
              )}

              {/* 總金額 */}
              <div className="cart-preview-total">
                <span>總金額</span>
                <span>NT$ {totalAmount.toLocaleString()}</span>
              </div>

              <button
                className="cart-preview-btn"
                onClick={() => navigate("/cart")}
              >
                VIEW BAG / 結帳
              </button>

              
            </div> 
          </div>
        </div>
                  


        {/* 手機漢堡 */}
        <button
          className="hamburger-btn mobile-only"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      </header>

      {/* 手機側欄 */}
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button
          className="close-btn"
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>

        <nav className="mobile-links">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            首頁
          </NavLink>
          <NavLink
            to="/products"
            onClick={() => setMenuOpen(false)}
          >
            商品
          </NavLink>
          <NavLink
            to="/products/new"
            onClick={() => setMenuOpen(false)}
          >
            新品上架
          </NavLink>
          <NavLink
            to="/profile"
            onClick={() => setMenuOpen(false)}
          >
            會員中心
          </NavLink>

          {user && userRole === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setMenuOpen(false)}
            >
              後台管理
            </NavLink>
          )}

          <NavLink
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="mobile-cart-link"
          >
            <span>購物袋</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>

            

            {totalItems > 0 && (
              <span className="navbar-cart-badge">
                {totalItems}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="mobile-auth-area">
          {authLoading ? null : user ? (
            <>
              <div>Hi, {displayName}</div>
              <button className="mobile-btn" onClick={handleLogout}>
                登出
              </button>
            </>
          ) : (
            <>
              <button
                className="mobile-btn"
                onClick={() => navigate("/login")}
              >
                會員登入
              </button>
              <button
                className="mobile-btn"
                onClick={() => navigate("/register")}
              >
                註冊
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
