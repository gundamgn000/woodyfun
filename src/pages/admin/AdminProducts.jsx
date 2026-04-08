import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import { Edit3, Trash2, Plus, Eye, Package, AlertCircle, Star, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- 新增 State ---
  const [sortMethod, setSortMethod] = useState("default"); // 排序狀態
  const [currentPage, setCurrentPage] = useState(1);       // 目前頁碼
  const itemsPerPage = 8;                                  // 每頁顯示數量 (可自行調整)

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    } catch (err) {
      console.error("取得商品失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 排序邏輯 ---
  const getSortedProducts = () => {
    let sorted = [...products];
    switch (sortMethod) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
      case "priceLow":
        return sorted.sort((a, b) => a.price - b.price);
      case "priceHigh":
        return sorted.sort((a, b) => b.price - a.price);
      case "stockLow":
        return sorted.sort((a, b) => a.stock - b.stock);
      case "stockHigh":
        return sorted.sort((a, b) => b.stock - a.stock);
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  // --- 分頁邏輯 ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // 切換排序時回到第一頁
  const handleSortChange = (e) => {
    setSortMethod(e.target.value);
    setCurrentPage(1);
  };

  // 其他原始功能 (handleDelete, toggleStatus, togglePopular) 保持不變...
  const handleDelete = async (id, name) => {
    if (window.confirm(`確定要刪除「${name}」嗎？此動作無法復原。`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(p => p.id !== id));
      } catch (err) { alert("刪除失敗"); }
    }
  };

  const toggleStatus = async (id, currentIsActive) => {
    const newIsActive = !currentIsActive;

    try {
      await updateDoc(doc(db, "products", id), {
        isActive: newIsActive,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isActive: newIsActive } : p
        )
      );
    } catch (err) {
      console.error("更新上下架狀態失敗:", err);
      alert("更新狀態失敗");
    }
  };

const togglePopular = async (id, currentIsPopular) => {
  const newPopularStatus = !currentIsPopular;

  try {
    await updateDoc(doc(db, "products", id), {
      isPopular: newPopularStatus,
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isPopular: newPopularStatus } : p
      )
    );
  } catch (err) {
    console.error("更新熱門失敗:", err);
    alert("更新熱門狀態失敗");
  }
};

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-400">木玩加載中...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="text-orange-600" /> 商品管理
          </h1>
          <p className="text-gray-500 mt-1">目前共有 {products.length} 款玩具，正在顯示第 {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} 款</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 🔥 排序下拉選單 */}
          <div className="relative">
            <select 
              value={sortMethod}
              onChange={handleSortChange}
              className="appearance-none pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="default">默認排序</option>
              <option value="name">依名稱排序</option>
              <option value="priceLow">價格：低到高</option>
              <option value="priceHigh">價格：高到低</option>
              <option value="stockLow">庫存：低到高</option>
              <option value="stockHigh">庫存：高到低</option>
            </select>
            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
          >
            <Plus size={20} /> 新增商品
          </Link>
        </div>
      </header>

      {/* 商品網格 - 使用 currentItems */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {currentItems.map((p) => (
          <div key={p.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden relative">
             {/* 內部的卡片 UI 保持不變 (Image, Status, Info, Buttons...) */}
             {/* ...請保留你原本卡片內的完整代碼... */}
             <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img src={p.mainImageUrl || p.imageUrl || "https://via.placeholder.com/300"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
                          p.isActive
                            ? "bg-green-500/90 text-white"
                            : "bg-gray-500/90 text-white"
                        }`}
                      >
                        {p.isActive ? "上架中" : "已下架"}
                      </span>                   <button onClick={() => togglePopular(p.id, p.isPopular)} className={`px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 transition-all ${p.isPopular ? 'bg-orange-500 text-white' : 'bg-white/90 text-gray-400 hover:text-orange-500'}`}>
                      <Star size={12} fill={p.isPopular ? "white" : "none"} /> {p.isPopular ? "熱門商品" : "設為熱門"}
                   </button>
                </div>
             </div>
             <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">{p.category}</span>
                   <span className="text-sm font-bold text-gray-900">NT$ {p.price}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-4 line-clamp-1">{p.name}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-5 pb-4 border-b">
                   <span>庫存: <b className={p.stock <= 5 ? "text-red-500" : "text-gray-800"}>{p.stock}</b></span>
                   <span>{p.ageRange}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <Link to={`/admin/products/edit/${p.id}`} className="flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"><Edit3 size={18} /></Link>
                   <button onClick={() => toggleStatus(p.id, p.isActive)}className={`flex items-center justify-center p-2 rounded-lg ${p.isActive ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-600"}`}><Eye size={18} />
                  </button>
                   <button onClick={() => handleDelete(p.id, p.name)} className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"><Trash2 size={18} /></button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* 🔥 分頁控制條 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-10">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg border font-bold text-sm transition-all ${
                  currentPage === i + 1 
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-100' 
                    : 'bg-white text-gray-500 hover:border-orange-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}