import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import PasswordEdit from "./pages/PasswordEdit";

import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import OrderStatus from "./pages/OrderStatus";

import AddressList from "./pages/AddressList";
import AddAddress from "./pages/AddAddress";
import EditAddress from "./pages/EditAddress";

import Checkout from "./pages/Checkout";
import CheckoutConfirm from "./pages/CheckoutConfirm";
import CheckoutSuccess from "./pages/CheckoutSuccess";

import Cart from "./pages/Cart";
import NewArrivals from "./pages/NewArrivals";
import Member from "./pages/Member";
import Wishlist from "./pages/Wishlist";

/* ===== Admin ===== */
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";

import AdminHome from "./pages/admin/AdminHome";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Navbar />

              <main className="min-h-screen">
                <PageTransition>
                  <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/products/new" element={<NewArrivals />} />

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

                    {/* ================= ADMIN 唯一入口 ================= */}
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
                    {/* ================================================= */}
                  </Routes>
                </PageTransition>
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
