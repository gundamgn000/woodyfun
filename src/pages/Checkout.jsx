import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  const {
    setCheckoutInfo,
    subtotal,
    shippingFee,
    totalAmount,
  } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    paymentMethod: "",
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.address || !form.paymentMethod) {
      alert("請完整填寫收件與付款資料");
      return;
    }

    setCheckoutInfo(form);
    navigate("/checkout/confirm");
  };

  // 統一的輸入框樣式
  const inputStyle = "w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef9d51] focus:border-transparent transition-all bg-gray-50/50";

  return (
    // 加入 lg:pl-[260px] 避開左側 Navbar
    <div className="w-full lg:pl-[260px] px-6 py-20 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">結帳資訊</h1>
          <p className="text-gray-400 mt-2">請填寫收件人資料以完成訂單</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">收件人姓名</label>
              <input
                type="text"
                className={inputStyle}
                placeholder="請輸入姓名"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">聯絡電話</label>
              <input
                type="text"
                className={inputStyle}
                placeholder="0912-345-678"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">縣市</label>
              <input
                type="text"
                className={inputStyle}
                placeholder="例如：台北市"
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">鄉鎮市區</label>
              <input
                type="text"
                className={inputStyle}
                placeholder="例如：大安區"
                value={form.district}
                onChange={(e) => updateForm("district", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">詳細地址</label>
            <input
              type="text"
              className={inputStyle}
              placeholder="街道、門牌、樓層"
              value={form.address}
              onChange={(e) => updateForm("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">付款方式</label>
            <select
              className={inputStyle}
              value={form.paymentMethod}
              onChange={(e) => updateForm("paymentMethod", e.target.value)}
            >
              <option value="">請選擇付款方式</option>
              <option value="貨到付款">貨到付款</option>
              <option value="CVSCOM">超商取貨付款 (7-11/全家/萊爾富)</option>
              <option value="信用卡">信用卡</option>
              <option value="ATM">ATM 虛擬帳號</option>
            </select>
          </div>

          {/* 🧾 金額摘要 - 視覺優化 */}
          <div className="border border-orange-100 rounded-2xl p-6 bg-[#fffcf9] space-y-3 mt-10">
            <div className="flex justify-between text-gray-600">
              <span>商品小計</span>
              <span>NT$ {subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 border-b border-orange-50 pb-3">
              <span>預估運費</span>
              <span>NT$ {shippingFee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-800 pt-1">
              <span>總金額</span>
              <span className="text-[#ef9d51]">NT$ {totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#ef9d51] text-white py-4 rounded-full text-lg font-medium hover:bg-[#d68a44] transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
            >
              確認訂單資訊
            </button>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="w-full mt-4 text-gray-400 text-sm hover:underline"
            >
              返回購物車修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}