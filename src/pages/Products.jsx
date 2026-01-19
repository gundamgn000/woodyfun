import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { useWishlist } from "../context/WishlistContext";
import { HeartOutline, HeartFilled } from "../components/HeartIcons";
import "./Products.css"; // 確保導入 CSS

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
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setFilteredCategory(categoryParam);
    } else {
      setFilteredCategory("全部");
    }
  }, [categoryParam]);

  // 排序與過濾邏輯
  let displayItems = products
    .filter((p) => (filteredCategory === "全部" ? true : p.category === filteredCategory))
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (sortMethod === "priceLow") displayItems.sort((a, b) => a.price - b.price);
  if (sortMethod === "priceHigh") displayItems.sort((a, b) => b.price - a.price);

  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const currentItems = displayItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  


  return (
    <div className="products-page-container">
      <div className="products-header">
        <h1 className="products-title">探索木育玩具</h1>
        <p className="products-subtitle">精選優質原木，開啟孩子純粹的探索時光</p>
      </div>

      {/* 控制列：搜尋與分類 */}
      <div className="controls-area">
        <div className="search-sort-row">
          <input
            type="text"
            className="search-input"
            placeholder="搜尋玩具名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="sort-select"
            value={sortMethod} 
            onChange={(e) => setSortMethod(e.target.value)}
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
                setSearchParams(cat === "全部" ? {} : { category: cat });
                setCurrentPage(1);
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
            item.images?.[0]?.url ||        // images 是 [{url}]
            item.images?.[0] ||             // images 是 ["url"]
            item.image ||                   // image 是單一字串
            "/placeholder-product.png";


          return (
            <div key={item.id} className="product-card-wrapper">
              <Link to={`/product/${item.id}`} className="product-card-link">
                <div className="product-image-wrapper">
                  <img
                    src={safeImg(item.mainImageUrl || item.imageUrl)}
                    alt={item.name}
                  />
                  
                </div>

                <div className="product-info">
                  <div className="category-tag">{item.category}</div>
                  <h2 className="product-name">{item.name}</h2>
                  <div className="product-price">NT$ {item.price}</div>
                </div>
              </Link>

              <button
                className="wishlist-btn"
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(item);
                  if (!isWishlisted(item.id)) createFlyingHeart(e.currentTarget);
                }}
              >
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`page-num ${currentPage === num ? "active" : ""}`}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      
    </div>
  );
}