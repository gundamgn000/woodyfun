import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("❌ 讀取訂單失敗", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        載入訂單中…
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#c00" }}>
        找不到此訂單
      </div>
    );
  }

  const {
    createdAt,
    items = [],
    shippingInfo = {},
    paymentMethod,
    total,
    status,
  } = order;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 20 }}>訂單詳情</h2>

      {/* 訂單基本資訊 */}
      <div style={cardStyle}>
        <p><strong>訂單編號：</strong>{order.id}</p>
        <p>
          <strong>下單時間：</strong>
          {createdAt?.toDate
            ? createdAt.toDate().toLocaleString("zh-TW")
            : "—"}
        </p>
        <p><strong>狀態：</strong>{status || "pending"}</p>
        <p><strong>付款方式：</strong>{paymentMethod}</p>
        <p><strong>訂單金額：</strong>NT$ {total}</p>

        
      </div>

      {/* 商品列表 */}
      <div style={cardStyle}>
        <h3>商品項目</h3>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
            <div style={{ flex: 1 }}>
              <div>{item.name}</div>
              <div style={{ fontSize: 14, color: "#666" }}>
                尺寸：{item.size || "-"}｜數量：{item.quantity}
              </div>
            </div>
            <div>NT$ {item.price}</div>
          </div>
        ))}
      </div>

      {/* 收件人資訊 */}
      <div style={cardStyle}>
        <h3>收件人資訊</h3>
        <p>姓名：{shippingInfo.name}</p>
        <p>電話：{shippingInfo.phone}</p>
        <p>
          地址：
          {shippingInfo.city}
          {shippingInfo.district}
          {shippingInfo.address}
        </p>
        {shippingInfo.email && <p>Email：{shippingInfo.email}</p>}
      </div>
    </div>
  );
}

/* ===== 共用樣式 ===== */
const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  marginBottom: 24,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};
