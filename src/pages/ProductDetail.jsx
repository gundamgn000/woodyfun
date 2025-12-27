import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

// 安全圖片（避免空字串 src）
const safeImg = (url) =>
  url && url.trim() !== "" ? url : "/placeholder.png";

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

  // =====================================================
  // 🔥 載入商品資料
  // =====================================================
  useEffect(() => {
    async function loadProduct() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        const subImgs = Array.isArray(data.subImageUrls)
          ? data.subImageUrls.filter((i) => i && i.trim() !== "")
          : [];

        setProduct({
          ...data,
          subImageUrls: subImgs,
        });

        setSelectedImage(
          safeImg(data.mainImageUrl || subImgs[0] || "")
        );

        // 記錄最近看過
        const record = localStorage.getItem("recentViewed");
        let arr = record ? JSON.parse(record) : [];
        arr = arr.filter((pid) => pid !== id);
        arr.unshift(id);
        localStorage.setItem("recentViewed", JSON.stringify(arr.slice(0, 10)));
      }
    }

    loadProduct();
  }, [id]);

  // =====================================================
  // 🔥 載入評論（subcollection）
  // =====================================================
  useEffect(() => {
    async function loadReviews() {
      const reviewRef = collection(db, "products", id, "reviews");
      const snap = await getDocs(reviewRef);

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setReviews(list);
    }

    loadReviews();
  }, [id]);

  // =====================================================
  // ⭐ 提交評論（寫入 subcollection：products/{id}/reviews）
  // =====================================================
  const submitReview = async () => {
    if (!user) return alert("請先登入才能評論");
    if (rating === 0 || reviewText.trim() === "") {
      return alert("請填寫完整評論與評分");
    }

    try {
      const reviewRef = collection(db, "products", id, "reviews");
      
      await addDoc(reviewRef, {
        userId: user.uid,
        userName: user.displayName || "匿名用戶",
        rating,
        comment: reviewText,
        createdAt: new Date(),
      });

      setReviewText("");
      setRating(0);

      // 重新載入評論邏輯保持不變
      const snap = await getDocs(reviewRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(list);

      alert("評論已提交！");
    } catch (error) {
      console.error("提交評論發生錯誤:", error);
      alert("提交失敗：" + error.message);
    }
  };

  // =====================================================
  // 🛒 加入購物車
  // =====================================================
  const addCart = () => {
    if (!selectedSize) return alert("請選擇尺寸");

    addToCart({
      id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: qty,     // ⭐ 關鍵修正
      image: product.mainImageUrl,
    });


    alert("已加入購物車！");
  };

  // =====================================================
  // 👗 類似商品（同分類）
  // =====================================================
  useEffect(() => {
    async function loadSimilar() {
      if (!product) return;

      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs
        .filter((d) => d.id !== id)
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .filter((p) => p.category === product.category);

      setSimilarProducts(list.slice(0, 3));
    }

    loadSimilar();
  }, [product]);

  // =====================================================
  // 🎁 隨機推薦
  // =====================================================
  useEffect(() => {
    async function loadRecommend() {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const shuffle = [...list].sort(() => Math.random() - 0.5);
      setRecommendedProducts(shuffle.slice(0, 3));
    }

    loadRecommend();
  }, []);

  if (!product) return <p className="mt-20 text-center">載入中...</p>;

  // =====================================================
  // JSX（UI）
  // =====================================================
  return (
    <div className="container mx-auto px-4 py-10 pt-24">

      {/* 商品區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* 主圖 */}
        <div>
          <img
            src={safeImg(selectedImage)}
            alt={product.name}
            className="w-full h-[480px] object-contain rounded-xl shadow"
          />

          {/* 縮圖 */}
          <div className="flex gap-3 mt-4">
            {[product.mainImageUrl, ...(product.subImageUrls || [])]
              .filter(Boolean)
              .map((img, idx) => (
                <img
                  key={idx}
                  src={safeImg(img)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border 
                    ${selectedImage === img ? "border-pink-500" : "border-gray-300"}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
          </div>
        </div>

        {/* 右側資訊 */}
        <div className="relative">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl md:text-3xl font-medium tracking-[0.12em] mb-4 text-gray-800 font-serif">
              {product.name}
            </h1>

            {/* ❤️ 收藏 */}
            <button
              onClick={() => toggleWishlist(id)}
              className="
                absolute
                -top-3
                right-0
                md:-top-8
                md:right-0
                z-20
                transform
                scale-125
                transition-transform
                hover:scale-[1.6]
                active:scale-[1.4]
              "
            >
              <span className={`wish-heart ${isWishlisted(id) ? "active" : ""}`}>
                {isWishlisted(id) ? "💖" : "🤍"}
              </span>
            </button>


          </div>

          <p className="text-pink-600 font-bold text-2xl mt-3">
            NT$ {product.price}
          </p>

          <p className="text-gray-700 mt-4 leading-relaxed">
            {product.description}
          </p>

          {/* 尺寸 */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">尺寸</h3>
            <div className="flex gap-3">
              {product.sizes?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 rounded-full border 
                    ${selectedSize === s ? "bg-black text-white" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 數量 */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">數量</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span className="text-xl">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* 購物車 */}
          <button
            onClick={addCart}
            className="mt-6 w-full bg-black text-white py-3 rounded-full text-lg tracking-widest"
          >
            加入購物車
          </button>
        </div>
      </div>

      {/* 評價區 */}
      <div className="mt-20">
        <h2 className="text-2xl font-semibold mb-4">商品評價</h2>

        {/* 新增評論 */}
        {user ? (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="text-3xl cursor-pointer"
                  onClick={() => setRating(star)}
                >
                  {rating >= star ? "⭐" : "☆"}
                </span>
              ))}
            </div>

            <textarea
              id="review-text"
              name="reviewText"
              rows="3"
              className="w-full border p-3 rounded"
              placeholder="分享你的使用心得..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <button
              onClick={submitReview}
              className="mt-3 bg-black text-white px-6 py-2 rounded"
            >
              提交評論
            </button>
          </div>
        ) : (
          <p className="text-gray-500">請登入後才能撰寫評論</p>
        )}

        {/* 評論列表 */}
        <div className="space-y-4 mt-6">
          {reviews.length === 0 ? (
            <p className="text-gray-600">尚無評論</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="border p-4 rounded-lg shadow-sm">
                <p className="text-yellow-500">
                  {"⭐".repeat(rev.rating)}
                </p>
                <p className="mt-2">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 類似商品 */}
      <div className="mt-20">
        <h2 className="text-2xl font-semibold mb-4">同類商品推薦</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {similarProducts.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="block border rounded-lg overflow-hidden shadow hover:shadow-lg"
            >
              <img
                src={safeImg(p.mainImageUrl)}
                className="w-full h-60 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-pink-600 font-bold">NT$ {p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 為你推薦 */}
      <div className="mt-20 mb-20">
        <h2 className="text-2xl font-semibold mb-4">為你推薦</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recommendedProducts.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="block border rounded-lg overflow-hidden shadow hover:shadow-lg"
            >
              <img
                src={safeImg(p.mainImageUrl)}
                className="w-full h-60 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-pink-600 font-bold">NT$ {p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
