import React from 'react';
import "./About.css";

export default function About() {
  return (
    <div className="about-page-container">
      <div className="max-w-4xl mx-auto">
        <header className="about-header text-center mb-16">
          <h1 className="text-4xl font-bold text-[#6a625d] tracking-widest mb-4">OUR STORY</h1>
          <p className="text-[#94a672] font-medium">木趣小屋：關於溫度的傳承</p>
        </header>

        <section className="about-content space-y-20">
          {/* 第一區塊：起源 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-[#6a625d]">因為一份純粹的愛</h2>
              <p className="text-[#8c8580] leading-relaxed">
                木趣小屋的誕生，源於一位父親想為孩子尋找「不會過時」的玩具。
                在充斥著電子產品與塑膠玩具的時代，我們懷念木頭那份溫潤、踏實的觸感。
              </p>
            </div>
            <div className="flex-1 about-img-box">
              {/* 這裡之後可以放一張溫馨的木工坊或父子玩樂圖 */}
              <img src="/assets/about-1.webp" alt="我們的故事" className="rounded-[30px]" />
            </div>
          </div>

          {/* 第二區塊：堅持 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-[#6a625d]">堅持，在細節之中</h2>
              <p className="text-[#8c8580] leading-relaxed">
                我們選用永續森林的木材，每一條弧度都經過反覆手工打磨，
                確保沒有任何尖銳邊角，只有最純粹的安全與質感。
              </p>
            </div>
            <div className="flex-1 about-img-box">
              <img src="/assets/about-2.webp" alt="堅持細節" className="rounded-[30px]" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}