export default function Home() {
  return (
    <div className="w-full">

      {/* --- HERO 首屏 --- */}
      <section className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-white flex flex-col items-center justify-center text-center text-white overflow-hidden">

        {/* 背景圖 */}
        <div className="absolute inset-0">
          <img
            src="https://pic8.sucaisucai.com/02/50/02950758_2.jpg"
            alt="Fashion background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* 標語 */}
        <div className="relative z-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
            - Insensible as a feather -
          </h1>
        </div>

        {/* 底部淡入漸層 */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent"></div>
      </section>


      {/* --- 第二屏：新品推薦 --- */}
      <section className="w-full py-20 bg-white">
        <h2 className="text-center text-3xl font-light mb-10 text-gray-800 font-['Playfair_Display']">
          新品推薦
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-6">

          {/* 商品卡（可複製使用） */}
          {[
            { name: "Tote Bag", price: "$1290", img: "https://via.placeholder.com/400x300/7b8190/ffffff?text=Tote+Bag" },
            { name: "Minimal Shirt", price: "$1680", img: "https://via.placeholder.com/400x300/7b8190/ffffff?text=Minimal+Shirt" },
            { name: "Pearl Necklace", price: "$900", img: "https://via.placeholder.com/400x300/7b8190/ffffff?text=Pearl+Necklace" }
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white shadow-md rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative"
            >
              {/* 圖片 */}
              <div className="overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* 商品資訊 */}
              <div className="p-4 text-center">
                <p className="text-lg text-gray-900 mt-4 font-['Playfair_Display']">
                  {item.name}
                </p>
                <p className="text-gray-700">{item.price}</p>
              </div>

              {/* ──────────────── hover 按鈕（動畫淡入） ──────────────── */}
              <div
                className="
                  absolute bottom-4 left-1/2 -translate-x-1/2
                  opacity-0 group-hover:opacity-100
                  translate-y-4 group-hover:translate-y-0
                  transition-all duration-300
                "
              >
                <button
                  className="px-6 py-2 bg-black/80 text-white text-sm rounded-full hover:bg-black transition"
                >
                  加入購物車
                </button>
              </div>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
