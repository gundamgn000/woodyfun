import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation  } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { useWishlist } from "../context/WishlistContext";
import { HeartOutline, HeartFilled } from "../components/HeartIcons";
import "./Products.css"; // 確保導入 CSS
import "../styles/ProductCard.css";
import { useAuth } from "../context/AuthContext";



export default function Products() {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 讀取
  const categoryParam = searchParams.get("category") || "全部";
  const qParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "default";
  const rawPage = Number(searchParams.get("page"));
  const pageParam = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const filterParam = searchParams.get("filter") || ""; // ✅ 新增這行

  // state（用來控制輸入框 UI）
  const [filteredCategory, setFilteredCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [sortMethod, setSortMethod] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [products, setProducts] = useState([]);
  const [justAddedId, setJustAddedId] = useState(null);

  // 讓「使用者按上一頁/下一頁」時，state 會跟著 URL 更新
  useEffect(() => setFilteredCategory(categoryParam), [categoryParam]);
  useEffect(() => setSearchTerm(qParam), [qParam]);
  useEffect(() => setSortMethod(sortParam), [sortParam]);
  useEffect(() => setCurrentPage(pageParam), [pageParam]);

  // 小工具：合併更新 query（不會把其他參數洗掉）
  const updateParams = (patch) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "" || v === "全部") p.delete(k);
      else p.set(k, String(v));
    });
    setSearchParams(p, { replace: true });
  };
  const { user } = useAuth();
  const itemsPerPage = 6;
  const getPaginationItems = (current, total) => {
    if (total <= 1) return [1];

    const pages = [];

    // 頁數少時直接全部顯示
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    // 第一頁和中間區段有落差時顯示省略號
    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // 中間區段和最後一頁有落差時顯示省略號
    if (end < total - 1) {
      pages.push("...");
    }

    pages.push(total);

    return pages;
  };

  const handleWishlistClick = (e, productId) => {
  e.preventDefault();

  if (!user) {
    alert("登入後才能收藏喔 💛");
    return;
  }

  const willAdd = !isWishlisted(productId);
  toggleWishlist(productId);

  if (willAdd) {
    createFlyingHeart(e.currentTarget);
    setJustAddedId(productId);
    setTimeout(() => setJustAddedId(null), 1200);
  }
};

  const safeImg = (url) =>
  url && url.trim() !== ""
    ? url
    : "https://placehold.co/400x400?text=No+Image";


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

    setTimeout(() => {
      heart.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`;
      heart.style.opacity = "0";
    }, 50);

    setTimeout(() => {
      heart.remove();
    }, 700);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((p) => p.isActive === true); // 🔥 關鍵
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // 排序與過濾邏輯
  let displayItems = products
    // 🔥 關鍵新增：處理熱門商品過濾
    // 如果網址有 ?filter=popular，就只顯示 isPopular 為 true 的商品
    .filter((p) => (filterParam === "popular" ? p.isPopular === true : true))

    // 2. 原有的分類過濾
    .filter((p) => (filteredCategory === "全部" ? true : p.category === filteredCategory))

    // 3. 原有的搜尋過濾
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (sortMethod === "priceLow") {
  displayItems = [...displayItems].sort((a, b) => a.price - b.price);
  } else if (sortMethod === "priceHigh") {
    displayItems = [...displayItems].sort((a, b) => b.price - a.price);
  } else if (sortMethod === "newest") {
  // 如果你有「最新上架」排序也可以保留
    displayItems = [...displayItems].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const currentItems = displayItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginationItems = getPaginationItems(currentPage, totalPages);


  return (
    <div className="products-page-container">
      <div className="products-header">
        <div className="products-header-left">
          {/* 🔥 根據 filterParam 顯示標題 */}
          <h2>
            {filterParam === "popular" ? "🔥 熱門推薦商品" : filteredCategory}
          </h2>
          <p className="products-count">共 {displayItems.length} 件商品</p>
        </div>
      </div>

      {/* 控制列：搜尋與分類 */}
      <div className="controls-area">
        <div className="search-sort-row">
          <input
            type="text"
            className="search-input"
            placeholder="搜尋玩具名稱..."
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value;
              setSearchTerm(val);
              setCurrentPage(1);
              updateParams({ q: val, page: 1 });
            }}
          />
          <select
            className="sort-select"
            value={sortMethod}
            onChange={(e) => {
              const val = e.target.value;
              setSortMethod(val);
              setCurrentPage(1);
              updateParams({ sort: val, page: 1 });
            }}
          >
            <option value="default">預設排序</option>
            <option value="priceLow">價格：由低到高</option>
            <option value="priceHigh">價格：由高到低</option>
          </select>
        </div>

        <div className="filter-pill-container">
          {["全部", "感官啟蒙", "益智拼圖", "建構邏輯"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilteredCategory(cat);
                setCurrentPage(1);
                updateParams({ category: cat === "全部" ? null : cat, page: 1 });
              }}
              className={`filter-pill ${filteredCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      
      <div className="products-grid">
        {currentItems.map((item) => {
          const mainImage =
            item.mainImageUrl ||
            item.imageUrl ||
            item.images?.[0]?.url ||
            item.images?.[0] ||
            item.image ||
            "/placeholder-product.png";

          return (
            <div key={item.id} className="product-card-wrapper">
              <Link
                to={`/product/${item.id}`}
                state={{ from: location.pathname + location.search }}
                className="product-card-link"
              >
                <div className="product-image-wrapper">
                  <img
                    src={safeImg(mainImage)}
                    alt={item.name}
                  />
                </div>

                <div className="product-info">
                  <div className="product-card-category">{item.category}</div>
                  <div className="product-card-category">
                    建議年齡 {item.ageRange || "全齡適用"}
                  </div>
                  <h2 className="product-name">{item.name}</h2>
                  <div className="product-card-price">NT$ {item.price}</div>
                </div>
              </Link>

              <button
                className="wishlist-btn"
                onClick={(e) => handleWishlistClick(e, item.id)}
              >
                {justAddedId === item.id && (
                  <div className="wishlist-hint">已加入收藏</div>
                )}

                {isWishlisted(item.id)
                  ? <HeartFilled color="#f39c42" />
                  : <HeartOutline color="#ccc" />}
              </button>
            </div>
          );
        })}
      </div>


      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-arrow"
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                updateParams({ page: currentPage - 1 });
              }
            }}
            disabled={currentPage === 1}
            aria-label="上一頁"
          >
            &lt;
          </button>

          {paginationItems.map((item, index) =>
            item === "..." ? (
              <span key={`ellipsis-${index}`} className="page-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => {
                  setCurrentPage(item);
                  updateParams({ page: item });
                }}
                className={`page-num ${currentPage === item ? "active" : ""}`}
              >
                {item}
              </button>
            )
          )}

          <button
            className="page-arrow"
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
                updateParams({ page: currentPage + 1 });
              }
            }}
            disabled={currentPage === totalPages}
            aria-label="下一頁"
          >
            &gt;
          </button>
        </div>
      )}

      
    </div>
  );
}