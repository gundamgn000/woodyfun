import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { calculateShipping, getNow } from "../utils/shipping";

export default function Checkout() {
  const navigate = useNavigate();

  const { cart, setCheckoutInfo } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    lineId: "", // 新增這一行
    city: "",
    district: "",
    address: "",
    paymentMethod: "",
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ===============================
  // 金額計算：以 cart 為準，避免不同頁不同步
  // ===============================
  const getQty = (item) => {
    if (typeof item.quantity === "number") return item.quantity;
    if (typeof item.qty === "number") return item.qty;
    return 1;
  };

  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price === "string") {
      const num = Number(item.price.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const subtotal = useMemo(() => {
    return Math.round(
      (cart || []).reduce((sum, item) => sum + getQty(item) * getPrice(item), 0)
    );
  }, [cart]);

  // 允許用 localStorage mock 時間（跟 Confirm 同步）
  const now = useMemo(() => getNow(), []);

  // 未選付款方式前：先顯示 0（避免購物車 → 結帳頁突然跳價）
  const shippingFee = useMemo(() => {
    if (!form.paymentMethod) return 0;
    return calculateShipping(form.paymentMethod, now);
  }, [form.paymentMethod, now]);

  const totalAmount = useMemo(() => {
    return Math.round(subtotal + shippingFee);
  }, [subtotal, shippingFee]);

  // ===============================
  // 送出
  // ===============================
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
  const inputStyle =
    "w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef9d51] focus:border-transparent transition-all bg-gray-50/50";

  return (
    // 加入 lg:pl-[260px] 避開左側 Navbar
    <div className="w-full lg:pl-[260px] px-6 py-20 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">結帳資訊</h1>
          <p className="text-gray-400 mt-2">請填寫收件人資料以完成訂單</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 第一組：姓名與電話 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">收件人姓名</label>
              <input type="text" className={inputStyle} placeholder="請輸入姓名" value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">聯絡電話</label>
              <input type="text" className={inputStyle} placeholder="0912-345-678" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
          </div>

          {/* 新增的一組：Line ID (選填) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Line ID <span className="text-gray-400 text-xs">(選填，方便客服聯繫)</span>
            </label>
            <input
              type="text"
              className={inputStyle}
              placeholder="請輸入 Line ID"
              value={form.lineId}
              onChange={(e) => updateForm("lineId", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">
                縣市
              </label>
              <input
                type="text"
                className={inputStyle}
                placeholder="例如：台北市"
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">
                鄉鎮市區
              </label>
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
            <label className="text-sm font-medium text-gray-700 ml-1">
              詳細地址
            </label>
            <input
              type="text"
              className={inputStyle}
              placeholder="街道、門牌、樓層"
              value={form.address}
              onChange={(e) => updateForm("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              付款方式
            </label>
            <select
              className={inputStyle}
              value={form.paymentMethod}
              onChange={(e) => updateForm("paymentMethod", e.target.value)}
            >
              <option value="">請選擇付款方式</option>
              <option value="面交取貨">面交取貨 (限地區)</option>

              <option value="超商取貨付款">
                超商取貨付款    /   超商取貨不付款 (信用卡)
              </option>
              <option value="信用卡">宅配到府(信用卡)  *本站補貼部分運費，實際運送成本約210~250元*
                
                
              </option>
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
            <div className="flex justify-between text-gray-400 border-b border-orange-20 pb-3">
              <span></span>
              
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-800 pt-1">
              <span>總金額</span>
              <span className="text-[#ef9d51]">
                NT$ {totalAmount?.toLocaleString()}
              </span>
              
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