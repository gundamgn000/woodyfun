// src/pages/PasswordEdit.jsx
import { useState } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PasswordEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 處理更新密碼
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!user?.email) {
        setError("目前無法取得使用者 Email");
        return;
      }

      // 重新驗證身份
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, credential);

      // 更新密碼
      await updatePassword(user, newPw);

      setSuccess("密碼更新成功！");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      setError("密碼錯誤或更新失敗，請確認後再試");
    }
  };

  return (
    <div className="min-h-screen pt-32 px-6 md:px-0 flex flex-col items-center">
      <h1 className="text-4xl font-['Playfair_Display'] tracking-wider mb-16 text-gray-800">
        CHANGE PASSWORD
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-10 rounded-2xl border border-gray-200 shadow-sm bg-white"
      >
        {/* 舊密碼 */}
        <label className="block text-gray-700 font-medium mb-2">舊密碼</label>
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6 focus:outline-none focus:ring-1 focus:ring-black"
          required
        />

        {/* 新密碼 */}
        <label className="block text-gray-700 font-medium mb-2">新密碼</label>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6 focus:outline-none focus:ring-1 focus:ring-black"
          required
        />

        {/* 狀態訊息 */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        {/* 確認更新 */}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-full text-lg tracking-wide hover:bg-gray-800 transition"
        >
          確認更新
        </button>

        {/* 返回會員中心按鈕 */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="w-full mt-6 border border-black text-black py-3 rounded-full text-lg tracking-wide hover:bg-black hover:text-white transition"
        >
          返回會員中心
        </button>
      </form>
    </div>
  );
}
