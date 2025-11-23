import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const items = [
    { id: "1", name: "Tote Bag", price: "$1290", image: "https://via.placeholder.com/700x600/7b8190/ffffff?text=Tote+Bag", description: "極簡托特包，適合日常及正式場合。" },
    { id: "2", name: "Minimal Shirt", price: "$1680", image: "https://via.placeholder.com/700x600/7b8190/ffffff?text=Minimal+Shirt", description: "俐落簡約襯衫，舒適透氣，百搭款式。" },
    { id: "3", name: "Pearl Necklace", price: "$900", image: "https://via.placeholder.com/700x600/7b8190/ffffff?text=Pearl+Necklace", description: "經典珍珠項鍊，點綴你的每一天。" },
    { id: "4", name: "Soft Knit Sweater", price: "$1980", image: "https://via.placeholder.com/700x600/7b8190/ffffff?text=Knit+Sweater", description: "柔軟的針織毛衣，適合秋冬穿搭。" },
    { id: "5", name: "Structured Coat", price: "$3580", image: "https://via.placeholder.com/700x600/7b8190/ffffff?text=Structured+Coat", description: "俐落大衣剪裁，展現高質感品味。" },
    { id: "6", name: "Leather Shoulder Bag", price: "$2680", image: "https://via.placeholder.com/700x600/7b8190/ffffff?text=Leather+Bag", description: "經典肩背包款，質感皮革耐用百搭。" }
  ];

  const product = items.find((item) => item.id == id);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <h1 className="text-center mt-20 text-xl">商品不存在</h1>;
  }

  const handleAddToCart = () => {
    addToCart(
      {
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    alert("已加入購物車");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <Link to="/products" className="text-gray-500 hover:text-black text-sm tracking-wide">
        ← 返回商品列表
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mt-10">
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <img
            src={product.image}
            className="w-full object-cover hover:scale-[1.02] transition-transform duration-500"
          />
        </div>

        <div>
          <h1 className="text-4xl font-['Playfair_Display'] text-gray-900 mb-4">
            {product.name}
          </h1>

          <p className="text-2xl text-gray-700 mb-6 font-light">{product.price}</p>

          <p className="text-gray-600 leading-relaxed mb-10">
            {product.description}
          </p>

          {/* 尺寸 */}
          <div className="mb-8">
            <p className="text-gray-700 mb-3 tracking-wide">尺寸</p>
            <div className="flex space-x-3">
              {["S", "M", "L"].map((size) => (
                <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  px-5 py-2 border rounded-full transition 
                  ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }
                  focus:outline-none
                `}
              >
                {size}
                </button>
              ))}
            </div>
          </div>

          {/* 數量 */}
          <div className="mb-8">
            <p className="text-gray-700 mb-3 tracking-wide">數量</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* 加入購物車 */}
          <button
            onClick={handleAddToCart}
            className="
             px-6 py-2 bg-[#222] text-white rounded-full hover:bg-black transition
            "
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
}
