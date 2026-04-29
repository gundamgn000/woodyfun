import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./MobileNavbar.css";

export default function MobileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, cart, subtotal } = useCart();
  const { user, authLoading, userRole, logout, userProfile } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const displayName = userProfile?.name || user?.email || "會員";

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate("/");
  };

  const close = () => setDrawerOpen(false);

  return (
    <>
      {/* ── Top Bar ── */}
      <header className="mn-topbar">
        {/* 左：漢堡 */}
        <button
          className="mn-icon-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="開啟選單"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect y="3"  width="22" height="2" rx="1" fill="#6a625d" />
            <rect y="10" width="22" height="2" rx="1" fill="#6a625d" />
            <rect y="17" width="22" height="2" rx="1" fill="#6a625d" />
          </svg>
        </button>

        {/* 中：Logo */}
        <Link to="/" className="mn-logo" aria-label="回首頁">
          <img src="/logo.png" alt="Woodyfun Logo" className="mn-logo-img" />
          <span className="mn-logo-text">木趣小屋</span>
        </Link>

        {/* 右：購物車 */}
        <Link to="/cart" className="mn-icon-btn mn-cart" aria-label="購物車">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
              stroke="#6a625d" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <line x1="3" y1="6" x2="21" y2="6"
              stroke="#6a625d" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M16 10a4 4 0 01-8 0"
              stroke="#6a625d" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          {totalItems > 0 && (
            <span className="mn-cart-badge">{totalItems}</span>
          )}
        </Link>
      </header>

      {/* ── Overlay ── */}
      {drawerOpen && (
        <div className="mn-overlay" onClick={close} aria-hidden="true" />
      )}

      {/* ── Drawer ── */}
      <nav className={`mn-drawer ${drawerOpen ? "mn-drawer--open" : ""}`} aria-label="行動選單">
        {/* Drawer Header */}
        <div className="mn-drawer-header">
          <Link to="/" className="mn-drawer-brand" onClick={close}>
            <img src="/logo.png" alt="Woodyfun" className="mn-drawer-logo" />
            <div>
              <div className="mn-drawer-brand-name">木趣小屋</div>
              <div className="mn-drawer-brand-sub">Woodyfun</div>
            </div>
          </Link>
          <button className="mn-close-btn" onClick={close} aria-label="關閉選單">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1l16 16M17 1L1 17" stroke="#6a625d" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <div className="mn-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mn-nav-item ${isActive ? "mn-nav-item--active" : ""}`}
            onClick={close}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            首頁
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `mn-nav-item ${isActive && !location.search.includes("filter=popular") ? "mn-nav-item--active" : ""}`
            }
            onClick={close}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            所有商品
          </NavLink>

          <NavLink
            to="/products?filter=popular"
            className={() =>
              `mn-nav-item mn-nav-item--fire ${location.search.includes("filter=popular") ? "mn-nav-item--active" : ""}`
            }
            onClick={close}
          >
            <span className="mn-fire-icon">🔥</span>
            熱門商品
          </NavLink>

          {/* 分類 */}
          <div className="mn-section-label">玩具分類</div>
          {["專注力玩具", "拼圖系列", "親子桌遊", "角色扮演"].map((cat) => (
            <NavLink
              key={cat}
              to={`/products?category=${cat}`}
              className="mn-nav-sub"
              onClick={close}
            >
              {cat}
            </NavLink>
          ))}

          <div className="mn-divider" />

          <NavLink
            to="/Wishlist"
            className={({ isActive }) => `mn-nav-item ${isActive ? "mn-nav-item--active" : ""}`}
            onClick={close}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            我的收藏
          </NavLink>

          {/* 購物清單 */}
          <button
            className="mn-nav-item mn-nav-item--btn"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="1.8" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61L23 6H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            購物清單
            {totalItems > 0 && (
              <span className="mn-cart-count">{totalItems}</span>
            )}
          </button>

          {isCartOpen && (
            <div className="mn-cart-preview">
              {cart.length === 0 ? (
                <p className="mn-cart-empty">購物車空空的 🧸</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="mn-cart-row">
                      <span className="mn-cart-name">{item.name}</span>
                      <span className="mn-cart-qty">x{item.quantity}</span>
                    </div>
                  ))}
                  <div className="mn-cart-total">小計 ${subtotal}</div>
                  <Link to="/cart" className="mn-cart-link" onClick={close}>
                    查看購物車
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer：會員 */}
        <div className="mn-footer">
          {!authLoading && user ? (
            <>
              <button
                className="mn-user-toggle"
                onClick={() => setIsUserOpen(!isUserOpen)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Hi, {displayName.split("@")[0]}
              </button>
              {isUserOpen && (
                <div className="mn-user-menu">
                  <NavLink to="/profile" className="mn-user-link" onClick={close}>
                    個人資料 / 訂單
                  </NavLink>
                  {userRole === "admin" && (
                    <NavLink to="/admin" className="mn-user-link" onClick={close}>
                      後台管理
                    </NavLink>
                  )}
                  <button className="mn-user-link mn-logout" onClick={handleLogout}>
                    登出
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              className="mn-login-btn"
              onClick={() => { navigate("/login"); close(); }}
            >
              會員登入
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
