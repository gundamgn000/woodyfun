// src/pages/ConsumerPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ConsumerPolicy() {
  const sections = [
    { id: "rights", label: "消費者權益" },
    { id: "terms", label: "服務條款" },
    { id: "privacy", label: "隱私權政策" },
    { id: "payment", label: "付款方式" },
    { id: "shipping", label: "出貨與配送" },
    { id: "refund", label: "退貨與退款" },
    { id: "contact", label: "客服聯絡" },
    { id: "others", label: "其他說明" },
  ];

  return (
    <main className="min-h-[70vh] bg-[#fbfaf7]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide text-[#2b2b2b]">
            消費者權益與購物須知
          </h1>
          <p className="mt-3 text-sm md:text-base leading-7 text-[#5b5b5b]">
            歡迎您光臨 <span className="font-medium">木趣小屋 Woodyfun</span>
            （以下簡稱「本網站」）。為保障您的權益並讓您安心購物，請詳閱以下說明。
          </p>

          {/* Quick actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <a
             href="https://line.me/R/ti/p/@153bbxjj"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center rounded-full border border-[#e6e0d6] px-4 py-2 text-[#2b2b2b] hover:bg-white"
            >
             前往 LINE 客服
            </a>

            <a
             href="#contact"
             className="inline-flex items-center rounded-full border border-[#e6e0d6] px-4 py-2 text-[#2b2b2b] hover:bg-white"
            >
             查看客服資訊
            </a>

          </div>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sticky TOC */}
          <aside className="md:sticky md:top-24 h-fit rounded-2xl border border-[#eee7dd] bg-white/70 p-5">
            <div className="text-xs tracking-widest font-semibold text-[#94a672] uppercase">
              目錄 / Contents
            </div>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-lg px-3 py-2 text-[#2b2b2b] hover:bg-[#faf6ee]"
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="mt-5 text-xs leading-6 text-[#6a6a6a]">
              提示：此頁內容可提供第三方金流審核參考。若政策有更新，將以本頁公告為準。
            </div>
          </aside>

          {/* Content */}
          <article className="space-y-10">
            <Section id="rights" title="一、消費者權益說明">
              <p>
                本網站依《消費者保護法》相關規定，保障消費者之合法權益。我們致力於提供安全、
                清楚、透明的購物環境，所有商品資訊、價格與交易流程皆於網站上明確揭露。
              </p>
            </Section>

            <Section id="terms" title="二、服務條款">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  當您使用本網站服務或完成訂購流程，即表示您已閱讀、了解並同意本網站之所有條款內容。
                </li>
                <li>
                  本網站保留隨時調整、修改或終止各項服務內容之權利，並於網站公告後生效。
                </li>
                <li>
                  若有任何違反法令或影響其他使用者權益之行為，本網站有權暫停或終止該帳號之使用。
                </li>
              </ol>
            </Section>

            <Section id="privacy" title="三、隱私權政策">
              <p className="mb-4">
                本網站非常重視您的個人資料保護，並遵守個人資料保護法之相關規定。
              </p>

              <h3 className="text-base font-semibold text-[#2b2b2b] mt-2">
                我們可能蒐集的資料包含
              </h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>姓名</li>
                <li>聯絡電話</li>
                <li>電子郵件地址</li>
                <li>收件地址</li>
                <li>訂單與付款相關資訊</li>
              </ul>

              <h3 className="text-base font-semibold text-[#2b2b2b] mt-6">
                資料使用說明
              </h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>僅用於訂單處理、付款、出貨與客戶服務用途</li>
                <li>不會任意出售、交換或提供給第三方</li>
                <li>
                  於法律規定或配合金流、物流服務時，僅在必要範圍內提供相關資料
                </li>
              </ul>
            </Section>

            <Section id="payment" title="四、付款方式說明">
              <p>
                本網站提供第三方金流平台進行付款（如信用卡等方式）。所有付款流程皆透過安全加密機制處理，
                以確保交易安全。
              </p>
            </Section>

            <Section id="shipping" title="五、出貨與配送說明">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  訂單完成付款後，將於 <span className="font-semibold">3–5 個工作天內出貨</span>（不含例假日）。
                </li>
                <li>若遇特殊情況（如天候、物流異常或預購商品），出貨時間將另行通知。</li>
                <li>實際配送時間依物流公司作業為準。</li>
              </ul>
            </Section>

            <Section id="refund" title="六、退貨與退款政策">
              <p className="mb-4">
                依《消費者保護法》規定，您享有商品到貨後{" "}
                <span className="font-semibold">7 日鑑賞期</span>（非試用期）。
              </p>

              <h3 className="text-base font-semibold text-[#2b2b2b] mt-2">
                退貨須知
              </h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>商品需保持全新狀態，並保留完整包裝（含配件、贈品）。</li>
                <li>若商品已有使用痕跡、損壞或包裝不完整，將影響退貨權益。</li>
              </ul>

              <h3 className="text-base font-semibold text-[#2b2b2b] mt-6">
                退款方式
              </h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>確認退貨成立後，將以原付款方式退還款項。</li>
                <li>實際退款時間依金流平台作業為準。</li>
              </ul>
            </Section>

            <Section id="contact" title="七、客服聯絡方式">
              <p className="mb-3">
                若您對訂單、商品或本網站服務有任何疑問，歡迎與我們聯繫：
              </p>
              <div className="rounded-2xl border border-[#eee7dd] bg-white/70 p-5 space-y-2">
                <p>
                  客服信箱：{" "}
                  <a
                    href="mailto:support@woodyfun.com"
                    className="font-semibold underline underline-offset-4"
                  >
                    support@woodyfun.com
                  </a>
                </p>
                <p>
                  或前往：{" "}
                  <Link
                    to="/contact"
                    className="font-semibold underline underline-offset-4"
                  >
                    聯絡客服頁面
                  </Link>
                </p>
                <p className="text-sm text-[#6a6a6a]">
                  我們將盡快為您提供協助。
                </p>
              </div>
            </Section>

            <Section id="others" title="八、其他說明">
              <p>
                本網站保留隨時修訂本政策內容之權利。修改後將公告於本頁，恕不另行個別通知。
              </p>
            </Section>

            {/* Bottom back-to-top */}
            <div className="pt-2">
              <a
                href="#"
                className="inline-flex items-center rounded-full border border-[#e6e0d6] px-4 py-2 text-sm text-[#2b2b2b] hover:bg-white"
              >
                回到頂部
              </a>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-[#eee7dd] bg-white/60 p-6 md:p-7"
    >
      <h2 className="text-lg md:text-xl font-semibold tracking-wide text-[#2b2b2b]">
        {title}
      </h2>
      <div className="mt-4 text-sm md:text-base leading-7 text-[#4e4e4e]">
        {children}
      </div>
    </section>
  );
}
