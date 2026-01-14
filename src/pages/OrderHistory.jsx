import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadOrders() {
      const ref = collection(db, "orders");
      const q = query(ref, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  if (loading) return <div className="member-page-container"><p className="text-[#6a625d]">讀取中...</p></div>;

  return (
    <div className="member-page-container">
      <div className="member-max-width-narrow">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="back-btn">←</button>
          <h2 className="text-2xl font-bold text-[#6a625d]">我的訂單</h2>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">目前還沒有訂單紀錄唷 🧸</div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <Link key={order.id} to={`/order/${order.id}`} className="order-card">
                <div className="order-card-header">
                  <span className="order-id">ID: {order.id.slice(0, 10)}...</span>
                  <span className={`status-badge ${order.status === '已完成' ? 'done' : 'wait'}`}>
                    {order.status || "處理中"}
                  </span>
                </div>
                <div className="order-card-body">
                  <p className="order-total">NT$ {order.total}</p>
                  <span className="order-arrow">查看詳情 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;