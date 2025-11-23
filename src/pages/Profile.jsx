import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // ⭐ 新增

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const { setProfile } = useAuth();                 // ⭐ 新增
  const user = auth.currentUser;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);

        // ⭐ 關鍵：同步資料給 Navbar / AuthContext
        setProfile(data);
      }
    };

    loadData();
  }, [user, setProfile]);        // ⭐ setProfile 加入 dependency

  if (!userData)
    return (
      <div className="py-32 text-center text-gray-500 tracking-wide">
        載入中…
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-28 px-6">
      <h1
        className="text-4xl md:text-5xl font-light text-center mb-20 tracking-widest"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        MEMBER CENTER
      </h1>

      <div className="grid md:grid-cols-3 gap-12">
        {/* 個人資料 */}
        <div className="group border border-gray-300 bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-300">
          <h2
            className="text-xl font-semibold mb-6 tracking-wide"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            個人資料
          </h2>

          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p><span className="font-medium">姓名：</span>{userData.name}</p>
            <p><span className="font-medium">Email：</span>{userData.email}</p>
          </div>
        </div>

        {/* 編輯資料 */}
        <Link
          to="/profile/edit"
          className="group border border-gray-300 bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-300 block"
        >
          <h2
            className="text-xl font-semibold mb-4 tracking-wide"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            編輯資料
          </h2>
          <p className="text-gray-500 group-hover:text-gray-700 transition">修改您的基本資料</p>
        </Link>

        {/* 修改密碼 */}
        <Link
          to="/profile/password"
          className="group border border-gray-300 bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-300 block"
        >
          <h2
            className="text-xl font-semibold mb-4 tracking-wide"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            修改密碼
          </h2>
          <p className="text-gray-500 group-hover:text-gray-700 transition">更改您的登入密碼</p>
        </Link>
      </div>
    </div>
  );
}
