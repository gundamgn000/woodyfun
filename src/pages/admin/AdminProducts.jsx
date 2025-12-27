import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 讀取商品資料
  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(list);
      } catch (err) {
        console.error("取得商品失敗:", err);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="pt-32 text-center text-gray-600">讀取中...</div>;
  }

  return (
    
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <h1 className="text-3xl font-semibold tracking-wide text-gray-800">
          商品管理
        </h1>

          {/* 新增商品 */}
          <div className="flex justify-end mb-6">
            <Link
              to="/admin/products/new"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              ➕ 新增商品
            </Link>
          </div>

          {/* 商品列表 */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">商品名稱</th>
                  <th className="py-3 px-4 text-left">價格</th>
                  <th className="py-3 px-4 text-left">分類</th>
                  <th className="py-3 px-4 text-left">狀態</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-3 px-4">{p.name}</td>
                    <td className="py-3 px-4">NT$ {p.price}</td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4">
                      {p.status === "inactive" ? "已下架" : "上架中"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        編輯
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
    
    
  );
}
