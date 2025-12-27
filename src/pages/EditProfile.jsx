// src/pages/EditProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateProfile({ name });

    alert("資料更新成功！");
    navigate("/profile");
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      <h2 className="text-2xl font-bold text-center mb-6">編輯資料</h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-6 bg-white p-6 rounded-lg shadow"
      >
        {/* 姓名 */}
        <div>
          <label className="block text-gray-700 mb-1">姓名</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email（不可修改） */}
        <div>
          <label className="block text-gray-700 mb-1">Email（不可修改）</label>
          <input
            type="email"
            className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
            value={profile?.email || ""}
            disabled
          />
        </div>

        {/* 提交按鈕 */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          儲存變更
        </button>
      </form>
    </div>
  );
}
