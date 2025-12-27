// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        orders: 0,
        recentPurchase: [],
      });

      navigate("/login");
    } catch (err) {
      alert("註冊失敗：" + err.message);
    }
  };

  return (
    <div className="pt-32 pb-20 flex justify-center">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-md border border-gray-200">
        {/* Title */}
        <h1 className="text-3xl font-['Playfair_Display'] text-center tracking-wide mb-10">
          會員註冊
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl text-lg hover:bg-gray-800 transition"
          >
            註冊帳號
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-600 mt-6">
          已有帳號？{" "}
          <Link to="/login" className="text-black underline hover:text-gray-700">
            前往登入
          </Link>
        </p>
      </div>
    </div>
  );
}
