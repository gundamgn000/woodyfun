import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { calculateShipping, getNow } from "../utils/shipping";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, setCheckoutInfo } = useCart();

  const [form, setForm] = useState({
    name: "", phone: "", lineId: "", taxId: "", city: "", district: "", address: "", paymentMethod: "",
  });

  // ✅ 新增：折扣碼狀態
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: "", isError: false });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getQty = (item) => (typeof item.quantity === "number" ? item.quantity : item.qty || 1);
  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price === "string") {
      const num = Number(item.price.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const subtotal = useMemo(() => Math.round((cart || []).reduce((sum, item) => sum + getQty(item) * getPrice(item), 0)), [cart]);
  const now = useMemo(() => getNow(), []);
  const shippingFee = useMemo(() => (!form.paymentMethod ? 0 : calculateShipping(form.paymentMethod, now)), [form.paymentMethod, now]);

  // ✅ 新增：折扣碼驗證邏輯
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "ARIEL100") {
      if (subtotal >= 1200) {
        setCouponDiscount(100);
        setCouponMessage({ text: "🎉 已成功套用：現折 100 元！", isError: false });
      } else {
        setCouponDiscount(0);
        setCouponMessage({ text: "Ariel100 需滿 NT$ 1200 才能使用喔！", isError: true });
      }
    } else {
      setCouponDiscount(0);
      setCouponMessage({ text: "優惠碼無效", isError: true });
    }
  };

  const totalAmount = useMemo(() => Math.round(subtotal + shippingFee - couponDiscount), [subtotal, shippingFee, couponDiscount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.paymentMethod) return alert("請完整填寫收件與付款資料");
    
    // 傳遞包含折扣碼資訊的資料給 Confirm 頁面
    setCheckoutInfo({ ...form, couponCode: couponCode.toUpperCase(), couponDiscount });
    navigate("/checkout/confirm");
  };

  const inputStyle = "w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef9d51] focus:border-transparent transition-all bg-gray-50/50";

  return (
    <div className="w-full lg:pl-[260px] px-6 py-20 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">結帳資訊</h1>
          <p className="text-gray-400 mt-2">請填寫收件人資料以完成訂單</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" className={inputStyle} placeholder="收件人姓名" value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            <input type="text" className={inputStyle} placeholder="聯絡電話" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
          </div>
          <input type="text" className={inputStyle} placeholder="Line ID (選填)" value={form.lineId} onChange={(e) => updateForm("lineId", e.target.value)} />
          <input type="text" className={inputStyle} placeholder="統一編號 (選填)" value={form.taxId} onChange={(e) => updateForm("taxId", e.target.value)} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" className={inputStyle} placeholder="縣市" value={form.city} onChange={(e) => updateForm("city", e.target.value)} />
            <input type="text" className={inputStyle} placeholder="鄉鎮市區" value={form.district} onChange={(e) => updateForm("district", e.target.value)} />
          </div>
          <input type="text" className={inputStyle} placeholder="詳細地址" value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
          
          <select className={inputStyle} value={form.paymentMethod} onChange={(e) => updateForm("paymentMethod", e.target.value)}>
            <option value="">請選擇付款方式</option>
            <option value="面交取貨">面交取貨 (限地區)</option>
            <option value="超商取貨付款">超商取貨付款 / 超商取貨不付款 (信用卡)</option>
            <option value="信用卡">宅配到府(信用卡) *運費約210~250元*</option>
          </select>

          {/* ✅ 新增：優惠代碼區塊 */}
          <div className="space-y-2 pt-6">
            <label className="text-sm font-medium text-gray-700 ml-1">優惠代碼</label>
            <div className="flex gap-3">
              <input type="text" className={inputStyle} placeholder="請輸入優惠碼" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button type="button" onClick={handleApplyCoupon} className="px-6 bg-gray-800 text-white rounded-xl hover:bg-black transition-all">套用</button>
            </div>
            {couponMessage.text && <p className={`text-xs ml-1 ${couponMessage.isError ? "text-red-500" : "text-green-600"}`}>{couponMessage.text}</p>}
          </div>

          <div className="border border-orange-100 rounded-2xl p-6 bg-[#fffcf9] space-y-3 mt-10">
            <div className="flex justify-between text-gray-600"><span>商品小計</span><span>NT$ {subtotal?.toLocaleString()}</span></div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-red-500 font-medium"><span>優惠折扣 (Ariel100)</span><span>- NT$ {couponDiscount}</span></div>
            )}
            <div className="flex justify-between text-gray-600 border-b border-orange-50 pb-3"><span>預估運費</span><span>NT$ {shippingFee?.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-xl text-gray-800 pt-1">
              <span>總金額</span><span className="text-[#ef9d51]">NT$ {totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-[#ef9d51] text-white py-4 rounded-full text-lg font-medium hover:bg-[#d68a44] transition-all shadow-lg active:scale-[0.98]">確認訂單資訊</button>
            <button type="button" onClick={() => navigate("/cart")} className="w-full mt-4 text-gray-400 text-sm hover:underline">返回購物車修改</button>
          </div>
        </form>
      </div>
    </div>
  );
}