import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  // ✅ 改用新金額結構
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
      alert("請完整填寫資料");
      return;
    }

    // ✔ 儲存 checkoutInfo 到 Context
    setCheckoutInfo(form);

    navigate("/checkout/confirm");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl mb-8">結帳資訊</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label>姓名</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
          />
        </div>

        <div>
          <label>電話</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
          />
        </div>

        <div>
          <label>地址（市 + 區 + 詳細地址）</label>
          <input
            type="text"
            placeholder="縣市"
            className="w-full border p-2 rounded mb-2"
            value={form.city}
            onChange={(e) => updateForm("city", e.target.value)}
          />

          <input
            type="text"
            placeholder="區"
            className="w-full border p-2 rounded mb-2"
            value={form.district}
            onChange={(e) => updateForm("district", e.target.value)}
          />

          <input
            type="text"
            placeholder="街道 / 巷弄 / 門牌"
            className="w-full border p-2 rounded"
            value={form.address}
            onChange={(e) => updateForm("address", e.target.value)}
          />
        </div>

        <div>
          <label>付款方式</label>
          <select
            className="w-full border p-2 rounded"
            value={form.paymentMethod}
            onChange={(e) => updateForm("paymentMethod", e.target.value)}
          >
            <option value="">請選擇</option>
            <option value="貨到付款">貨到付款</option>
            <option value="信用卡">信用卡</option>
            <option value="ATM">ATM 虛擬帳號</option>
          </select>
        </div>

        {/* 🧾 金額摘要（可留可不留，但我幫你對齊好） */}
        <div className="border rounded p-4 bg-gray-50 text-sm space-y-1">
          <div className="flex justify-between">
            <span>商品金額</span>
            <span>NT$ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>運費</span>
            <span>NT$ {shippingFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-red-600">
            <span>總金額</span>
            <span>NT$ {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-full"
        >
          下一步（NT$ {totalAmount.toLocaleString()}）
        </button>
      </form>
    </div>
  );
}
