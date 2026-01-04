import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logOrderAction } from "../../utils/orderLogger";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const { user, userRole } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 🔽 快速出貨用的狀態
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [shipTarget, setShipTarget] = useState(null);
  const [shipCarrier, setShipCarrier] = useState("黑貓宅急便");
  const [shipTracking, setShipTracking] = useState("");
  const [shipSaving, setShipSaving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const list = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    setOrders(list);
    setFiltered(list);
  };

  // 狀態中文（C3：補齊 failed，並統一 pending 顯示）
  const statusText = {
    pending: "待付款",
    paid: "已付款",
    failed: "付款失敗",
    shipped: "已出貨",
    completed: "已完成",
    cancelled: "已取消",
  };

  // 狀態顏色（C3：補齊 failed）
  const statusColor = {
    pending: "bg-yellow-200 text-yellow-800",
    paid: "bg-blue-200 text-blue-800",
    failed: "bg-red-200 text-red-800",
    shipped: "bg-purple-200 text-purple-800",
    completed: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800",
  };

  // ✅ C3：更專業的狀態徽章（依付款方式 + status）
  const renderStatusBadge = (ord) => {
    const paymentMethod = ord.paymentMethod || ord.payment || ord.payMethod || "";
    const isCOD = paymentMethod === "貨到付款";

    // 你原本邏輯：COD 的 pending 其實是「可出貨」
    if (ord.status === "pending" && isCOD) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
          待出貨（貨到付款）
        </span>
      );
    }

    const cls = statusColor[ord.status] || "bg-gray-200 text-gray-700";
    const label = statusText[ord.status] || ord.status || "未知狀態";

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
        {label}
      </span>
    );
  };

  // ===== 一鍵完成（shipped → completed）=====
  const handleMarkCompleted = async (order) => {
    if (!order) return;

    if (!window.confirm("確定要將此訂單標記為「已完成」嗎？")) return;

    try {
      const ref = doc(db, "orders", order.id);

      await updateDoc(ref, {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 同步前端狀態
      setOrders((prev) =>
        prev.map((ord) => (ord.id === order.id ? { ...ord, status: "completed" } : ord))
      );

      await logOrderAction({
        orderId: order.id,
        action: "status_update",
        from: order.status,
        to: "completed",
        user: { ...user, userRole },
      });

      alert("訂單已標記為完成");
    } catch (err) {
      console.error("標記完成失敗：", err);
      alert("操作失敗，請稍後再試");
    }
  };

  // 👉 重新套用搜尋/篩選
  useEffect(() => {
    let list = [...orders];

    // 搜尋（訂單編號 + email + 收件人姓名）
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      list = list.filter((ord) => {
        return (
          ord.id.toLowerCase().includes(keyword) ||
          ord.email?.toLowerCase().includes(keyword) ||
          ord.shippingInfo?.name?.toLowerCase().includes(keyword)
        );
      });
    }

    // 狀態篩選
    if (statusFilter !== "all") {
      if (statusFilter === "return_only") {
        // ✅ 只看有退貨申請的訂單（requested / approved / rejected 都算）
        list = list.filter((ord) => !!ord.returnRequest?.status);
      } else {
        list = list.filter((ord) => ord.status === statusFilter);
      }
}
    setFiltered(list);
  }, [search, statusFilter, orders]);

  // ===== 快速出貨：打開視窗 =====
  const openQuickShip = (order) => {
    // 兼容舊欄位：shippingCarrier / shippingCompany、shippingTrackingNumber / trackingNumber
    const carrier = order.shippingCarrier || order.shippingCompany || "黑貓宅急便";
    const tracking = order.shippingTrackingNumber || order.trackingNumber || "";

    setShipTarget(order);
    setShipCarrier(carrier);
    setShipTracking(tracking);
    setShipModalOpen(true);
  };

  const closeQuickShip = () => {
    setShipModalOpen(false);
    setShipTarget(null);
    setShipTracking("");
  };

  // ===== 快速出貨：儲存 Firestore =====
  const handleConfirmShip = async () => {
    if (!shipTarget) return;
    if (!shipTracking.trim()) {
      alert("請先輸入物流單號");
      return;
    }

    try {
      setShipSaving(true);

      const ref = doc(db, "orders", shipTarget.id);
      const tracking = shipTracking.trim();

      await updateDoc(ref, {
        status: "shipped",
        // 新欄位（詳細頁使用）
        shippingCarrier: shipCarrier,
        shippingTrackingNumber: tracking,
        // 舊欄位兼容（列表原本顯示用）
        shippingCompany: shipCarrier,
        trackingNumber: tracking,
        shippedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 前端 state 也同步更新，畫面立即反應
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === shipTarget.id
            ? {
                ...ord,
                status: "shipped",
                shippingCarrier: shipCarrier,
                shippingTrackingNumber: tracking,
                shippingCompany: shipCarrier,
                trackingNumber: tracking,
              }
            : ord
        )
      );

      alert("已標記為『已出貨』並儲存物流資訊");
      closeQuickShip();
    } catch (err) {
      console.error("快速出貨失敗：", err);
      alert("出貨更新失敗，請稍後再試");
    } finally {
      setShipSaving(false);
    }
  };
  const renderReturnBadge = (ord) => {
    if (!ord.returnRequest) return null;

    if (ord.returnRequest.status === "requested") {
      return (
        <span
          style={{
            marginLeft: "8px",
            padding: "4px 8px",
            fontSize: "12px",
            borderRadius: "12px",
            background: "#FFF4E5",
            color: "#D46B08",
            border: "1px solid #FFD591",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ⚠️ 退貨申請中
        </span>
      );
    }

    if (ord.returnRequest.status === "approved") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-800">
          退貨處理中
        </span>
      );
    }

    if (ord.returnRequest.status === "rejected") {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-300 text-gray-700">
          退貨已拒絕
        </span>
      );
    }

    return null;
  };


  return (
    <div className="max-w-6xl mx-auto px-6 space-y-8">
      <h1 className="text-3xl font-semibold tracking-wide text-gray-800">訂單管理</h1>

      {/* 🔎 搜尋 + 篩選列 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        {/* 搜尋框 */}
        <input
          type="text"
          placeholder="搜尋訂單編號 / Email / 收件人姓名"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-2/3 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-black transition"
        />

        {/* 狀態範圍選擇（C3：補上 failed） */}
        <select
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-black transition"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部狀態</option>
          <option value="pending">待付款</option>
          <option value="paid">已付款</option>
          <option value="failed">付款失敗</option>
          <option value="shipped">已出貨</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="return_only">只看退貨申請</option>
        </select>
      </div>

      {/* 訂單列表 */}
      <div className="space-y-5">
        {filtered.map((ord) => {
          const carrier = ord.shippingCarrier || ord.shippingCompany || null;
          const tracking = ord.shippingTrackingNumber || ord.trackingNumber || null;
          const paymentMethod = ord.paymentMethod || ord.payment || ord.payMethod || "";
          const isCOD = paymentMethod === "貨到付款";

          return (
            <div
              key={ord.id}
              className="p-6 rounded-xl shadow-md border hover:shadow-lg transition bg-white"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* 左側：訂單基本資訊（點這塊可進入詳細頁） */}
                <div className="flex-1">
                  <Link to={`/admin/orders/${ord.id}`} className="block group">
                    <p className="font-semibold text-lg tracking-wide mb-1 group-hover:underline">
                      訂單編號：{ord.id}
                    </p>

                    <p className="text-sm text-gray-600">
                      訂購者：{ord.shippingInfo?.name || "（無姓名）"}
                    </p>

                    <p className="text-sm text-gray-600">Email：{ord.email}</p>

                    <p className="text-sm text-gray-600">
                      建立時間：
                      {ord.createdAt?.toDate
                        ? ord.createdAt.toDate().toLocaleString("zh-TW")
                        : "無資料"}
                    </p>
                  </Link>

                  {/* 顯示物流資訊（如有） */}
                  {tracking && (
                    <p className="text-sm text-gray-700 mt-2">
                      🚚 {carrier || "物流"}：{tracking}
                    </p>
                  )}
                </div>

                {/* 右側：金額 + 狀態 + 快速出貨按鈕 */}
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-xl font-semibold">NT$ {ord.total ?? ord.totalAmount ?? 0}</p>

                  {/* ✅ C3：用專業 badge 顯示狀態 */}
                  {renderStatusBadge(ord)}
                  {renderReturnBadge(ord)}

                  {/* 只有「已付款」顯示快速出貨（你之後如果想擴大條件再改） */}
                  {ord.status !== "completed" && ord.status !== "cancelled" && (
                    <>
                      {((!isCOD && ord.status === "paid") || (isCOD && ord.status === "pending")) && (
                        <button
                          type="button"
                          onClick={() => openQuickShip(ord)}
                          className="mt-1 px-3 py-1.5 text-xs rounded-full border border-gray-800 text-gray-900 hover:bg-gray-900 hover:text-white transition"
                        >
                          快速出貨
                        </button>
                      )}

                      {ord.status === "shipped" && (
                        <button
                          type="button"
                          onClick={() => handleMarkCompleted(ord)}
                          className="mt-1 px-3 py-1.5 text-xs rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                        >
                          標記完成
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-10">尚無符合條件的訂單</p>
        )}
      </div>

      {/* ===== B 方案：彈出視窗式「快速出貨」 ===== */}
      {shipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">快速出貨</h2>
                {shipTarget && (
                  <p className="text-xs text-gray-500 mt-1">訂單編號：{shipTarget.id}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeQuickShip}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">物流公司</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                  placeholder="例：黑貓宅急便 / 7-11 / 全家"
                  value={shipCarrier}
                  onChange={(e) => setShipCarrier(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">物流單號</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                  placeholder="例：0000-1234-5678"
                  value={shipTracking}
                  onChange={(e) => setShipTracking(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeQuickShip}
                className="px-4 py-2 rounded-full border text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={shipSaving}
                onClick={handleConfirmShip}
                className={`px-5 py-2 rounded-full text-sm text-white ${
                  shipSaving ? "bg-gray-400" : "bg-black hover:bg-gray-900"
                }`}
              >
                {shipSaving ? "處理中..." : "確認出貨"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
