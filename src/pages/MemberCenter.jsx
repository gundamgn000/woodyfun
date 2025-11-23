export default function MemberCenter() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* 標題 */}
        <h1 className="text-3xl font-light text-gray-900 text-center mb-12 font-serif tracking-wide">
          會員中心
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* 基本資料 */}
          <div className="border border-gray-300 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-gray-800 mb-6">基本資料</h2>

            <p className="text-gray-700 mb-2"><strong>姓名：</strong> 王小美</p>
            <p className="text-gray-700 mb-2"><strong>Email：</strong> example@gmail.com</p>
            <p className="text-gray-700"><strong>電話：</strong> 0900-123-456</p>
            <a href="/member/edit">
                <button className="mt-6 px-5 py-2 border border-gray-700 text-gray-800 rounded-lg hover:bg-gray-100 transition">
                編輯資料
                </button>
            </a>

          </div>

          {/* 訂單列表 */}
          <div className="border border-gray-300 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-gray-800 mb-6">訂單紀錄</h2>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <p className="text-gray-900 font-medium">訂單編號：#A12345</p>
                <p className="text-gray-600 text-sm">狀態：已完成</p>
              </div>

              <div className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <p className="text-gray-900 font-medium">訂單編號：#A12346</p>
                <p className="text-gray-600 text-sm">狀態：處理中</p>
              </div>
            </div>

            <a href="/orders">
                <button className="mt-6 px-5 py-2 border border-gray-700 text-gray-800  rounded-lg hover:bg-gray-100 transition">
                 查看全部訂單
                </button>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
