import React, { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ===== 桌機 Sidebar ===== */}
      <aside
        className="
          hidden md:flex flex-col
          w-64 h-screen bg-white shadow-lg
          px-6 py-8 fixed left-0 top-0 z-40
        "
      >
        <h2 className="text-2xl font-bold mb-10 tracking-wide">後台</h2>

        <nav className="flex flex-col gap-4">
          <Link to="/admin" className="sidebar-item">後台首頁</Link>
          <Link to="/admin/dashboard" className="sidebar-item">Dashboard</Link>
          <Link to="/admin/products" className="sidebar-item">商品管理</Link>
          <Link to="/admin/products/new" className="sidebar-item">新增商品</Link>
          <Link to="/admin/orders" className="sidebar-item">訂單管理</Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 text-red-500 hover:text-red-600"
        >
          <FiLogOut /> 登出
        </button>
      </aside>

      {/* ===== 手機浮動按鈕 ===== */}
      <button
        onClick={toggleMenu}
        className={`
          md:hidden fixed z-[9999]
          left-5 bottom-5
          w-14 h-14 rounded-full bg-white shadow-2xl border
          flex items-center justify-center text-2xl
          transition-all duration-300
          ${isOpen ? "translate-x-64 -translate-y-24 scale-90" : ""}
        `}
      >
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </button>

      {/* ===== 手機遮罩 ===== */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black/30 z-50"
        />
      )}

      {/* ===== 手機 Sidebar ===== */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-[55]
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col px-6 py-10
        `}
      >
        <nav className="flex flex-col gap-4 text-lg">
          <Link onClick={toggleMenu} to="/admin">後台首頁</Link>
          <Link onClick={toggleMenu} to="/admin/dashboard">Dashboard</Link>
          <Link onClick={toggleMenu} to="/admin/products">商品管理</Link>
          <Link onClick={toggleMenu} to="/admin/products/new">新增商品</Link>
          <Link onClick={toggleMenu} to="/admin/orders">訂單管理</Link>
        </nav>

        <button
          onClick={() => {
            toggleMenu();
            handleLogout();
          }}
          className="mt-10 flex items-center gap-2 text-red-500"
        >
          <FiLogOut /> 登出
        </button>
      </aside>

      {/* ===== 主內容（關鍵） ===== */}
      <main className="flex-1 md:ml-64 px-6 pt-20 pb-10">
        {/* 🔥 所有 /admin 底下子頁面都會在這裡顯示 */}
        <Outlet />
      </main>

    {/* ==============================
          小樣式（原本就有的）
      =============================== */}
      <style>{`
        .sidebar-item {
          padding: 10px 4px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          color: #333;
          transition: 0.2s;
        }
        .sidebar-item:hover {
          background: #f3f3f3;
        }
        .mobile-item {
          padding: 12px 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn .25s ease-out;
        }
      `}</style>

    </div>
  );
};

export default AdminLayout;
