// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isLoggedIn, user, profile, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);

  // 捲動變色
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 顯示用名稱
  const displayName =
    profile?.name || user?.displayName || user?.email || "會員";

  // 固定導航連結（登入/登出分開處理）
  const baseNavItems = [
    { name: "首頁", path: "/" },
    { name: "商品", path: "/products" },
    { name: "新品上架", path: "/new" },
  ];

  // 已登入才顯示「會員中心」
  const loggedInItems = [{ name: "會員中心", path: "/member" }];

  const textColor = isScrolled ? "text-gray-700" : "text-white";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-white shadow-md backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className={`text-3xl font-['Playfair_Display'] tracking-[0.2em] transition-colors duration-300 ${
            isScrolled ? "text-gray-900" : "text-white"
          } hover:text-black`}
          style={{ letterSpacing: "0.15em" }}
        >
          ADIAFOROS
        </Link>

        {/* 右側區塊：選單 + 使用者 + 購物車 */}
        <div className="flex items-center space-x-8">
          {/* 導覽選單 */}
          {baseNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative font-medium transition-all duration-300
                  ${textColor} hover:text-blue-600
                  ${
                    isActive
                      ? "after:w-full text-blue-600"
                      : "after:w-0 hover:after:w-full"
                  }
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                  after:bg-blue-600 after:transition-all after:duration-300
                `}
              >
                {item.name}
              </Link>
            );
          })}

          {/* 已登入才顯示：會員中心 */}
          {isLoggedIn &&
            loggedInItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative font-medium transition-all duration-300
                    ${textColor} hover:text-blue-600
                    ${
                      isActive
                        ? "after:w-full text-blue-600"
                        : "after:w-0 hover:after:w-full"
                    }
                    after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                    after:bg-blue-600 after:transition-all after:duration-300
                  `}
                >
                  {item.name}
                </Link>
              );
            })}

          {/* 使用者狀態區塊 */}
          {isLoggedIn ? (
            <>
              {/* 顯示名稱 */}
              <span
                className={`text-sm ${textColor} hidden sm:inline-block`}
              >
                Hi, {displayName}
              </span>

              {/* 登出按鈕 */}
              <button
                onClick={handleLogout}
                className={`text-sm underline underline-offset-4 ${textColor} hover:text-blue-600`}
              >
                登出
              </button>
            </>
          ) : (
            // 未登入顯示「登入」
            <Link
              to="/login"
              className={`text-sm font-medium ${textColor} hover:text-blue-600`}
            >
              登入
            </Link>
          )}

          {/* 購物車圖示 */}
          <Link
            to="/cart"
            className={`relative flex items-center transition ${textColor}`}
          >
            <FaShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}


































