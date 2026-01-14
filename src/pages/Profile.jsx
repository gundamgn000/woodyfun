import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="member-page-container">
      <div className="member-max-width">
        <header className="member-header">
          <h1 className="member-title">個人資料/訂單</h1>
          <p className="member-subtitle">歡迎回來，親愛的家長</p>
        </header>

        <div className="member-grid">
          {/* 個人資料 */}
          <div className="member-card">
            <div className="card-top">
              <span className="card-emoji">👤</span>
              <h2 className="card-h2">個人資料</h2>
              <div className="card-info">
                <p>姓名：<span>{userProfile?.name || "未設定"}</span></p>
                <p>帳號：<span>{user?.email}</span></p>
              </div>
            </div>
            <Link to="/profile/edit" className="card-link text-orange">
              編輯帳號資料 →
            </Link>
          </div>

          {/* 我的收藏 */}
          <div className="member-card">
            <div className="card-top">
              <span className="card-emoji">❤️</span>
              <h2 className="card-h2">我的收藏</h2>
              <p className="card-p">查看您珍藏的木育玩具清單</p>
            </div>
            <Link to="/wishlist" className="card-link text-green">
              VIEW WISHLIST →
            </Link>
          </div>

          {/* 歷史訂單 */}
          <div className="member-card">
            <div className="card-top">
              <span className="card-emoji">📦</span>
              <h2 className="card-h2">歷史訂單</h2>
              <p className="card-p">追蹤您的訂單進度與過往紀錄</p>
            </div>
            <Link to="/orders" className="card-link text-wood">
              ORDER HISTORY →
            </Link>
          </div>

          {/* 登出卡片 */}
          <div className="member-card logout-card">
            <div className="card-top">
              <h2 className="card-h2 text-red-500">安全登出</h2>
              <p className="card-p">結束本次瀏覽，我們下次見！</p>
            </div>
            <button onClick={handleLogout} className="member-logout-btn text-red-500">
              登出帳號
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}