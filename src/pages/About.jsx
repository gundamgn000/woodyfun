import React from 'react';
import "./About.css";
import aboutImg1 from "../assets/about-1.jpeg";
import aboutImg2 from "../assets/about-2.jpeg";


export default function About() {
  return (
    <div className="about-page-container">
      <div className="max-w-4xl mx-auto">
        <header className="about-header text-center mb-16">
          <h1 className="text-4xl font-bold text-[#6a625d] tracking-widest mb-4">
            關於木趣小屋 Woodyfun
          </h1>
          <p className="text-[#94a672] font-medium">木趣小屋：關於溫度的傳承</p>
        </header>

        <section className="about-content space-y-20">
          {/* 第一區塊：起源 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-[#6a625d]">因為一份純粹的愛</h2>
              <p className="text-[#8c8580] leading-relaxed">
                木趣小屋的誕生，源於一位父親想為孩子尋找「不會過時」的玩具。
                在充斥著電子產品與快速消耗品的時代，
                我們開始思考：什麼樣的遊戲，能真正陪伴孩子成長？
                <br /><br />
                從木製玩具出發，我們逐步延伸至各類適合 0–6 歲孩子的益智型玩具，
                希望孩子在遊戲中，不只是玩得開心，
                更能培養專注力、思考力與想像力。
              </p>
            </div>
            <div className="flex-1 about-img-box">
              {/* 這裡之後可以放一張溫馨的木工坊或父子玩樂圖 */}
              <img 
                src={aboutImg1}
                alt="木趣小屋 Woodyfun 創辦理念與木製益智玩具品牌故事"
              />

            </div>
          </div>

          {/* 第二區塊：堅持 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-[#6a625d]">用心，在每一次陪伴裡</h2>
              <p className="text-[#8c8580] leading-relaxed">
                因為孩子的成長，值得被好好對待。
                我們相信，真正的用心，不只是挑選玩具，
                而是陪孩子一起笑、一起嘗試、一起慢慢長大。
                那些看似平凡的玩耍時光，
                其實正在悄悄累積成孩子一輩子的安全感與自信心。              </p>


            </div>
            <div className="flex-1 about-img-box">
              <img 
                src={aboutImg2}
                alt="木趣小屋 Woodyfun 木製益智玩具的安全與細節堅持"
              />

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}