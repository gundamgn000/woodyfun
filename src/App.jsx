import React, { Suspense, lazy } from "react"; // 引入 lazy 和 Suspense
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ConsumerPolicy from "./pages/ConsumerPolicy";
import { useEffect } from "react";
import { recordVisitor } from "./utils/visitorCounter";

// 1. 將所有頁面改為 lazy import
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const PasswordEdit = lazy(() => import("./pages/PasswordEdit"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const AddressList = lazy(() => import("./pages/AddressList"));
const AddAddress = lazy(() => import("./pages/AddAddress"));
const EditAddress = lazy(() => import("./pages/EditAddress"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutConfirm = lazy(() => import("./pages/CheckoutConfirm"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Cart = lazy(() => import("./pages/Cart"));
const NewArrivals = lazy(() => import("./pages/NewArrivals"));
const Member = lazy(() => import("./pages/Member"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));

/* ===== Admin (這些是影響分數最重的部分，改為 lazy 能顯著提分) ===== */
const AdminRoute = lazy(() => import("./routes/AdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminAddProduct = lazy(() => import("./pages/admin/AdminAddProduct"));
const AdminEditProduct = lazy(() => import("./pages/admin/AdminEditProduct"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
import { startOnlineTracking } from "./utils/onlineTracker";
function App() {
   useEffect(() => {
    recordVisitor();
    startOnlineTracking();
  }, []);
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Navbar />
              <main className="min-h-screen">
                {/* 2. 使用 Suspense 包裹 Routes，並給予一個空的 loading 狀態以維持畫面穩定 */}
                <Suspense fallback={<div className="min-h-screen" />}>
                  <PageTransition>
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/products/new" element={<ProductDetail />} />

                      <Route path="/product/new" element={<ProductDetail />} />
                      <Route path="/product/:id" element={<ProductDetail />} />




                      {/* Auth */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* User */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/edit" element={<ProfileEdit />} />
                      <Route path="/profile/password" element={<PasswordEdit />} />

                      <Route path="/orders" element={<OrderHistory />} />
                      <Route path="/order/:id" element={<OrderDetail />} />
                      <Route path="/order/:orderId" element={<OrderStatus />} />

                      <Route path="/address" element={<AddressList />} />
                      <Route path="/address/add" element={<AddAddress />} />
                      <Route path="/address/edit/:id" element={<EditAddress />} />

                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/confirm" element={<CheckoutConfirm />} />
                      <Route path="/checkout/success/:orderId" element={<CheckoutSuccess />} />
                      <Route path="/checkout/success" element={<CheckoutSuccess />} />

                      <Route path="/cart" element={<Cart />} />
                      <Route path="/new" element={<NewArrivals />} />
                      <Route path="/member" element={<Member />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/consumer-policy" element={<ConsumerPolicy />} />
                      

                      {/* Admin */}
                      {/* Admin */}
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }
                      >
                        <Route index element={<AdminHome />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<AdminAddProduct />} />
                        <Route path="products/edit/:id" element={<AdminEditProduct />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="orders/:orderId" element={<AdminOrderDetail />} />
                      </Route>
                    </Routes>
                  </PageTransition>
                </Suspense>
              </main>
              <Footer />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;