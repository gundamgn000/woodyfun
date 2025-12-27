import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AdminHome from "../pages/admin/AdminHome";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminAddProduct from "../pages/admin/AdminAddProduct";
import AdminEditProduct from "../pages/admin/AdminEditProduct";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";
import Dashboard from "../pages/admin/Dashboard";

export default function AdminRoute() {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole !== "admin") return <Navigate to="/" replace />;

  return (
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="products/new" element={<AdminAddProduct />} />
      <Route path="products/edit/:id" element={<AdminEditProduct />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="orders/:orderId" element={<AdminOrderDetail />} />
    </Routes>
  );
}
