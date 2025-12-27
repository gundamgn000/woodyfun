import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, userRole, authLoading } = useAuth();

  // Auth 還沒準備好，不做任何判斷
  if (authLoading) return null;

  // 沒登入 → 踢回登入
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 已登入但不是 admin → 踢回首頁
  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  // admin 才能進
  return children;
}
