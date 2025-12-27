import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-24">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          
          {/* 左側：品牌資訊 */}
          <div className="mb-10 md:mb-0">
            <h2 className="text-2xl tracking-[0.4em] font-light text-[#6a625d] mb-2 font-serif">
              ADIAFOROS
            </h2>
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">
              As Soft as a Feather.
            </p>
          </div>

          {/* 中間：導航連結 */}
          <div className="flex space-x-12 mb-10 md:mb-0">
            <div className="flex flex-col items-center group cursor-pointer">
              <a href="/products" className="text-sm tracking-widest text-gray-600 group-hover:text-black transition-colors">商品</a>
              <span className="text-[9px] text-gray-300 tracking-tighter uppercase mt-1">Products</span>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <a href="/new" className="text-sm tracking-widest text-gray-600 group-hover:text-black transition-colors">新品上架</a>
              <span className="text-[9px] text-gray-300 tracking-tighter uppercase mt-1">New Arrivals</span>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <a href="/cart" className="text-sm tracking-widest text-gray-600 group-hover:text-black transition-colors">購物車</a>
              <span className="text-[9px] text-gray-300 tracking-tighter uppercase mt-1">Cart</span>
            </div>
          </div>

          {/* 右側：版權資訊 */}
          <div className="text-left md:text-right">
            <p className="text-[10px] text-gray-400 tracking-[0.15em] font-light">
              © {new Date().getFullYear()} ADIAFOROS. <br className="md:hidden" />
              ALL RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}