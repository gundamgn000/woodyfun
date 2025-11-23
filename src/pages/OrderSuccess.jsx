import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-20">

      <div className="bg-white border border-gray-300 shadow-sm rounded-xl p-12 max-w-lg w-full text-center">

        {/* ✔️ 勾勾圖示（精品細線） */}
        <div className="mx-auto mb-8 w-24 h-24 flex items-center justify-center 
                        rounded-full border border-gray-300">
          <svg
            className="w-12 h-12 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        {/* 標題 */}
        <h1 className="text-3xl font-['Playfair_Display'] tracking-wide text-gray-900 mb-4">
          訂單成立
        </h1>

        {/* 說明文字 */}
        <p className="text-gray-700 leading-relaxed mb-10">
          感謝您的購買！<br />
          我們已收到您的訂單，將盡快安排出貨。
        </p>

        {/* 按鈕區 */}
        <div className="flex flex-col space-y-3">

          {/* 返回首頁 */}
          <Link
            to="/"
            className="
              w-full py-3 rounded-full bg-black text-white 
              hover:bg-gray-800 transition tracking-wide
            "
          >
            返回首頁
          </Link>

          {/* 查看訂單 */}
          <Link
            to="/orders"
            className="
              w-full py-3 rounded-full border border-gray-400 text-gray-800
              hover:bg-gray-100 transition tracking-wide
            "
          >
            查看我的訂單
          </Link>

        </div>
      </div>
    </div>
  );
}
