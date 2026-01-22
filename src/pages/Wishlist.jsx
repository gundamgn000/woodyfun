import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { HeartOutline, HeartFilled } from "../components/HeartIcons";
import "./Wishlist.css";
import "../styles/ProductCard.css";

export default function Wishlist() {
  const { user, loading } = useAuth(); 
  const { wishlistIds, toggleWishlist, isWishlisted, loadingWishlist } = useWishlist();

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ① 取得所有商品
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAllProducts(list);
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // ② 依 wishlistIds 篩選商品
  useEffect(() => {
    if (!allProducts.length) return;
    const filtered = allProducts.filter((p) => wishlistIds.includes(p.id));
    setProducts(filtered);
  }, [wishlistIds, allProducts]);

  if (loading || loadingWishlist || loadingProducts) {
    return (
      <div className="wishlist-page-container">
        <p className="text-[#6a625d]">溫暖加載中...</p>
      </div>
    );
  }

  const safeImg = (url) =>
  url && url.trim() !== ""
    ? url
    : "https://placehold.co/400x400?text=No+Image";


  return (
    <div className="wishlist-page-container">
      <div className="wishlist-header">
        <h1 className="wishlist-title">我的收藏💕</h1>
        <p className="wishlist-subtitle">收藏那些想與孩子分享的快樂瞬間</p>
      </div>

      {!user ? (
        <div className="wishlist-empty-state">
          <p>請先登入，查看您的專屬收藏清單 🧸</p>
          <Link to="/login" className="wishlist-btn-primary">前往登入</Link>
        </div>
      ) : products.length === 0 ? (
        <div className="wishlist-empty-state">
          <p>目前的收藏清單空空的唷... <br/>去逛逛尋找有趣的玩具吧！</p>
          <Link to="/products" className="wishlist-btn-primary">去逛逛</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((item) => (
            <div key={item.id} className="product-card-wrapper">

              {/* 點卡片本體 → 商品頁 */}
              <Link to={`/product/${item.id}`} className="product-card-link">
                <div className="product-image-wrapper">
                  <img
                    src={item.mainImageUrl || item.imageUrl}
                    alt={item.name}
                  />
                </div>

                <div className="product-info">
                  <div className="product-card-category">{item.category}</div>
                  <h2 className="product-name">{item.name}</h2>
                  <div className="product-card-price">NT$ {item.price}</div>
                </div>
              </Link>

              {/* ❤️ 愛心（完全對齊 Products） */}
              <button
                className="wishlist-btn"
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(item.id);
                }}
              >
                {isWishlisted(item.id)
                  ? <HeartFilled color="#f39c42" />
                  : <HeartOutline color="#ccc" />
                }
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}