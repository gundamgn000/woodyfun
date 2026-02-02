import { useEffect, useState } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./Home.css";

// ===== 圖片導入區 =====
// 🔧 這裡請替換成你實際的圖片路徑


import sensoryImg from "../assets/home/categories/sensory.jpg";
import puzzleImg  from "../assets/home/categories/puzzles.jpg";
import logicImg   from "../assets/home/categories/logic.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);

  // 抓取最新上架產品
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNewArrivals(items);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <div className="home-container">
      {/* 1. Hero Section - 品牌大圖 */}
      <section className="hero-desktop">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-brand-wood font-serif">
            木趣小屋 Woodyfun <br />
            用自然的溫度 相伴孩子的每一天
          </h1>
          <p className="mt-6 text-gray-600 tracking-widest text-lg leading-relaxed">
            精選學齡前益智玩具，<br />
            陪伴孩子啟動探索與學習的第一步。
          </p>
          <button 
            onClick={() => navigate("/products")}
            className="mt-10 bg-[#f39c42] text-white px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all font-bold tracking-widest"
          >
            探索木育系列
          </button>
        </div>
      </section>

      {/* 2. Toy Categories - 玩具分類 */}
      <section className="week-look-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl text-[#6a625d] tracking-[0.2em] font-bold mb-4">
              玩具分類
            </h2>
            <div className="w-12 h-1 bg-[#f39c42] mx-auto"></div>
          </div>
          
          <div className="week-look-grid">
            {/* 分類 1: 感官啟蒙 */}
            <div className="week-look-card" onClick={() => navigate("/products?category=感官啟蒙")}>
              <div className="week-look-card-img">
                <img src={sensoryImg} alt="感官啟蒙" loading="lazy" />
              </div>
              <div className="week-look-card-text">
                <div className="zh text-[#6a625d]">感官啟蒙</div>
                <div className="en text-[#94a672]">Sensory Play</div>
              </div>
            </div>

            {/* 分類 2: 益智拼圖 */}
            <div className="week-look-card" onClick={() => navigate("/products?category=益智拼圖")}>
              <div className="week-look-card-img">
                <img src={puzzleImg} alt="益智拼圖" loading="lazy" />
              </div>
              <div className="week-look-card-text">
                <div className="zh text-[#6a625d]">益智拼圖</div>
                <div className="en text-[#94a672]">Puzzles & Games</div>
              </div>
            </div>

            {/* 分類 3: 建構邏輯 */}
            <div className="week-look-card" onClick={() => navigate("/products?category=建構邏輯")}>
              <div className="week-look-card-img">
                <img src={logicImg} alt="建構邏輯" loading="lazy" />
              </div>
              <div className="week-look-card-text">
                <div className="zh text-[#6a625d]">建構邏輯</div>
                <div className="en text-[#94a672]">Building Blocks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals - 最新上架 */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
            <h2 className="text-2xl text-[#6a625d] tracking-[0.15em] font-bold">
              新品上架 <br /> 
              <span className="text-gray-300 font-light ml-1">/ NEW ARRIVALS</span>
            </h2>
            <button 
              onClick={() => navigate("/products")}
              className="text-[#f39c42] hover:underline text-sm font-medium"
            >
              查看全部 →
            </button>
          </div>

          <div className="products-grid">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Footer Placeholder - 品牌小語 */}
      <section className="bg-[#e8a348ff] py-16 text-center text-white">
        <p className="italic tracking-widest opacity-90">
          " Every wooden toy has its own story and warmth. "
        </p>
      </section>
    </div>
  );
};

export default Home;