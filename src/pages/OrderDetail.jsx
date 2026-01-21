// src/pages/OrderDetail.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import OrderStatusTracker from "../components/OrderStatusTracker";


const getOrderHintText = (order) => {
  if (!order) return "";

  const isCOD = order.paymentMethod === "貨到付款";

  // 貨到付款
  if (isCOD) {
    switch (order.status) {
      case "pending":
        return "訂單已成立，我們正在為你準備商品，出貨時再付款即可。";

      case "shipped":
        return "商品已出貨，請留意收件，並於收貨時完成付款。";

      case "completed":
        return "訂單已完成，感謝你選擇木趣小屋，希望孩子喜歡這份禮物。";

      default:
        return "";
    }
  }

  // 非貨到付款（信用卡 / ATM）
  switch (order.status) {
    case "pending":
      return "我們正在確認你的付款資訊，完成後將立即為你安排出貨。";

    case "completed":
      return "付款完成，訂單已成立，感謝你選擇木趣小屋。";

    default:
      return "";
  }
};


// 🔁 退貨原因中文對照
const RETURN_REASON_MAP = {
  size_not_fit: "尺寸不合",
  not_as_expected: "商品與描述不符",
  defect: "商品瑕疵",
  change_mind: "改變心意",
  other: "其他",
};



const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);


  useEffect(() => {
    async function loadDetail() {
      const ref = doc(db, "orders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setOrder(snap.data());
      }
      setLoading(false);
    }

    loadDetail();
  }, [id]);

  if (loading) return <p className="p-6">讀取中...</p>;
  if (!order) return <p className="p-6">找不到訂單</p>;

  // 兼容多版本訂單格式
  const shippingInfo = order.shippingInfo || order.shipping;
  const orderItems = order.items || order.cart;
  const paymentMethod = order.paymentMethod || order.payment;

  // ✅ 判斷是否為貨到付款
  const isCOD =
    paymentMethod === "貨到付款" ||
    paymentMethod === "cod" ||
    paymentMethod === "cash_on_delivery";



  const getStatusMessage = (order) => {
    if (!order) return null;

    switch (order.status) {
      case "pending":
        return {
          text: "訂單已成立，等待出貨中。",
          className: "bg-gray-100 text-gray-700",
        };

      case "paid":
        return {
          text: "付款完成，準備為你出貨。",
          className: "bg-orange-100 text-orange-700",
        };

      case "shipped":
        return {
          text: "你的訂單已出貨，請留意收件。",
          className: "bg-orange-50 text-orange-800",
        };

      case "completed":
        return {
          text: "訂單已完成，感謝你的購買。",
          className: "bg-emerald-50 text-emerald-700",
        };

      case "cancelled":
        return {
          text: "此訂單已取消，如有疑問請聯絡客服。",
          className: "bg-rose-50 text-rose-700",
        };

            default:
              return null;
          }
        };

  const handleSubmitReturn = async () => {
    if (!returnReason) {
      alert("請選擇退貨原因");
      return;
    }

    setSubmittingReturn(true);

    try {
      const orderRef = doc(db, "orders", id);

      await updateDoc(orderRef, {
        returnRequest: {
          status: "requested",
          reason: returnReason,
          note: returnNote || "",
          requestedAt: serverTimestamp(),
        },
      });

      alert("退貨申請已送出，客服將盡快與您聯繫");
      setShowReturnForm(false);
    } catch (err) {
      console.error(err);
      alert("退貨申請失敗，請稍後再試");
    } finally {
      setSubmittingReturn(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/orders" className="text-green-500 underline">
        ← 返回訂單列表
      </Link>

      <h2 className="text-2xl font-bold mt-4 mb-6">訂單明細</h2>

      <div className="border p-4 rounded shadow mb-6">
        <p><strong>訂單編號：</strong> {id}</p>
        <p>
          <strong>下單時間：</strong>
          {order.createdAt?.toDate().toLocaleString("zh-TW")}
        </p>
        <p><strong>狀態：</strong> {order.status}</p>
        <p><strong>付款方式：</strong> {paymentMethod || "無資料"}</p>
        {getOrderHintText(order) && (
          <div className="mt-3 rounded-md bg-orange-50 p-3 text-sm text-orange-700">
            {getOrderHintText(order)}
          </div>
        )}


        {/* 🚀 依付款方式顯示不同進度條 */}
        <div className="mt-6">
          <OrderStatusTracker
            status={order.status}
            paymentMethod={paymentMethod}
            isCOD={isCOD}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3">收件人資訊</h3>
      <div className="border p-4 rounded shadow mb-6">
        <p><strong>姓名：</strong> {shippingInfo?.name || "無資料"}</p>
        <p><strong>電話：</strong> {shippingInfo?.phone || "無資料"}</p>
        <p>
          <strong>地址：</strong>
          {(shippingInfo?.city || "") +
            (shippingInfo?.district || "") +
            (shippingInfo?.address || "無資料")}
        </p>
        <p><strong>Email：</strong> {order.email || "無資料"}</p>
      </div>

      <h3 className="text-xl font-bold mb-3">商品項目</h3>
      <div className="space-y-4">
        {orderItems?.map((item, idx) => {
          const itemImg =
            item.mainImageUrl ||
            item.image ||
            item.imageUrl ||
            "https://placehold.co/200x200?text=WoodyFun";

          return (
            <div key={idx} className="flex gap-4 border p-4 rounded shadow">
              <div className="w-24 h-24 overflow-hidden rounded bg-gray-50 border border-gray-100">
                <img
                  src={itemImg}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/200x200?text=WoodyFun";
                  }}
                />
              </div>

              <div>
                <p className="font-semibold">{item.name}</p>
                <p>適合年齡：{item.ageRange || "全齡適用"}</p>
                <p>數量：{item.quantity}</p>
                <p className="text-orange-400 font-bold">
                  NT$ {item.price}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-4 space-y-2 text-right">
        {order.subtotal != null && (
          <div className="flex justify-end gap-6 text-base text-gray-700">
            <span>商品小計</span>
            <span>NT$ {order.subtotal.toLocaleString()}</span>
          </div>
        )}

        {order.shippingFee > 0 && (
          <div className="flex justify-end gap-6 text-base text-gray-700">
            <span>運費</span>
            <span>NT$ {order.shippingFee.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-end gap-6 text-2xl font-bold mt-2 text-orange-400">
          <span>總金額</span>
          <span>NT$ {order.total.toLocaleString()}</span>
        </div>
      </div>

      {(order.status === "completed" || order.status === "shipped") &&
       !order.returnRequest && (
      <div
        style={{
          marginTop: "32px",
          padding: "20px",
          border: "1px solid #eee",
          borderRadius: "8px",
          background: "#fafafa",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>📦 退貨申請</h3>

        <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
          若您收到商品後需辦理退貨，請於 7 日內提出申請。
          實際退貨流程將由客服確認後通知。
        </p>

        {!showReturnForm ? (
          <button
            onClick={() => setShowReturnForm(true)}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #d33",
              background: "#fff",
              color: "#d33",
              cursor: "pointer",
            }}
          >
            申請退貨
          </button>

          
        ) : (
          <>
            {/* 退貨原因 */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>
                退貨原因（必選）
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">請選擇原因</option>
                <option value="size_not_fit">尺寸不合</option>
                <option value="not_as_expected">商品與描述不符</option>
                <option value="defect">商品瑕疵</option>
                <option value="change_mind">改變心意</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* 補充說明 */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>
                補充說明（選填）
              </label>
              <textarea
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                rows={3}
                placeholder="可補充說明退貨原因（非必填）"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            {/* 送出 */}
            <button
              disabled={submittingReturn || !returnReason}
              onClick={handleSubmitReturn}
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#000",
                color: "#fff",
                cursor: "pointer",
                opacity: !returnReason ? 0.5 : 1,
              }}
            >
              送出退貨申請
            </button>
          </>
        )}
      </div>
    )}
    {order.returnRequest && (
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          border: "1px solid #ffe58f",
          background: "#fffbe6",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#8c6d1f",
        }}
      >
        {/* 退貨申請中 */}
        {order.returnRequest.status === "requested" && (
          <>
            ⚠️ 您已於{" "}
            {order.returnRequest.requestedAt?.toDate
              ? order.returnRequest.requestedAt
                  .toDate()
                  .toLocaleDateString("zh-TW")
              : ""}
            {" "}
            申請退貨，目前狀態為「等待商家審核」。
          </>
        )}

        {/* 商家已同意退貨 */}
        {order.returnRequest.status === "approved" && (
          <>
            ✅ 商家已同意您的退貨申請。<br />
            請依客服指示將商品寄回，退款將於收件後處理。
          </>
        )}

        {/* 商家拒絕退貨 */}
        {order.returnRequest.status === "rejected" && (
          <>
            ❌ 很抱歉，您的退貨申請未通過。<br />

            {order.returnRequest.reason && (
              <div className="mt-1">
                原因：
                {RETURN_REASON_MAP[order.returnRequest.reason] ||
                  order.returnRequest.reason}
              </div>
            )}

            {/* 🔴 新增：商家拒絕說明（後台填寫） */}
            {order.returnRequest.adminNote && (
              <div className="mt-2 text-sm text-gray-700">
                商家說明：{order.returnRequest.adminNote}
              </div>
            )}
          </>
        )}
      </div>
    )}
    </div>
  );
};

export default OrderDetail;
