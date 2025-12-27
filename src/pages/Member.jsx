// src/pages/Member.jsx
export default function Member() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">

      <h1 className="text-3xl font-light mb-10 text-gray-800 tracking-wide">
        會員中心
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 個人資料 */}
        <a
          href="/profile"
          className="block p-6 border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-medium mb-2">個人資料</h2>
          <p className="text-gray-600 text-sm">查看您的個人資料與帳號資訊</p>
        </a>

        {/* 編輯資料 */}
        <a
          href="/profile/edit"
          className="block p-6 border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-medium mb-2">編輯資料</h2>
          <p className="text-gray-600 text-sm">修改您的姓名、Email 等資料</p>
        </a>

        {/* 修改密碼 */}
        <a
          href="/profile/password"
          className="block p-6 border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-medium mb-2">修改密碼</h2>
          <p className="text-gray-600 text-sm">更改您的登入密碼</p>
        </a>

        {/* 歷史訂單（新增） */}
        <a
          href="/orders"
          className="block p-6 border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-medium mb-2">歷史訂單</h2>
          <p className="text-gray-600 text-sm">查看過往訂單與出貨狀態</p>
        </a>

      </div>
    </div>
  );
}
