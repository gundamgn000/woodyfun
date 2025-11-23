// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { setProfile } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Firebase Auth 建立帳號
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. 更新 auth 的 displayName（純顯示用）
      await updateProfile(cred.user, { displayName: name });

      // 3. 在 Firestore 建一筆 /users/{uid}（重要：doc id 用 uid）
      const userDocRef = doc(db, "users", cred.user.uid);
      const profileData = {
        name,
        email,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, profileData);

      // 4. 更新 context 裡的 profile，讓畫面可以即時用到
      setProfile(profileData);

      // 5. 導向會員中心
      navigate("/member");
    } catch (err) {
      console.error(err);
      setError("註冊失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">會員註冊</h1>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-gray-700">姓名</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入姓名"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">電子郵件</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">密碼</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 碼"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-black text-white py-2 rounded-full hover:bg-gray-900 transition disabled:opacity-60"
          >
            {loading ? "註冊中…" : "註冊"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          已經有帳號了？{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            立即登入
          </Link>
        </p>
      </div>
    </div>
  );
}
