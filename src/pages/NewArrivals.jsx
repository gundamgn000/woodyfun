import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function NewArrivals() {

  const { addToCart } = useCart();

  const items = [
    { id: 1, name: "New Tote Bag", price: "$1490", image: "https://via.placeholder.com/600x500/dcdcdc/111?text=New+Tote" },
    { id: 2, name: "New Minimal Shirt", price: "$1780", image: "https://via.placeholder.com/600x500/dcdcdc/111?text=New+Shirt" },
    { id: 3, name: "New Pearl Necklace", price: "$980", image: "https://via.placeholder.com/600x500/dcdcdc/111?text=New+Pearl" },
  ];

  return (
    <div className="w-full py-20 bg-[#fafafa]">

      {/* 標題 */}
      <h1 className="text-center text-4xl font-['Playfair_Display'] tracking-wide mb-3 text-gray-900">
        新品上架
      </h1>

      <p className="text-center text-gray-600 mb-12">
        精選本季最新單品，為你打造簡約高級的穿搭。
      </p>

      {/* 商品區塊 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 px-6">
        
        {items.map((item) => (
          <div
            key={item.id}
            className="
              group bg-white border border-gray-300 rounded-xl shadow-sm
              transition-all duration-300 overflow-hidden relative
              hover:-translate-y-2 hover:shadow-2xl
            "
          >
            
            {/* 點進商品詳細頁 */}
            <Link to={`/product/${item.id}`} className="block">
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5 text-center">
                <p className="text-lg font-['Playfair_Display'] text-gray-900">{item.name}</p>
                <p className="text-gray-700 mt-1">{item.price}</p>
              </div>
            </Link>

            {/* ────── 懸浮加入購物車按鈕 ────── */}
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
