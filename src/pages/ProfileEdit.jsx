import { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 載入會員資料
  useEffect(() => {
    const loadUser = async () => {
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
      }
    };

    loadUser();
  }, [user]);

  // 儲存
  const handleSave = async () => {
    if (!name.trim()) return alert("姓名不能為空");

    setLoading(true);

    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { name });

      alert("資料更新成功");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("更新失敗，請稍後再試");
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
        EDIT PROFILE
      </h1>

      {/* 卡片 */}
      <div className="border border-gray-300 rounded-3xl bg-white shadow-sm p-10">

        {/* 姓名 */}
        <label
          className="block mb-4 text-gray-700 tracking-wide"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          姓名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full border border-gray-300 rounded-xl px-5 py-3
            focus:outline-none focus:border-black
            text-gray-800 bg-white
          "
        />

        {/* 儲存按鈕 */}
        <button
          onClick={handleSave}
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
          {loading ? "儲存中…" : "確認儲存"}
        </button>
      </div>
    </div>
  );
}
