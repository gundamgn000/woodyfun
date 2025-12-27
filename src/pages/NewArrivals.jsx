import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useWishlist } from "../context/WishlistContext";

export default function NewArrivals() {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(list);
      } catch (e) {
        console.error("NewArrivals fetch error:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const handleToggleWishlist = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 font-serif">
        <h1 className="text-2xl md:text-3xl font-medium tracking-[0.2em] mb-6 text-gray-800">NEW ARRIVALS</h1>
        <div className="text-sm text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-baseline justify-between gap-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-medium tracking-[0.2em] font-serif text-gray-800">
          NEW ARRIVALS
        </h1>
        <Link
          to="/products"
          className="text-xs tracking-widest text-gray-400 hover:text-black transition-colors duration-300"
        >
          VIEW ALL →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-sm text-gray-400 font-serif text-center py-10">
          目前沒有新進商品。
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="relative group">
              <Link
                to={`/products/${p.id}`}
                className="block border rounded-2xl overflow-hidden hover:shadow-lg transition duration-500"
              >
                {/* 圖片區：同步 Products.jsx 的 aspect-[4/5] */}
                <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={p.mainImageUrl || "/placeholder.png"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  
                  {/* ❤️ 收藏按鈕：採用一致的 wish-heart 樣式 */}
                  <button
                    onClick={(e) => handleToggleWishlist(p.id, e)}
                    className="absolute top-3 right-3 text-3xl z-10"
                  >
                    <span className={`wish-heart ${isWishlisted(p.id) ? "active" : ""}`}>
                      {isWishlisted(p.id) ? "❤️" : "🤍"}
                    </span>
                  </button>
                </div>

                {/* 文字區：完全同步 Products.jsx 格式 */}
                <div className="p-5">
                  {/* 📱 手機版 */}
                  <div className="md:hidden">
                    <h2 className="text-base font-medium tracking-[0.06em] text-gray-700 font-serif truncate">
                      {p.name}
                    </h2>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-base font-medium tracking-wider text-gray-700 font-serif">
                        NT${p.price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-400">
                       {p.category}
                      </div>
                    </div>
                  </div>

                  {/* 🖥️ 桌機版 */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-medium tracking-[0.15em] text-gray-700 font-serif truncate flex-1">
                        {p.name}
                      </h2>
                      <div className="text-base font-medium font-serif tracking-tight text-gray-900">
                        <span className="text-xs font-light mr-0.5">NT$</span>
                        {p.price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1.5 opacity-70 tracking-[0.1em]">
                     分類: {p.category}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}