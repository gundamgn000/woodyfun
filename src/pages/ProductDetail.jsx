import { useEffect, useState, useCallback } from "react"; // 加入 useCallback 確保效能
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
  orderBy, // 加入排序功能
  serverTimestamp //
} from "firebase/firestore";
import { db } from "../firebase/firebase";

import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

const safeImg = (url) =>
  url && url.trim() !== "" ? url : "https://placehold.co/600x600?text=No+Image";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  

  // --- 1. 抽離 fetchReviews 邏輯 ---
  const fetchReviews = useCallback(async () => {
    try {
      const q = query(
        collection(db, "reviews"), 
        where("productId", "==", id)
        // 注意：若 Firebase 沒建立索引，orderBy 可能會報錯，先用程式碼排序確保安全
      );
      const qSnap = await getDocs(q);
      const data = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // 依時間由新到舊排序
      const sortedData = data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setReviews(sortedData);
    } catch (err) {
      console.error("抓取評論失敗:", err);
    }
  }, [id]);

  // --- 2. 初始載入 ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct(data);
          setSelectedImage(safeImg(data.mainImageUrl || data.imageUrl));

          const q = query(
            collection(db, "products"),
            where("category", "==", data.category),
            limit(4)
          );
          const qSnap = await getDocs(q);
          setRecommendedProducts(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("讀取商品失敗:", err);
      }
    };

    fetchProduct();
    fetchReviews(); // 初始呼叫
  }, [id, fetchReviews]);

 

  // --- 3. 提交評論邏輯 ---
  const handleReviewSubmit = async () => {
    if (!user) return alert("請先登入");
    if (rating === 0) return alert("請給予星等");
    if (!reviewText.trim()) return alert("請輸入心得內容");

    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0] || "小木友",
        rating,
        text: reviewText,
        createdAt: serverTimestamp(), // Firebase 會存成 Timestamp
      });

      alert("評論已送出");
      setReviewText("");
      setRating(0);
      
      // ✅ 關鍵：直接呼叫重新整理列表
      await fetchReviews();
    } catch (err) {
      console.error("送出評論失敗:", err);
      alert("送出失敗");
    }
  };

  if (!product) return <div className="loading-screen">木玩載入中...</div>;

  const descriptionLines = product.description
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

    

  return (
    <div className="product-detail-page-v2">
      <div className="detail-main-layout">
        {/* 左側：圖片區 */}
        <div className="image-display-side">
          <div className="main-image-card">
            <img src={selectedImage} alt={product.name} className="main-display-img" />
          </div>
          
          <div className="thumbnails-section">
            <div 
              className={`thumb-box ${selectedImage === safeImg(product.mainImageUrl || product.imageUrl) ? "active" : ""}`}
              onClick={() => setSelectedImage(safeImg(product.mainImageUrl || product.imageUrl))}
            >
              <img src={safeImg(product.mainImageUrl || product.imageUrl)} alt="主圖" />
            </div>
            {product.subImageUrls && product.subImageUrls.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumb-box ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`副圖 ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* 右側：資訊區 */}
        <div className="info-side">
          <div className="info-header">
            <div className="category-row">
              <span className="category-badge">{product.category}</span>
            </div>
            <h1 className="product-title">{product.name}</h1>
            <div className="price-tag">
              <span className="price-symbol">NT$</span>
              <span className="price-amount">{product.price}</span>
            </div>
          </div>

          

          <div className="description-text">
            {descriptionLines.map((line, index) => {
              if (line.startsWith("✔")) {
                return <li key={index} className="feature-item">{line}</li>;
              }

              if (line.startsWith("👶") || line.startsWith("📦")) {
                return <h4 key={index}>{line}</h4>;
              }

              if (line.startsWith("「") && line.endsWith("」")) {
                return <p key={index} className="quote-line">{line}</p>;
              }

              return <p key={index}>{line}</p>;
            })}
          </div>

          <div className="toy-spec-row">
            <div className="spec-pill">
              <span className="spec-icon">👶</span>
              <div className="spec-content">
                <span className="label">適合年齡</span>
                <span className="value">{product.ageRange || "1-3歲"}</span>
              </div>
            </div>
            <div className="spec-pill">
              <span className="spec-icon">🌿</span>
              <div className="spec-content">
                <span className="label">材質成分</span>
                <span className="value">{product.material || "天然實木"}</span>
              </div>
            </div>
          </div>

          {product.abilities && product.abilities.length > 0 && (
            <div className="abilities-wrapper">
              <h4 className="section-subtitle">發展重點</h4>
              <div className="ability-flex">
                {product.abilities.map(a => (
                  <span key={a} className="ability-pill">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="purchase-action-container">
            <div className="qty-stepper">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <input type="number" value={qty} readOnly />
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="primary-buy-btn" onClick={() => addToCart(product, qty)}>
              加入購物車
            </button>
            <button
              className={`wishlist-btn ${isWishlisted(id) ? "active" : ""}`}
              onClick={() => toggleWishlist(id)}
              aria-label="加入收藏"
            >
              {isWishlisted(id) ? "❤️" : "🤍"}
            </button>

          </div>
        </div>
      </div>

      {/* 評價區 */}
      <div className="reviews-section-v2">
        <div className="review-layout">
          <div className="reviews-list-column">
            <h2>顧客評價 ({reviews.length})</h2>
            <div className="review-items-container">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-user-info">
                      <span className="user-name">{r.userName}</span>
                      <span className="user-rating">{"★".repeat(r.rating)}</span>
                    </div>
                    <p className="review-content">{r.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-reviews">目前尚無評價，快來分享你的心得吧！</p>
              )}
            </div>
          </div>

          {user && (
            <div className="write-review-card">
              <h3>發表評論</h3>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span 
                    key={s} 
                    onClick={() => setRating(s)} 
                    className={s <= rating ? "star-active" : "star-empty"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                placeholder="分享您的使用心得..."
              />
              <button
                onClick={handleReviewSubmit}
                className="submit-review-btn"
              >
                送出評論
              </button>

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
                <img src={safeImg(p.mainImageUrl || p.imageUrl)} alt={p.name} />
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