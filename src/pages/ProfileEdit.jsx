import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "firebase/auth"; // 導入 Firebase 修改密碼功能
import "./Profile.css";

export default function ProfileEdit() {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  // 狀態控管
  const [name, setName] = useState(userProfile?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", content: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    // 檢查兩次密碼是否一致
    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ type: "error", content: "兩次輸入的新密碼不一致" });
      return;
    }

    try {
      setLoading(true);
      setMsg({ type: "", content: "" });

      // 1. 更新 Firestore 姓名資料
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { 
        name, 
        updatedAt: serverTimestamp() 
      }, { merge: true });

      // 2. 如果有輸入新密碼，更新 Firebase Auth 密碼
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error("密碼長度至少需要 6 位數");
        }
        await updatePassword(user, newPassword);
      }
      
      await refreshProfile();
      setMsg({ type: "success", content: "✔ 資料與密碼已成功更新！" });
      
      // 成功後延遲跳轉
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error) {
      console.error(error);
      // 處理 Firebase 特殊錯誤：登入逾時
      if (error.code === "auth/requires-recent-login") {
        setMsg({ type: "error", content: "安全性考量，請重新登入後再修改密碼" });
      } else {
        setMsg({ type: "error", content: error.message || "更新失敗，請稍後再試" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-page-container">
      <div className="member-max-width-form">
        <div className="flex items-center gap-4 mb-8">
            <button type="button" onClick={() => navigate(-1)} className="back-btn">←</button>
            <h1 className="text-2xl font-bold text-[#6a625d]">編輯帳號資料</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          {/* 區塊一：帳號資訊 (唯讀) */}
          <div className="form-section mb-6">
            <h3 className="section-title">帳號資訊</h3>
            <div className="form-group readonly">
              <label>註冊信箱</label>
              <input type="text" className="styled-input" value={user?.email} disabled />
            </div>
          </div>

          {/* 區塊二：基本資料 */}
          <div className="form-section mb-6">
            <h3 className="section-title">基本資料</h3>
            <div className="form-group">
              <label>顯示姓名</label>
              <input
                type="text"
                className="styled-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入您的姓名"
                required
              />
            </div>
          </div>

          {/* 區塊三：修改密碼 (新功能) */}
          <div className="form-section mb-6">
            <h3 className="section-title">變更密碼</h3>
            <div className="form-group">
              <label>新密碼 (若不修改請留空)</label>
              <input
                type="password"
                className="styled-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少 6 位數密碼"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group mt-4">
              <label>確認新密碼</label>
              <input
                type="password"
                className="styled-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次輸入新密碼"
                autoComplete="new-password"
              />
            </div>
            <p className="input-tip mt-2">※ 為了安全，修改密碼後建議重新登入。</p>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "處理中..." : "儲存所有變更"}
            </button>
            
            {msg.content && (
              <p className={`form-msg ${msg.type === "success" ? "success" : "error"}`}>
                {msg.content}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}