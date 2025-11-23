export default function EditProfile() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-xl border border-gray-300 rounded-xl shadow-sm p-10">

        {/* 標題 */}
        <h1 className="text-3xl font-light text-gray-900 text-center mb-10 font-serif tracking-wide">
          編輯個人資料
        </h1>

        {/* 姓名 */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">姓名</label>
          <input
            type="text"
            defaultValue="王小美"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 
                       focus:outline-none focus:border-black transition"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">電子郵件</label>
          <input
            type="email"
            defaultValue="example@gmail.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 
                       focus:outline-none focus:border-black transition"
          />
        </div>

        {/* 電話 */}
        <div className="mb-8">
          <label className="block text-gray-700 text-sm mb-2">電話</label>
          <input
            type="text"
            defaultValue="0900-123-456"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       focus:outline-none focus:border-black transition"
          />
        </div>

        {/* 儲存按鈕 */}
        <button className="w-full bg-black text-white py-3 rounded-lg tracking-wide 
                           hover:bg-gray-900 transition">
          儲存變更
        </button>

        {/* 返回 */}
        <div className="text-center text-sm mt-6">
          <a href="/member" className="underline text-gray-600 hover:text-black">
            返回會員中心
          </a>
        </div>

      </div>
    </div>
  );
}
