import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminSidebar() {
  // ✅ 從 localStorage 讀取初始狀態
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("adminSidebarOpen");
    return saved === "true";
  });

  // ✅ 狀態變化時同步寫入 localStorage
  useEffect(() => {
    localStorage.setItem("adminSidebarOpen", open);
  }, [open]);

  return (
    <>
      {/* ✅ 手機：左下角「拉門把手」 */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 left-4 z-[60]
          w-12 h-12 rounded-full
          bg-white border shadow-lg
          flex items-center justify-center
          text-xl
          md:hidden
        "
        aria-label="Open admin sidebar"
      >
        ≡
      </button>

      {/* ✅ 遮罩（點擊關閉） */}
      {open && (
        <div
          className="
            fixed inset-0 z-[50]
            bg-black/30
            transition-opacity duration-300
            md:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* ✅ Sidebar 主體 */}
      <aside
        className={`
          fixed top-0 left-0 z-[55]
          h-screen w-64
          bg-white border-r
          transform transition-transform duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        {/* ✅ Sidebar 內容（可滾動） */}
        <div className="h-full overflow-y-auto pt-20 px-6">
          <nav className="space-y-5 text-sm">
            <Link to="/admin" className="block">後台首頁</Link>
            <Link to="/admin/dashboard" className="block">Dashboard</Link>
            <Link to="/admin/products" className="block">商品管理</Link>
            <Link to="/admin/products/new" className="block">新增商品</Link>
            <Link to="/admin/orders" className="block">訂單管理</Link>

            <button className="text-red-500 mt-10">
              登出
            </button>
          </nav>
        </div>

        {/* ✅ 手機：關閉按鈕（固定左下） */}
        <button
          onClick={() => setOpen(false)}
          className="
            fixed bottom-6 left-4 z-[60]
            w-12 h-12 rounded-full
            bg-white border shadow-lg
            flex items-center justify-center
            text-xl
            md:hidden
          "
          aria-label="Close admin sidebar"
        >
          ✕
        </button>
      </aside>
    </>
  );
}
