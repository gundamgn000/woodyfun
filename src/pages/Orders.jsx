import { Link } from "react-router-dom";

export default function Orders() {
  const orders = [
    {
      id: "A12345",
      status: "已完成",
      date: "2025/01/22",
      total: 2680,
    },
    {
      id: "A12346",
      status: "處理中",
      date: "2025/01/28",
      total: 3580,
    },
    {
      id: "A12347",
      status: "取消",
      date: "2025/02/01",
      total: 1290,
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* 標題 */}
        <h1 className="text-3xl font-light text-gray-900 text-center mb-12 font-['Playfair Display'] tracking-wide">
          訂單列表
        </h1>

        {/* 訂單卡片 */}
        <div className="space-y-6">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block border border-gray-300 rounded-xl p-6 shadow-sm 
                        hover:shadow-md hover:-translate-y-1 hover:bg-gray-50
                        transition transform"
            >
              <p className="text-gray-900 text-lg font-medium">
                訂單編號：{order.id}
              </p>

              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <p>日期：{order.date}</p>
                <p>金額：${order.total}</p>
              </div>

              {/* 狀態 */}
              <div className="mt-3">
                <span
                  className={`
                    px-3 py-1 text-xs rounded-full font-medium
                    ${
                      order.status === "已完成"
                        ? "bg-green-100 text-green-700"
                        : order.status === "處理中"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 返回會員中心 —— ★ 修正重點 */}
        <div className="text-center mt-10">
          <Link
            to="/profile"
            className="underline text-gray-600 hover:text-black"
          >
            ← 返回會員中心
          </Link>
        </div>
      </div>
    </div>
  );
}
