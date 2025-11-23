import { Link, useParams } from "react-router-dom";

export default function EditAddress() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex justify-center">
      <div className="w-full max-w-xl border border-gray-300 rounded-xl shadow-sm p-10">

        <h1 className="text-3xl font-light text-gray-900 text-center mb-10 font-['Playfair Display'] tracking-wide">
          編輯地址
        </h1>

        <p className="text-gray-500 text-sm mb-6">地址 ID：{id}</p>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">姓名</label>
          <input
            type="text"
            defaultValue="王小美"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">電話</label>
          <input
            type="text"
            defaultValue="0900-123-456"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 text-sm mb-2">地址</label>
          <input
            type="text"
            defaultValue="台北市信義區市府路45號"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:border-black transition"
          />
        </div>

        <button className="btn-black w-full">
          儲存修改
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
