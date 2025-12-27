import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1
          className="text-4xl font-light mb-16 tracking-widest"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          MEMBER CENTER
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          
          {/* 個人資料 */}
          <div className="border rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">個人資料</h2>
            <p className="text-gray-700">
              姓名：{user?.displayName || "未設定"}
            </p>
            <p className="text-gray-700 mt-2">
              Email：{user?.email}
            </p>
          </div>

          {/* 編輯資料 */}
          <div className="border rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">編輯資料</h2>
            <p className="text-gray-600 mb-4">修改您的姓名、Email 等資料</p>
            <Link
              to="/profile/edit"
              className="text-sm underline hover:text-gray-500 tracking-wider"
            >
              EDIT PROFILE →
            </Link>
          </div>
          
          {/* 修改密碼 */}
          <div className="border rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">修改密碼</h2>
            <p className="text-gray-600 mb-4">更改您的登入密碼</p>
            <Link
              to="/profile/password"
              className="text-sm underline hover:text-gray-500 tracking-wider"
            >
              CHANGE PASSWORD →
            </Link>
          </div>

          {/* 我的收藏 */}
          <div className="border rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">我的收藏</h2>
            <p className="text-gray-600 mb-4">查看您收藏的商品</p>
            <Link
              to="/wishlist"
              className="text-sm underline hover:text-gray-500 tracking-wider"
            >
              VIEW WISHLIST →
            </Link>
          </div>


          {/* ★ 歷史訂單 */}
          <div className="border rounded-3xl p-8 shadow-sm md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">歷史訂單</h2>
            <p className="text-gray-600 mb-4">
              查看您的過去訂單與目前訂單處理狀態
            </p>
            <Link
              to="/orders"
              className="text-sm underline hover:text-gray-500 tracking-wider"
            >
              ORDER HISTORY →
            </Link>
          </div>
          

        </div>
      </div>
    </div>
  );
}
