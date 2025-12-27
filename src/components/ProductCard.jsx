import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const cover =
    product.mainImageUrl?.trim() !== ""
      ? product.mainImageUrl
      : "/placeholder.png";

  return (
    <Link to={`/products/${product.id}`} className="home-product-card">
      {/* 圖片 */}
      <div className="home-product-image">
        <img src={cover} alt={product.name} />
      </div>

      {/* 文字 */}
      <div className="home-product-info">
        <h3 className="home-product-name">{product.name}</h3>
        <div className="home-product-price">NT${product.price}</div>
      </div>
    </Link>
  );
}
