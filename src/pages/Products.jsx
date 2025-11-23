import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Products() {
  const { addToCart } = useCart();

  const allItems = [
    { id: 1, category: "bags", name: "Tote Bag", price: "$1290", image: "https://via.placeholder.com/600x500/d9d9d9/333?text=Tote+Bag" },
    { id: 2, category: "tops", name: "Minimal Shirt", price: "$1680", image: "https://via.placeholder.com/600x500/d9d9d9/333?text=Minimal+Shirt" },
    { id: 3, category: "accessories", name: "Pearl Necklace", price: "$900", image: "https://via.placeholder.com/600x500/d9d9d9/333?text=Pearl+Necklace" },
    { id: 4, category: "tops", name: "Soft Knit Sweater", price: "$1980", image: "https://via.placeholder.com/600x500/d9d9d9/333?text=Knit+Sweater" },
    { id: 5, category: "outerwear", name: "Structured Coat", price: "$3580", image: "https://via.placeholder.com/600x500/d9d9d9/333?text=Structured+Coat" },
    { id: 6, category: "bags", name: "Leather Shoulder Bag", price: "$2680", image: "https://via.placeholder.com/600x500/d9d9d9/333?text=Leather+Bag" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  // 依分類篩選
  const filteredItems =
    selectedCategory === "all"
      ? allItems
      : allItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="w-full py-20 bg-white">

      {/* 標題 */}
      <h1 className="text-center text-4xl font-light mb-12 font-['Playfair_Display'] text-gray-800">
        所有商品
      </h1>

      {/* 分類按鈕 */}
      <div className="flex justify-center mb-10 space-x-4">
        {[
          { key: "all", label: "全部" },
          { key: "tops", label: "上衣" },
          { key: "outerwear", label: "外套" },
          { key: "bags", label: "包款" },
          { key: "accessories", label: "飾品" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-full border transition
              ${
                selectedCategory === cat.key
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 商品列表 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 px-6">
        {filteredItems.map((item) => (
          
          <div
            key={item.id}
            className="
              group bg-white rounded-xl border border-gray-300 shadow-sm
              overflow-hidden transition-all duration-300 relative
              hover:shadow-2xl hover:-translate-y-2
            "
          >

            {/* 點擊前往詳細頁 */}
            <Link to={`/product/${item.id}`} className="block">
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* 商品文字 */}
              <div className="p-6 text-center">
                <p className="text-lg font-['Playfair_Display'] text-gray-900 tracking-wide">
                  {item.name}
                </p>
                <p className="mt-2 text-gray-700">{item.price}</p>
              </div>
            </Link>

            {/* ───── 懸浮加入購物車按鈕 ───── */}
            <div
              className="
                absolute bottom-5 left-1/2 -translate-x-1/2
                opacity-0 group-hover:opacity-100
                translate-y-4 group-hover:translate-y-0
                transition-all duration-300
              "
            >
              <button
                onClick={() =>
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                  })
                }
                className="
                  px-6 py-2 bg-black/80 text-white text-sm rounded-full
                  hover:bg-black transition tracking-wide
                "
              >
                加入購物車
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

