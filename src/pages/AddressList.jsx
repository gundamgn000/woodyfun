import { Link } from "react-router-dom";

export default function AddressList() {
  const addresses = [
    {
      id: 1,
      name: "王小美",
      phone: "0900-123-456",
      address: "台北市信義區市府路45號",
      isDefault: true
    },
    {
      id: 2,
      name: "王小美",
      phone: "0900-123-456",
      address: "新北市板橋區文化路100號"
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-3xl">

        <h1 className="text-3xl font-light text-gray-900 text-center mb-12 font-['Playfair Display'] tracking-wide">
          地址管理
        </h1>

        <div className="space-y-6">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className="border border-gray-300 rounded-xl p-6 shadow-sm"
            >
              {addr.isDefault && (
                <span className="mb-3 inline-block bg-black text-white text-xs px-2 py-1 rounded">
                  預設地址
                </span>
              )}

              <p className="text-gray-900 text-lg font-medium">{addr.name}</p>
              <p className="text-gray-700 text-sm mt-1">{addr.phone}</p>
              <p className="text-gray-700 text-sm mt-1">{addr.address}</p>

              <div className="flex gap-4 mt-4">
                <Link
                  to={`/address/edit/${addr.id}`}
                  className="underline text-gray-600 hover:text-black text-sm"
                >
                  編輯
                </Link>

                <button className="underline text-red-500 hover:text-red-700 text-sm">
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/address/add"
            className="px-5 py-2 border border-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            新增地址
          </Link>
        </div>

        {/* ★ 修正這裡：返回會員中心 */}
        <div className="text-center mt-6">
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
