import { useState } from "react";
import { Link } from "react-router-dom";

export default function Account() {
  const [emailNotice, setEmailNotice] = useState(true);
  const [smsNotice, setSmsNotice] = useState(false);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* 標題 */}
        <h1 className="text-3xl font-light text-gray-900 text-center mb-12 font-serif tracking-wide">
          帳號設定
        </h1>

        {/* 通知設定 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-light text-gray-800 mb-6">
            通知設定
          </h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-900">Email 通知</p>
              <p className="text-gray-600 text-sm">
                接收訂單狀態、最新活動等通知。
              </p>
            </div>
            <button
              onClick={() => setEmailNotice((prev) => !prev)}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition ${
                emailNotice ? "bg-black" : "bg-gray-300"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full transform transition ${
                  emailNotice ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">簡訊通知</p>
              <p className="text-gray-600 text-sm">
                僅在重要訊息時發送簡訊提醒。
              </p>
            </div>
            <button
              onClick={() => setSmsNotice((prev) => !prev)}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition ${
                smsNotice ? "bg-black" : "bg-gray-300"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full transform transition ${
                  smsNotice ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* 隱私 / 安全 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-light text-gray-800 mb-6">
            隱私與安全
          </h2>

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            我們僅會在提供服務所需的範圍內使用您的個人資料，不會任意提供給第三方。
          </p>

          <Link
            to="/profile/password"
            className="underline text-gray-700 hover:text-black text-sm"
          >
            修改密碼
          </Link>
        </div>

        {/* 危險區塊：刪除帳號（目前只示範用 alert） */}
        <div className="border border-red-300 rounded-xl p-8 shadow-sm mb-10 bg-red-50/40">
          <h2 className="text-xl font-light text-red-700 mb-4">
            刪除帳號
          </h2>
          <p className="text-red-700 text-sm mb-4">
            刪除後，您的訂單記錄與個人資料將無法復原。此功能目前僅為示範，不會真的刪除資料。
          </p>
          <button
            onClick={() => alert("示範用：實際專案上線前再接後端刪除帳號功能。")}
            className="px-5 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-100 transition text-sm"
          >
            刪除帳號（示範）
          </button>
        </div>

        {/* 返回 */}
        <div className="text-center">
          <Link
            to="/profile"
            className="underline text-gray-600 hover:text-black text-sm"
          >
            返回會員中心
          </Link>
        </div>
      </div>
    </div>
  );
}
