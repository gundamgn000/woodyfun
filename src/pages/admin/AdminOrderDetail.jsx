// src/pages/admin/AdminOrderDetail.jsx

import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logOrderAction } from "../../utils/orderLogger";


const getStatusFlow = (isCOD) =>
  isCOD
    ? ["pending", "shipped", "completed"]       // 貨到付款
    : ["pending", "paid", "shipped", "completed"]; // 線上付款


const STATUS_TEXT = {
  pending: "待付款、訂單成立",
  paid: "已付款",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

const STATUS_BADGE_CLASS = {
  pending: "bg-gray-200 text-gray-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();


  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingLogistics, setSavingLogistics] = useState(false);

  // 控制欄位
  const [status, setStatus] = useState("pending");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState("");

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrder = async () => {
    try {
      const ref = doc(db, "orders", orderId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setOrder(null);
      } else {
        const data = snap.data();
        setOrder(data);
        setStatus(data.status || "pending");
        setShippingCarrier(
          data.shippingCarrier || data.shippingCompany || ""
        );
        setShippingTrackingNumber(
          data.shippingTrackingNumber || data.trackingNumber || ""
        );
      }
    } catch (err) {
      console.error("讀取訂單失敗：", err);
    } finally {
      setLoading(false);
    }
  };

  // 取得下一個狀態
  const NEXT_STATUS_MAP = {
    pending: "shipped",
    shipped: "completed",
  };

  const getNextStatus = (current) => {
    return NEXT_STATUS_MAP[current] || null;
  };




  // 更新訂單狀態
  const handleUpdateStatus = async (next) => {
    if (!order) return;
    if (!next) return;

    if (
      !window.confirm(`確定要將訂單狀態更新為「${STATUS_TEXT[next]}」嗎？`)
    )
      return;

    try {
      setSavingStatus(true);
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, {
        status: next,
        updatedAt: Timestamp.now(),
      });

      await logOrderAction({
        orderId,
        action: "status_update",
        from: order.status,
        to: next,
        user: { ...user, userRole },
      });


      setOrder((prev) => (prev ? { ...prev, status: next } : prev));
      setStatus(next);
      alert("訂單狀態已更新");
    } catch (err) {
      console.error("更新狀態失敗：", err);
      alert("更新狀態失敗");
    } finally {
      setSavingStatus(false);
    }
  };

  // 取消訂單
  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm("確定要將此訂單標記為「已取消」嗎？")) return;

    try {
      setSavingStatus(true);
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });

      await logOrderAction({
        orderId,
        action: "cancel",
        from: order?.status || "unknown",
        to: "cancelled",
        user: { ...user, userRole },
      });

      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      setStatus("cancelled");
      alert("訂單已標記為取消");
    } catch (err) {
      console.error("取消訂單失敗：", err);
      alert("取消訂單失敗");
    } finally {
      setSavingStatus(false);
    }
  };

  // 儲存物流資訊
  const handleSaveLogistics = async () => {
    if (!order) return;

    try {
      setSavingLogistics(true);
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, {
        shippingCarrier: shippingCarrier || "",
        shippingTrackingNumber: shippingTrackingNumber || "",
        // 同步舊欄位，讓列表顯示也跟著更新
        shippingCompany: shippingCarrier || "",
        trackingNumber: shippingTrackingNumber || "",
        updatedAt: Timestamp.now(),
      });

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              shippingCarrier: shippingCarrier || "",
              shippingTrackingNumber: shippingTrackingNumber || "",
              shippingCompany: shippingCarrier || "",
              trackingNumber: shippingTrackingNumber || "",
            }
          : prev
      );
      alert("物流資訊已更新");
    } catch (err) {
      console.error("更新物流資訊失敗：", err);
      alert("更新物流資訊失敗");
    } finally {
      setSavingLogistics(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">找不到此訂單</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white"
        >
          回訂單列表
        </button>
      </div>
    );
  }

  // 收件資訊兼容多種欄位命名
  const shipping =
    order.shippingInfo || order.shipping || order.buyer || {};

  const items = order.items || order.cart || [];

  const paymentMethod =
    order.paymentMethod || order.payment || order.payMethod || "無資料";

  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString("zh-TW")
    : "無資料";

  const isCOD = paymentMethod === "貨到付款";


  const updatedAt = order.updatedAt?.toDate
    ? order.updatedAt.toDate().toLocaleString("zh-TW")
    : null;

  const currentStatus = order.status || status;

  const nextStatus = getNextStatus(currentStatus);

  return (
    // 修正：使用 Fragment <>...</> 作為單一根元素
    <> 
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-wide text-gray-800">
                訂單詳情
            </h1>
            <button
                onClick={() => navigate("/admin/orders")}
                className="px-4 py-2 rounded-full border border-gray-400 text-gray-700 text-sm hover:bg-gray-200 transition"
            >
                回訂單列表
            </button>
        </div>
        
          {/* 訂單基本資訊卡片 */}
          <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">訂單編號</p>
                <p className="text-lg font-semibold tracking-wide">
                  {orderId}
                </p>
              </div>

              <div className="text-right space-y-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_BADGE_CLASS[currentStatus] ||
                    "bg-gray-200 text-gray-700"
                  }`}
                >
                  {STATUS_TEXT[currentStatus] ||
                    currentStatus ||
                    "未知狀態"}
                </span>
                <p className="text-sm text-gray-600">
                  付款方式：{paymentMethod}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p>
                  <span className="font-medium">建立時間：</span>
                  {createdAt}
                </p>
                {updatedAt && (
                  <p>
                    <span className="font-medium">最後更新：</span>
                    {updatedAt}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  總金額：NT$ {order.totalAmount ?? order.total ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* 訂單狀態管理卡片（桌機版按鈕仍保留） */}
          <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              訂單狀態管理
            </h2>

            <p className="text-sm text-gray-600">
              目前狀態：
              <span className="font-semibold ml-1">
                {STATUS_TEXT[currentStatus] || currentStatus}
              </span>
            </p>

            <div className="flex gap-3 flex-wrap mt-2">
              {nextStatus && currentStatus !== "cancelled" && (
                <button
                  disabled={savingStatus}
                  onClick={() => handleUpdateStatus(nextStatus)}
                  className="px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                  {savingStatus
                    ? "更新中..."
                    : `標記為「${STATUS_TEXT[nextStatus]}」`}
                </button>
              )}

              {currentStatus !== "cancelled" && (
                <button
                  disabled={savingStatus}
                  onClick={handleCancelOrder}
                  className="px-4 py-2 rounded-full border border-red-400 text-red-500 text-sm hover:bg-red-50 transition disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {savingStatus ? "處理中..." : "取消訂單"}
                </button>
              )}
            </div>
          </div>

          {/* 收件人資訊卡片 */}
          <div className="bg-white shadow-md rounded-2xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-700">
              收件人資訊
            </h2>
            <p>
              <span className="font-medium">姓名：</span>
              {shipping.name || "無資料"}
            </p>
            <p>
              <span className="font-medium">電話：</span>
              {shipping.phone || "無資料"}
            </p>
            <p>
              <span className="font-medium">Email：</span>
              {shipping.email || order.email || "無資料"}
            </p>
            <p>
              <span className="font-medium">地址：</span>
              {shipping.city || shipping.district || shipping.address
                ? `${shipping.city || ""}${shipping.district || ""}${
                    shipping.address || ""
                  }`
                : "無資料"}
            </p>
          </div>

          {/* 物流資訊卡片 */}
          <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              物流資訊
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  物流公司
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="例：黑貓宅急便 / 7-11 / 全家"
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  物流單號
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="例：0000-1234-5678"
                  value={shippingTrackingNumber}
                  onChange={(e) =>
                    setShippingTrackingNumber(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              disabled={savingLogistics}
              onClick={handleSaveLogistics}
              className="mt-3 px-4 py-2 rounded-full bg-gray-800 text-white text-sm hover:bg-black transition disabled:bg-gray-400"
            >
              {savingLogistics ? "儲存中..." : "儲存物流資訊"}
            </button>
          </div>

          {/* 商品列表卡片 */}
          <div className="bg-white shadow-md rounded-2xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-700">
              商品明細
            </h2>

            {items.length === 0 && (
              <p className="text-sm text-gray-500">
                此訂單沒有商品資料
              </p>
            )}

            <ul className="divide-y">
              {items.map((item, idx) => (
                <li
                  key={item.id || idx}
                  className="flex justify-between text-sm py-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.size && (
                      <p className="text-xs text-gray-500">
                        尺寸：{item.size}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p>x {item.quantity}</p>
                    <p className="text-xs text-gray-500">
                      NT$ {item.price}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        
      </div> {/* 👈 max-w-4xl 容器的結尾標籤移到這裡 */}
        

      {/* ===== D：手機版固定底部操作列 ===== */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-6px_16px_rgba(15,23,42,0.16)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col text-xs text-gray-500">
            <span>
              狀態：{STATUS_TEXT[currentStatus] || currentStatus}
            </span>
            {shippingTrackingNumber && (
              <span className="mt-0.5">
                🚚 {shippingCarrier || "物流"}：{shippingTrackingNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={savingLogistics}
              onClick={handleSaveLogistics}
              className="px-3 py-2 rounded-full border border-gray-400 text-xs text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {savingLogistics ? "儲存中..." : "儲存物流"}
            </button>

            {nextStatus && currentStatus !== "cancelled" && (
              <button
                type="button"
                disabled={savingStatus}
                onClick={() => handleUpdateStatus(nextStatus)}
                className="px-4 py-2 rounded-full bg-black text-white text-xs font-medium tracking-wide hover:bg-gray-900 disabled:bg-gray-400"
              >
                {savingStatus
                  ? "更新中..."
                  : `標記「${STATUS_TEXT[nextStatus]}」`}
              </button>
            )}
          </div>
        </div>
      </div>
    </> // 👈 結尾 Fragment
  );
}