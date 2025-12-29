import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();

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
      // 1️⃣ 建立 Firebase Auth 帳號
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2️⃣ 更新 Auth displayName（只影響顯示）
      await updateProfile(cred.user, {
        displayName: name,
      });

      // 3️⃣ Firestore 建立 users/{uid}
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        orders: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 4️⃣ 導向會員中心
      navigate("/profile");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("此 Email 已被註冊");
      } else {
        setError("註冊失敗，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-white pt-24">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-full"
          >
            {loading ? "註冊中…" : "註冊"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          已有帳號？
          <Link to="/login" className="text-blue-600 ml-1">
            前往登入
          </Link>
        </p>
      </div>
    </div>
  );
}
