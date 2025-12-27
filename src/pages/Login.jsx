// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 成功後，AuthContext 會自動更新 user/profile
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("登入失敗，請確認帳號密碼");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">會員登入</h1>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
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
              placeholder="請輸入密碼"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-black text-white py-2 rounded-full hover:bg-gray-900 transition disabled:opacity-60"
          >
            {loading ? "登入中…" : "登入"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          還沒有帳號？{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
