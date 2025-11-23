import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import PasswordEdit from "./pages/PasswordEdit";

import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

import AddressList from "./pages/AddressList";
import AddAddress from "./pages/AddAddress";
import EditAddress from "./pages/EditAddress";

import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Cart from "./pages/Cart";
import NewArrivals from "./pages/NewArrivals";

import Member from "./pages/Member";


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/profile-edit" element={<ProfileEdit />} />
            <Route path="/profile/password" element={<PasswordEdit />} />

            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderDetail />} />

            <Route path="/address" element={<AddressList />} />
            <Route path="/address/add" element={<AddAddress />} />
            <Route path="/address/edit/:id" element={<EditAddress />} />

            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/newarrivals" element={<NewArrivals />} />
            <Route path="/member" element={<Member />} />


          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
