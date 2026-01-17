import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase'; // 👈 請確保此路徑正確指向你的 firebase 設定檔
import { collection, getDocs } from 'firebase/firestore';
import { Package, PlusCircle, ClipboardList, BarChart3, Loader2 } from 'lucide-react';

export default function AdminHome() {
  // 1. 設定儲存數據的狀態
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 2. 從 Firestore 抓取真實數據
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // 抓取 orders 集合的所有文件
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        
        // 設定目前的訂單總數
        setOrderCount(ordersSnapshot.size);
      } catch (error) {
        console.error("抓取後台數據失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 樣式定義
  const cardStyle = "group block p-6 bg-white shadow-sm rounded-2xl border border-gray-100 " + 
                    "transform transition-all duration-300 ease-out " + 
                    "hover:-translate-y-2 hover:shadow-2xl hover:border-orange-200 " + 
                    "active:scale-[0.98]"; 

  const iconContainerStyle = "w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4 " +
                             "group-hover:bg-orange-100 transition-colors duration-300";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">管理後台</h1>
        <p className="text-gray-500">
          Hi, <span className="text-orange-600 font-semibold">gundamgn000</span> 👋 這是您目前的商店實時概況。
        </p>
      </header>

      {/* 區塊一：快速統計摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-sm text-orange-600 font-medium">總訂單數</p>
          {loading ? (
            <Loader2 className="animate-spin text-orange-600 mt-1" size={20} />
          ) : (
            <p className="text-2xl font-bold text-gray-800">{orderCount}</p> // ✅ 顯示真實數據
          )}
        </div>
        {/* 你可以依此類推增加商品總數等統計 */}
      </div>

      {/* 區塊二：主要管理功能 */}
      <h2 className="text-xl font-semibold text-gray-700 mb-6">快速選單</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <a href="/admin/products" className={cardStyle}>
          <div className={iconContainerStyle}>
            <Package className="text-orange-600" size={24} />
          </div>
          <p className="text-lg font-bold text-gray-800">商品管理</p>
          <p className="text-sm text-gray-500 mt-2">編輯、新增、刪除所有木玩商品資料</p>
        </a>

        <a href="/admin/products/new" className={cardStyle}>
          <div className={iconContainerStyle}>
            <PlusCircle className="text-orange-600" size={24} />
          </div>
          <p className="text-lg font-bold text-gray-800">新增商品</p>
          <p className="text-sm text-gray-500 mt-2">快速上架新的精選玩具</p>
        </a>

        <a href="/admin/orders" className={cardStyle}>
          <div className={iconContainerStyle}>
            <ClipboardList className="text-orange-600" size={24} />
          </div>
          <p className="text-lg font-bold text-gray-800">訂單管理</p>
          <p className="text-sm text-gray-500 mt-2">處理客戶訂單、物流狀態追蹤</p>
        </a>

        <a href="/admin/dashboard" className={cardStyle}>
          <div className={iconContainerStyle}>
            <BarChart3 className="text-orange-600" size={24} />
          </div>
          <p className="text-lg font-bold text-gray-800">數據報表</p>
          <p className="text-sm text-gray-500 mt-2">查看銷售走勢與熱門商品統計</p>
        </a>
      </div>
    </div>
  );
}