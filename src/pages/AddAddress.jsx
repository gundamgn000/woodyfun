import { Link } from "react-router-dom";

export default function AddAddress() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-xl border border-gray-300 rounded-xl shadow-sm p-10">

        <h1 className="text-3xl font-light text-gray-900 text-center mb-10 font-['Playfair Display'] tracking-wide">
          新增地址
        </h1>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">姓名</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-black transition"
            placeholder="請輸入姓名"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">電話</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-black transition"
            placeholder="請輸入電話"
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 text-sm mb-2">地址</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-black transition"
            placeholder="請輸入地址"
          />
        </div>

        <button className="btn-black w-full">
          儲存地址
        </button>

        <div className="text-center mt-6">
          <Link to="/address" className="underline text-gray-600 hover:text-black">
            返回地址管理
          </Link>
        </div>
      </div>
    </div>
  );
}
