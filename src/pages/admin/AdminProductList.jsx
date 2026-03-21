import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 抓取所有商品清單
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("抓取商品失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. 切換熱門狀態的邏輯
  const togglePopular = async (productId, currentStatus) => {
    try {
      const productRef = doc(db, "products", productId);
      // ✅ 將狀態取反 (true -> false / false -> true)
      await updateDoc(productRef, {
        isPopular: !currentStatus,
      });

      // 🔄 成功後更新本地 state，讓 UI 立即有反應
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isPopular: !currentStatus } : p
        )
      );
    } catch (error) {
      alert("更新失敗，請檢查權限！");
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">讀取商品中...</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-[#6a625d] mb-6">商品管理 (熱門狀態控制)</h2>
        
        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#faf9f6] text-[#6a625d] text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">商品名稱</th>
                <th className="px-6 py-4 font-medium">分類</th>
                <th className="px-6 py-4 font-medium text-center">熱門推薦</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{product.name}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{product.category}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePopular(product.id, product.isPopular)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        product.isPopular
                          ? "bg-[#ef9d51] text-white shadow-md"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {product.isPopular ? "🔥 已設為熱門" : "設為熱門"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}