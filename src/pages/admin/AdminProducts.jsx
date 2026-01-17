import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import { Edit3, Trash2, Plus, Eye, Package, AlertCircle } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id, name) => {
    if (window.confirm(`確定要刪除「${name}」嗎？此動作無法復原。`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert("刪除失敗");
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "products", id), { status: newStatus });
      setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert("更新狀態失敗");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-400">木玩加載中...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="text-orange-600" /> 商品管理
          </h1>
          <p className="text-gray-500 mt-1">目前共有 {products.length} 款精選玩具已上架</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={20} /> 新增木玩商品
        </Link>
      </header>

      {/* 商品網格清單 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
            {/* 商品圖片區 */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              <img 
                src={p.mainImageUrl || p.imageUrl || "https://via.placeholder.com/300"} 
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  p.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {p.status === 'active' ? '上架中' : '已下架'}
                </span>
                {p.stock <= 5 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                    <AlertCircle size={12} /> 低庫存
                  </span>
                )}
              </div>
            </div>

            {/* 內容區 */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">{p.category}</span>
                <span className="text-sm font-bold text-gray-900">NT$ {p.price}</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-4 line-clamp-1">{p.name}</h3>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-5 pb-4 border-b">
                <span>庫存數量: <b className={p.stock <= 5 ? "text-red-500" : "text-gray-800"}>{p.stock}</b></span>
                <span>{p.ageRange}</span>
              </div>

              {/* 操作按鈕 */}
              <div className="grid grid-cols-3 gap-2">
                <Link 
                  to={`/admin/products/edit/${p.id}`}
                  className="flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  title="編輯"
                >
                  <Edit3 size={18} />
                </Link>
                <button 
                  onClick={() => toggleStatus(p.id, p.status)}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                    p.status === 'active' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                  title={p.status === 'active' ? "下架" : "上架"}
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(p.id, p.name)}
                  className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  title="刪除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}