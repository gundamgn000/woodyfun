import { useEffect, useState } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "../pages/Products.css";
import weekLookImage from "../assets/home/week-look.png";
import weekLookMobile from "../assets/home/week-look-mobile.jpg";

// ===== This Week's Look category images =====
// 🔧 未來主頁中間方格要換圖片，只要改這裡
import knitImg from "../assets/week-knit.jpg";
import skirtImg from "../assets/week-skirt.jpg";
import coatImg from "../assets/week-coat.jpg";
import "./Home.css";
import heroDesktop from "../assets/home/hero-desktop.jpg";
// 🔧 未來要換首頁TOP主圖，只改這行
import heroMobile from "../assets/home/hero-mobile.png";










const Home = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);

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
        console.error("Failed to fetch new arrivals:", err);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <main>
     {/* ================= Hero / Main Visual ================= */}
      <section
        className="hero hero-desktop"
        style={{
          backgroundImage: `url(${heroDesktop})`
        }}
      >
        {/* 建議移除或淡化 overlay，讓圖片自然呈現 */}
        {/* <div className="hero-overlay" /> */}

        <div className="hero-content">
          <h1 className="hero-title">
            Insensible to Weight,<br />
          As Soft as a Feather.  
          </h1>

          {/* 如果要完全還原目標圖，可以暫時移除這段中文 */}
          {/* <p>
            溫柔・日常・剛剛好的穿搭選擇<br />
            為每一個平凡卻重要的日子而存在
          </p> */}

          <button
            className="hero-button"
            onClick={() => navigate("/products/new")}
          >
            Shop New Arrivals <span className="arrow">→</span>
          </button>
        </div>
      </section>


      {/* 手機版 Hero（先放結構，之後再調） */}
      {/* Mobile Hero */}
    
      {/* ===== Mobile Hero ===== */}
      <section
        className="hero hero-mobile"
        style={{
          backgroundImage: `url(${heroMobile})`
        }}
      >
        <div className="hero-overlay-mobile" />

        <div className="hero-content-mobile">
          <h1>
            Insensible to Weight,<br />
            As Soft as a Feather.
          </h1>

          <button
            className="hero-button"
            onClick={() => navigate("/products/new")}
          >
            SHOP NEW ARRIVALS
          </button>
        </div>
      </section>

      
      {/* ================= This Week's Look ================= */}
      <section className="week-look">
        <div className="week-look-container">
          <h2 className="week-look-title">This Week’s Look</h2>
          <p className="week-look-subtitle">
            A gentle knit for quiet afternoons.
          </p>

          <div className="week-look-grid">
            {/* 左側主視覺 */}
            <div
              className="week-look-image week-look-desktop"
              style={{ backgroundImage: `url(${weekLookImage})` }}
            >
              <div className="week-look-gradient" />
            </div>

            {/* Mobile image */}
            <div
              className="week-look-image week-look-mobile"
              style={{ backgroundImage: `url(${weekLookMobile})` }}
            >
            </div>

            {/* 右側分類卡 */}
            <div className="week-look-categories">
              {/* 毛衣 */}
              <div
                className="week-look-card"
                onClick={() => navigate("/products?category=毛衣")}
              >
                <div className="week-look-card-img">
                  <img src={knitImg} alt="毛衣 Knitwear" />
                </div>
                <div className="week-look-card-text">
                  <div className="zh">毛衣</div>
                  <div className="en">Knitwear</div>
                </div>
              </div>

              {/* 短裙 */}
              <div
                className="week-look-card"
                onClick={() => navigate("/products?category=短裙")}
              >
                <div className="week-look-card-img">
                  <img src={skirtImg} alt="短裙 Skirt" />
                </div>
                <div className="week-look-card-text">
                  <div className="zh">短裙</div>
                  <div className="en">Skirt</div>
                </div>
              </div>

              {/* 外套 */}
              <div
                className="week-look-card"
                onClick={() => navigate("/products?category=外套")}
              >
                <div className="week-look-card-img">
                  <img src={coatImg} alt="外套 Outerwear" />
                </div>
                <div className="week-look-card-text">
                  <div className="zh">外套</div>
                  <div className="en">Outerwear</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ================= New Arrivals ================= */}
      <section style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontWeight: 400,
              letterSpacing: "0.15em",
              marginBottom: "3rem"
            }}
          >
            NEW ARRIVALS
          </h2>

          <div className="home-products-wrapper">
            <div className="products-grid">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Home;
