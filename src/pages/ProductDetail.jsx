import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

// 安全圖片（避免空字串 src）
const safeImg = (url) =>
  url && url.trim() !== "" ? url : "https://placehold.co/600x600?text=No+Image";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);

  // 評價相關 state
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  // 推薦 & 類似商品
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // 載入商品資料
  useEffect(() => {
    async function loadProduct() {
      const docRef = doc(db, "products", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProduct({ id: snap.id, ...data });
        setSelectedImage(data.image || data.mainImageUrl || "");
        
        // 載入評價
        const revSnap = await getDocs(collection(db, "products", id, "reviews"));
        setReviews(revSnap.docs.map((d) => d.data()));

        // 載入類似商品 (同分類)
        if (data.category) {
          const qSimilar = query(
            collection(db, "products"),
            where("category", "==", data.category),
            limit(4)
          );
          const simSnap = await getDocs(qSimilar);
          setSimilarProducts(simSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id));
        }

        // 載入為你推薦 (隨機抓幾個)
        const qRec = query(collection(db, "products"), limit(4));
        const recSnap = await getDocs(qRec);
        setRecommendedProducts(recSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id));
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!reviewText.trim() || rating === 0) {
      alert("請填寫評價內容並選擇星級");
      return;
    }
    try {
      await addDoc(collection(db, "products", id, "reviews"), {
        text: reviewText,
        rating,
        userName: user?.displayName || user?.email || "匿名用戶",
        createdAt: new Date(),
      });
      alert("評價已送出！");
      setReviewText("");
      setRating(0);
      // 重新載入評價
      const revSnap = await getDocs(collection(db, "products", id, "reviews"));
      setReviews(revSnap.docs.map((d) => d.data()));
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <div className="loading-screen">載入中...</div>;

  return (
    <div className="product-detail-page-v2">
      <div className="detail-main-layout">
        {/* 左側：圖片展示 */}
        <div className="detail-media-section">
          <div className="main-image-card">
            <img 
              src={safeImg(selectedImage)} 
              className="main-display-img fade-in" 
              alt={product.name} 
            />
          </div>
          <div className="detail-thumbnails">
            {[product.image || product.mainImageUrl, ...(product.images || [])].filter(Boolean).map((img, idx) => (
              <div 
                key={idx} 
                className={`thumb-box ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={safeImg(img)} alt="thumb" />
              </div>
            ))}
          </div>
        </div>

        {/* 右側：資訊購買 */}
        <div className="detail-info-section">
          <div className="brand-tag">{product.category}</div>
          <h1 className="product-title-big">{product.name}</h1>
          <div className="price-tag-v2">
            <span className="currency">NT$</span>
            <span className="amount">{product.price?.toLocaleString()}</span>
          </div>

          <div className="detail-divider"></div>

          <p className="description-text">
            {product.description || "這款產品選用環保材料製作，結合現代設計與實用性，為您的生活帶來更多質感與樂趣。"}
          </p>

          {/* 規格選擇 */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="selector-group">
              <label>選擇規格</label>
              <div className="size-options">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`option-pill ${selectedSize === s ? "active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="action-area">
            <div className="qty-control">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <input type="number" value={qty} readOnly />
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn-add-cart" onClick={() => addToCart(product, qty, selectedSize)}>
              加入購物車
            </button>
            <button 
              className={`btn-wishlist-circle ${isWishlisted(product.id) ? "active" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              {isWishlisted(product.id) ? "❤️" : "♡"}
            </button>
          </div>
        </div>
      </div>

      {/* 評價系統 */}
      <div className="reviews-section-v2">
        <h2 className="section-title">顧客評價 ({reviews.length})</h2>
        <div className="review-layout">
          <div className="review-list">
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="review-header">
                    <span className="user-name">{r.userName}</span>
                    <span className="user-rating">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="review-content">{r.text}</p>
                </div>
              ))
            ) : (
              <p className="no-reviews">目前尚無評價</p>
            )}
          </div>

          {user && (
            <div className="write-review-card">
              <h3>發表評論</h3>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} onClick={() => setRating(s)} className={s <= rating ? "star-active" : "star-empty"}>
                    ★
                  </span>
                ))}
              </div>
              <textarea 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                placeholder="分享您的使用心得..."
              />
              <button onClick={handleReviewSubmit} className="btn-submit-review">送出評論</button>
            </div>
          )}
        </div>
      </div>

      {/* 推薦商品 */}
      <div className="recommend-section-v2">
        <h2 className="section-title">為您推薦</h2>
        <div className="recommend-grid">
          {recommendedProducts.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="mini-card">
              <div className="mini-img-box">
                <img src={safeImg(p.image || p.mainImageUrl)} alt={p.name} />
              </div>
              <h4>{p.name}</h4>
              <p>NT$ {p.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;