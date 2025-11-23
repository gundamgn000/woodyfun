import { useState } from "react";
import { auth } from "../firebase/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function PasswordEdit() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) {
      alert("請完整填寫欄位");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("尚未登入");
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      alert("密碼更新成功");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("密碼更新失敗：舊密碼錯誤或新密碼格式不符");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-28 px-6">

      {/* 標題 */}
      <h1
        className="text-4xl font-light mb-14 text-center tracking-widest"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        CHANGE PASSWORD
      </h1>

      {/* 卡片容器 */}
      <div className="border border-gray-300 rounded-3xl bg-white shadow-sm p-10">

        {/* 舊密碼 */}
        <label
          className="block mb-3 text-gray-700 tracking-wide"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          舊密碼
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="
            w-full border border-gray-300 rounded-xl px-5 py-3 mb-6
            focus:outline-none focus:border-black
            text-gray-800 bg-white
          "
        />

        {/* 新密碼 */}
        <label
          className="block mb-3 text-gray-700 tracking-wide"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          新密碼
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="
            w-full border border-gray-300 rounded-xl px-5 py-3
            focus:outline-none focus:border-black
            text-gray-800 bg-white
          "
        />

        {/* 儲存按鈕 */}
        <button
          onClick={handlePasswordUpdate}
          disabled={loading}
          className="
            w-full mt-10 py-3
            rounded-full
            bg-black text-white text-sm
            tracking-widest
            hover:bg-gray-900
            transition
          "
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          {loading ? "更新中…" : "確認更新"}
        </button>
      </div>
    </div>
  );
}
