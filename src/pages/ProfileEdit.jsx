import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

export default function ProfileEdit() {
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setLoading(true);

      await updateDoc(doc(db, "users", user.uid), {
        name,
        updatedAt: new Date(),
      });

      await refreshProfile();
      setMsg("✔ 資料已更新！");
    } catch (error) {
      console.error(error);
      setMsg("更新失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      {/* 標題 */}
      <h1 className="text-center text-4xl font-['Playfair_Display'] mb-12 tracking-wide">
        編輯資料
      </h1>

      {/* 表單容器 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl px-10 py-12 border border-gray-200"
      >
        {/* 姓名 */}
        <label className="block text-gray-700 mb-2">姓名</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 
                     focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* 儲存按鈕 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg 
                     hover:bg-gray-800 transition-all duration-300"
        >
          {loading ? "更新中..." : "儲存變更"}
        </button>

        {/* 顯示訊息 */}
        {msg && (
          <p className="text-center text-gray-600 mt-4">{msg}</p>
        )}
      </form>

      {/* 返回會員中心按鈕 */}
      <div className="mt-6 flex justify-center">
        <Link
          to="/profile"
          className="w-full sm:w-1/3 text-center border border-gray-400 text-gray-700 
                     py-3 rounded-lg hover:bg-gray-100 transition-all duration-300"
        >
          返回會員資料
        </Link>
      </div>
    </div>
  );
}
