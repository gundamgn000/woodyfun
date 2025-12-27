import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole !== "admin") return <Navigate to="/" replace />;

  return children;
}
