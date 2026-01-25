import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#faf9f6] border-t border-[#f0eee9] mt-24">
      <div className="max-w-7xl mx-auto px-8 py-16 lg:pl-[300px]"> 
        {/* lg:pl-[300px] 確保在桌機版時，內容不會被左側 Navbar 擠壓得太難看 */}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          
          {/* 左側：品牌精神 */}
          <div className="space-y-4">
            <h2 className="text-2xl tracking-[0.3em] font-bold text-[#6a625d] font-serif">
              木趣小屋
            </h2>
            <div className="h-1 w-12 bg-[#f39c42] rounded-full"></div>
            <p className="text-sm leading-relaxed text-[#8c8580] max-w-xs">
              我們相信每一塊木頭都有靈魂，透過溫潤的手感與天然的色彩，陪伴孩子在玩樂中探索世界，開啟無限想像力。
            </p>
          </div>

          {/* 中左：快速連結 */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-[#94a672] font-bold tracking-widest text-xs uppercase">
              快速連結 / Explore
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link to="/products" className="footer-link">所有商品 Products</Link>
              <Link to="/about" className="footer-link">品牌故事 Our Story</Link>
              <Link to="/wishlist" className="footer-link">收藏清單 Wishlist</Link>
              <Link to="/profile" className="footer-link">會員中心 Member</Link>
            </nav>
          </div>

          {/* ✅ 中右：消費者資訊（獨立一欄） */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-[#94a672] font-bold tracking-widest text-xs uppercase">
              消費者資訊 / Consumer Information
            </h3>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link to="/consumer-policy" className="footer-link">消費者權益與購物須知</Link>
              <Link to="/consumer-policy#privacy" className="footer-link">隱私權政策</Link>
              <Link to="/consumer-policy#terms" className="footer-link">服務條款</Link>
              <Link to="/consumer-policy#refund" className="footer-link">退換貨政策</Link>
              <Link to="https://line.me/R/ti/p/@153bbxjj" className="footer-link">聯絡客服</Link>
            </nav>
          </div>

          {/* 右側：聯繫與社群 */}
          <div className="space-y-4">
            <h3 className="text-[#94a672] font-bold tracking-widest text-xs uppercase">關注我們 / Follow Us</h3>
            <div className="flex space-x-4">
              {/* 這裡可以放你的社群圖標或連結 */}
              <a href="#" className="social-icon">Instagram</a>
              <a href="#" className="social-icon">Facebook</a>
            </div>
            <div className="pt-4">
              <p className="text-[11px] text-[#b2adaa] tracking-widest uppercase">
                &copy; {currentYear} WOODYFUN Co. <br/> 
                給孩子第一份溫潤的木製禮物
              </p>
            </div>
          </div>

        </div>

        {/* 底部裝飾線 */}
        <div className="mt-16 pt-8 border-t border-[#eee] text-center md:text-left">
          <p className="text-[10px] text-[#ccc] tracking-[0.2em] uppercase">
            Designed for Pure Childhood Memories.
          </p>
        </div>
      </div>

      {/* 針對 Footer 的小樣式 (可以直接寫在全域或 Footer 內部) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-link {
          font-size: 13px;
          color: #6a625d;
          text-decoration: none;
          transition: all 0.3s ease;
          width: fit-content;
        }
        .footer-link:hover {
          color: #f39c42;
          padding-left: 5px;
        }
        .social-icon {
          font-size: 12px;
          color: #8c8580;
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: 0.3s;
        }
        .social-icon:hover {
          color: #6a625d;
        }
      `}} />
    </footer>
  );
}