import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { user, loading } = useAuth(); 
  const { wishlistIds, toggleWishlist, loadingWishlist } = useWishlist();

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
    if (!wishlistIds?.length || !allProducts.length) {
      setProducts([]);
      return;
    }
    setProducts(allProducts.filter((p) => wishlistIds.includes(p.id)));
  }, [wishlistIds, allProducts]);

  if (loading || loadingWishlist || loadingProducts) {
    return <div className="pt-32 text-center py-20 text-gray-500 font-serif">載入中...</div>;
  }

  if (!user) {
    return (
      <div className="pt-32 text-center py-20 font-serif">
        <h2 className="text-2xl font-medium mb-4 tracking-widest">我的收藏</h2>
        <p className="text-gray-600 mb-6">請先登入後，才可以查看你的收藏清單。</p>
        <Link to="/login" className="px-8 py-2 border border-black rounded-full hover:bg-black hover:text-white transition duration-300">
          前往登入
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="pt-32 text-center py-20 font-serif">
        <h2 className="text-2xl font-medium mb-4 tracking-widest">我的收藏</h2>
        <p className="text-gray-400">目前尚未收藏任何商品。</p>
      </div>
    );
  }

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-medium mb-12 text-center tracking-[0.2em] font-serif text-gray-800">
        MY WISHLIST
      </h2>

      {/* ✅ 商品列表：完全同步 Products.jsx 結構 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((item) => {
          const imgSrc =
            item.images?.[0] ||
            item.mainImageUrl ||
            "/placeholder.png";

          return (
            <div key={item.id} className="relative group">
              <Link
                to={`/products/${item.id}`}
                className="block border rounded-2xl overflow-hidden hover:shadow-lg transition duration-500"
              >
                {/* 圖片區：同步 Products.jsx 的 aspect-[4/5] */}
                <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>

                {/* 文字區：同步 Products.jsx 的排版與字體 */}
                <div className="p-5">
                  {/* 📱 手機版 */}
                  <div className="md:hidden">
                    <h2 className="text-base font-medium tracking-[0.06em] text-gray-700 font-serif truncate">
                      {item.name}
                    </h2>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-base font-medium tracking-wider text-gray-700 font-serif">
                        NT${item.price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-400">
                       {item.category}
                      </div>
                    </div>
                  </div>

                  {/* 🖥️ 桌機版 */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-medium tracking-[0.15em] text-gray-700 font-serif truncate">
                        {item.name}
                      </h2>
                      <div className="text-base font-semibold tracking-wide text-gray-900">
                        NT${item.price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1.5 opacity-70 tracking-widest">
                      分類：{item.category}
                    </div>
                  </div>
                </div>
              </Link>

              {/* ❤️ 收藏按鈕 (在 Wishlist 中通常點擊即移除) */}
              <button
                onClick={() => toggleWishlist(item.id)}
                className="absolute top-3 right-3 text-2xl z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                ❤️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}