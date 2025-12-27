import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadOrders() {
      const ref = collection(db, "orders");
      const q = query(ref, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(list);
      setLoading(false);
    }

    loadOrders();
  }, [user]);

  if (loading) return <p className="p-6">讀取中...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">我的訂單</h2>

      {orders.length === 0 ? (
        <p>尚無任何訂單</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="block border rounded p-4 shadow hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">訂單編號：{order.id}</p>
                  <p>總金額：NT$ {order.total}</p>
                  <p>狀態：{order.status}</p>
                  <p>
                    下單時間：
                    {order.createdAt?.toDate().toLocaleString("zh-TW")}
                  </p>
                </div>
                <span className="text-blue-600">查看詳情 →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
