import { useEffect, useState } from "react";
import { Link,useSearchParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { useWishlist } from "../context/WishlistContext";
import { HeartOutline, HeartFilled } from "../components/HeartIcons";

export default function Products() {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [products, setProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState("全部");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMethod, setSortMethod] = useState("default");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ⭐【飛行動畫】完全保留
  const createFlyingHeart = (startElement) => {
    if (!startElement) return;

    const start = startElement.getBoundingClientRect();
    const startX = start.left + start.width / 2;
    const startY = start.top + start.height / 2;

    const targetX = window.innerWidth - 40;
    const targetY = 20;

    const heart = document.createElement("div");
    heart.className = "flying-heart";
    heart.textContent = "❤️";

    heart.style.left = `${startX}px`;
    heart.style.top = `${startY}px`;

    document.body.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.transform = `translate(${targetX - startX}px, ${
        targetY - startY
      }px) scale(0.2)`;
      heart.style.opacity = "0";
    });

    setTimeout(() => heart.remove(), 650);
  };

// 當網址參數改變時，自動更新分類狀態
  useEffect(() => {
    if (categoryParam) {
      setFilteredCategory(categoryParam);
    } else {
      setFilteredCategory("全部");
    }
    setCurrentPage(1); 
  }, [categoryParam]);

    useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    };
    fetchProducts();
  }, []);

  // 分類
  const categories = ["全部", ...new Set(products.map((p) => p.category))];

  // 篩選
  let filteredProducts = products.filter((item) => {
    const matchCategory =
      filteredCategory === "全部" || item.category === filteredCategory;
    const matchSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 排序（完全不動）
  if (sortMethod === "price-low") {
    filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortMethod === "price-high") {
    filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortMethod === "newest") {
    filteredProducts = filteredProducts.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  }

  // 分頁
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCategory, searchTerm, sortMethod]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-semibold mb-10">商品列表</h1>

      {/* 搜尋 + 排序（不動） */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <input
          type="text"
          placeholder="搜尋商品名稱…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-full shadow-sm"
        />

        <select
          value={sortMethod}
          onChange={(e) => setSortMethod(e.target.value)}
          className="mt-4 md:mt-0 px-4 py-2 border rounded-full"
        >
          <option value="default">預設排序</option>
          <option value="price-low">價格：低 → 高</option>
          <option value="price-high">價格：高 → 低</option>
          <option value="newest">最新上架</option>
        </select>
      </div>

      {/* 分類（不動） */}
      <div className="flex space-x-3 mb-10 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSearchParams(cat === "全部" ? {} : { category: cat })}
            className={`px-5 py-2 rounded-full border whitespace-nowrap ${
              filteredCategory === cat
                ? "bg-black text-white"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ✅ 商品列表（視覺已對齊 Wishlist） */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayedProducts.map((item) => {
          const cover =
            item.mainImageUrl?.trim() !== ""
              ? item.mainImageUrl
              : "/placeholder.png";

          return (
            <Link
              to={`/products/${item.id}`}
              key={item.id}
              className="group block border rounded-2xl overflow-hidden hover:shadow-lg transition"
            >
              {/* 圖片區 */}
              <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                <img
                  src={cover}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* ❤️ 收藏按鈕 */}
              <button
                className="absolute top-3 right-3 text-4xl z-10"
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(item.id);
                  // ⭐ 套用飛行動畫
                }}
              >
                <span
                  className={`wish-heart ${
                    isWishlisted(item.id) ? "active" : ""
                  }`}
                >
                  {isWishlisted(item.id) ? "❤️" : "🤍"}
                </span>
              </button>
              </div>

              {/* 文字區 */}
              <div className="p-5">
                {/* 📱 手機版 */}
                <div className="md:hidden">
                  <h2 className="text-base font-medium tracking-[0.06em] text-gray-700 font-serif truncate">
                    {item.name}
                  </h2>

                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sx font-normal tracking-text-base font-medium tracking-wider text-gray-700 font-serif">
                      NT${item.price}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      分類：{item.category}
                    </div>
                  </div>
                </div>

                {/* 🖥️ 桌機版（完全回到原始結構） */}
                <div className="hidden md:block">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-widertruncattext-base font-medium tracking-[0.15em] text-gray-700 font-serif truncate">
                      {item.name}
                    </h2>
                    <div className="text-base font-semibold tracking-wide">
                      NT${item.price}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-0.5 opacity-60">
                    分類：{item.category}
                  </div>
                </div>
              </div>

            </Link>
          );
        })}
      </div>

      {/* 分頁（不動） */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 border rounded-lg"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === num ? "bg-black text-white" : ""
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 border rounded-lg"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
