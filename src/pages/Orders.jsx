import { Link } from "react-router-dom";

const STATUS_LABEL = {
  pending: "處理中",
  shipped: "已出貨",
  completed: "已完成",
};

export default function Orders({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-10">
        尚無任何訂單紀錄
      </p>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-xl p-6 shadow-md bg-white"
        >
          <div className="flex justify-between mb-2">
            <span className="text-gray-700 font-medium">訂單編號</span>
            <span>{order.id}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span className="text-gray-700 font-medium">金額</span>
            <span>NT$ {order.total.toLocaleString()}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span className="text-gray-700 font-medium">狀態</span>
            <span className="font-semibold">
              {STATUS_LABEL[order.status] || "未知狀態"}
            </span>
          </div>

          <Link
            to={`/orders/${order.id}`}
            className="text-blue-500 underline text-sm"
          >
            查看明細
          </Link>
        </div>
      ))}
    </div>
  );
}
