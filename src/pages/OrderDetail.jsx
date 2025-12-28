import { useParams, Link } from "react-router-dom";

export default function OrderDetail() {
  const { id } = useParams();

  // 假資料（正式版本會接後端）
  const order = {
    id,
    status: "已完成",
    date: "2025/01/22",
    items: [
      {
        id: 1,
        name: "Tote Bag",
        price: 1290,
        quantity: 1,
        image: "https://via.placeholder.com/100x100/7b8190/ffffff?text=Tote",
      },
      {
        id: 4,
        name: "Soft Knit Sweater",
        price: 1980,
        quantity: 1,
        image: "https://via.placeholder.com/100x100/7b8190/ffffff?text=Sweater",
      },
    ],
    shipping: {
      name: "王小美",
      phone: "0900-123-456",
      address: "台北市信義區市府路45號",
    },
    payment: "信用卡",
    delivery: "宅配",
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 80;
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* 標題 */}
        <h1 className="text-3xl font-light text-gray-900 text-center mb-12 font-['Playfair Display'] tracking-wide">
          訂單明細
        </h1>

        {/* 訂單資訊 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <p className="text-gray-900 text-lg mb-2">訂單編號：{order.id}</p>
          <p className="text-gray-600 mb-1">日期：{order.date}</p>

          <span
            className={`
              inline-block mt-3 px-3 py-1 text-xs rounded-full font-medium
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

        {/* 商品列表 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-light text-gray-800 mb-6 font-['Playfair Display']">
            商品列表
          </h2>

          <div className="space-y-6">
            {order.items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-5 border-b pb-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <p className="text-gray-900">{item.name}</p>
                  <p className="text-gray-600 text-sm">數量：{item.quantity}</p>
                </div>

                <p className="text-gray-900 font-medium">${item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 收件資訊 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-light text-gray-800 mb-6 font-['Playfair Display']">
            收件資訊
          </h2>

          <p className="text-gray-700 mb-2"><strong>姓名：</strong>{order.shipping.name}</p>
          <p className="text-gray-700 mb-2"><strong>電話：</strong>{order.shipping.phone}</p>
          <p className="text-gray-700"><strong>地址：</strong>{order.shipping.address}</p>
        </div>

        {/* 付款與配送 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-light text-gray-800 mb-6 font-['Playfair Display']">
            付款與配送
          </h2>

          <p className="text-gray-700 mb-2"><strong>付款方式：</strong>{order.payment}</p>
          <p className="text-gray-700"><strong>配送方式：</strong>{order.delivery}</p>
        </div>

        {/* 金額 */}
        <div className="border border-gray-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-light text-gray-800 mb-6 font-['Playfair Display']">
            訂單金額
          </h2>

          <p className="text-gray-700 flex justify-between mb-2">
            <span>小計</span>
            <span>${subtotal}</span>
          </p>

          <p className="text-gray-700 flex justify-between mb-2">
            <span>運費</span>
            <span>${shippingFee}</span>
          </p>

          <p className="text-gray-900 flex justify-between text-lg font-medium mt-4 border-t pt-3">
            <span>總計</span>
            <span>${total}</span>
          </p>
        </div>

        {/* 返回按鈕（兩個） */}
        <div className="text-center space-y-4">

          {/* 返回訂單列表 */}
          <Link
            to="/orders"
            className="underline text-gray-600 hover:text-black block"
          >
            ← 返回訂單列表
          </Link>

          {/* ★ 新增：返回會員中心（修正重點） */}
          <Link
            to="/profile"
            className="underline text-gray-600 hover:text-black block"
          >
            ← 返回會員中心
          </Link>

        </div>
      </div>
    </div>
  );
}
