export default function AdminHome() {
  // Border Pulse Style: 懸停縮放、點擊凹陷，並強調邊框顏色動畫
  const cardStyle = "block p-6 bg-white shadow-md rounded-xl border border-transparent " + // 預設透明邊框
                    "transform transition duration-300 ease-in-out " + 
                    
                    // 1. 懸停狀態 (Hover State): 放大、陰影加重，並將邊框顏色設為藍色
                    "hover:scale-[1.05] hover:shadow-xl hover:border-blue-500 hover:shadow-blue-200/50 " + // 放大 5%，邊框和陰影變藍
                    
                    // 2. 點擊狀態 (Active State): 模擬按下的凹陷感
                    "active:scale-[0.98] active:shadow-md active:border-blue-600 active:bg-gray-50"; 

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">後台首頁</h1>

      <p className="text-gray-600 mb-8">
        Hi, gundamgn000 👋 歡迎回來！請選擇要管理的項目。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 應用新的動畫樣式 cardStyle */}
        <a href="/admin/products" className={cardStyle}>
          <p className="text-lg font-medium text-gray-800">商品管理</p>
          <p className="text-sm text-gray-500 mt-1">編輯、新增、刪除商品資料</p>
        </a>

        <a href="/admin/products/new" className={cardStyle}>
          <p className="text-lg font-medium text-gray-800">新增商品</p>
          <p className="text-sm text-gray-500 mt-1">快速建立新的商品項目</p>
        </a>

        <a href="/admin/orders" className={cardStyle}>
          <p className="text-lg font-medium text-gray-800">訂單管理</p>
          <p className="text-sm text-gray-500 mt-1">處理客戶訂單、狀態追蹤</p>
        </a>

        <a href="/admin/dashboard" className={cardStyle}>
          <p className="text-lg font-medium text-gray-800">數據儀表板 (Dashboard)</p>
          <p className="text-sm text-gray-500 mt-1">查看銷售趨勢與統計數據</p>
        </a>
      </div>
    </div>
  );
}