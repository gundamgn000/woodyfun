export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center">

        {/* 左：品牌 LOGO */}
        <h2 className="text-xl tracking-[0.3em] font-light text-gray-800 mb-6 md:mb-0">
          ADIAFOROS
        </h2>

        {/* 中：頁面連結 */}
        <div className="flex space-x-8 text-sm tracking-wider text-gray-700 mb-6 md:mb-0">
          <a href="/products" className="hover:text-black transition">商品</a>
          <a href="/new" className="hover:text-black transition">新品上架</a>
          <a href="/cart" className="hover:text-black transition">購物車</a>
        </div>

        {/* 右：版權資訊 */}
        <p className="text-xs text-gray-500 tracking-widest text-center md:text-right">
          © {new Date().getFullYear()} ADIAFOROS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}