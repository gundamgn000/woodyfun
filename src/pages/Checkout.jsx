import { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { calculateShipping, getNow } from "../utils/shipping";
// ✅ 引入 Firebase
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, setCheckoutInfo } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    lineId: "", 
    city: "",
    district: "",
    address: "",
    paymentMethod: "",
  });

  // ✅ 折扣狀態
  const [couponCode, setCouponCode] = useState("");
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: "", isError: false });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

  // 🛍️ 1. 計算商品原始小計
  const subtotal = useMemo(() => {
    return Math.round(
      (cart || []).reduce((sum, item) => sum + getQty(item) * getPrice(item), 0)
    );
  }, [cart]);

  // ✨ 2. 自動計算「滿額現折」 (滿 699 折 100)
  const autoDiscountAmount = useMemo(() => {
    return subtotal >= 699 ? 100 : 0;
  }, [subtotal]);

  // 💰 3. 計算「折後小計」 (免運門檻的判定基準)
  const discountedSubtotal = useMemo(() => {
    return subtotal - autoDiscountAmount;
  }, [subtotal, autoDiscountAmount]);

  const now = useMemo(() => getNow(), []);

  // 🚚 4. 計算運費 (判斷折後是否滿 999 且為超商取貨)
  const shippingFee = useMemo(() => {
    // 🔍 修正：沒選付款方式時回傳 null，代表還沒開始算運費
    if (!form.paymentMethod) return null; 
    
    const isMeetAutoFreeShipping = 
      discountedSubtotal >= 999 && form.paymentMethod === "超商取貨付款";

    if (isMeetAutoFreeShipping || isFreeShipping) return 0; 
    return calculateShipping(form.paymentMethod, now);
  }, [form.paymentMethod, now, isFreeShipping, discountedSubtotal]);

  // 🧾 5. 最終總金額
  const totalAmount = useMemo(() => {
    return Math.round(discountedSubtotal + shippingFee);
  }, [discountedSubtotal, shippingFee]);

  // ✅ 折扣碼驗證邏輯 (手動套用部分)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage({ text: "", isError: false });

    try {
      // 這裡維持你原本的門檻檢查邏輯
      if (discountedSubtotal < 999) {
        setCouponMessage({ text: "未達消費門檻，需滿 NT$ 999 才能使用此代碼喔！", isError: true });
        setCouponLoading(false);
        return;
      }

      if (form.paymentMethod !== "超商取貨付款") {
        setCouponMessage({ text: "此優惠碼僅限「超商取貨付款」使用喔！", isError: true });
        setCouponLoading(false);
        return;
      }

      const docRef = doc(db, "coupons", couponCode.trim().toUpperCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isActive && data.type === "free_shipping") {
          setIsFreeShipping(true); 
          setCouponMessage({ text: "🎉 已套用免運優惠！", isError: false });
        } else {
          setCouponMessage({ text: "此優惠碼已失效或不適用", isError: true });
        }
      } else {
        setCouponMessage({ text: "找不到此優惠碼，請重新輸入", isError: true });
      }
    } catch (error) {
      console.error("Coupon Error:", error);
      setCouponMessage({ text: "驗證失敗，請稍後再試", isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (isFreeShipping && form.paymentMethod !== "超商取貨付款") {
      setIsFreeShipping(false);
      setCouponMessage({ text: "變更付款方式後，免運優惠已取消", isError: true });
    }
  }, [form.paymentMethod, isFreeShipping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.paymentMethod) {
      alert("請完整填寫收件與付款資料");
      return;
    }

    setCheckoutInfo({ 
      ...form, 
      couponCode: isFreeShipping ? couponCode.toUpperCase() : "",
      appliedFreeShipping: (shippingFee === 0), // 更新：只要最終免運就標記為 true
      autoDiscountAmount // 同步傳遞自動折扣資訊
    });
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
          {/* ... 收件人資料 Input 保持不變 ... */}
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Line ID <span className="text-gray-400 text-xs">(選填)</span></label>
            <input type="text" className={inputStyle} placeholder="請輸入 Line ID" value={form.lineId} onChange={(e) => updateForm("lineId", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">縣市</label>
              <input type="text" className={inputStyle} placeholder="例如：台北市" value={form.city} onChange={(e) => updateForm("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">鄉鎮市區</label>
              <input type="text" className={inputStyle} placeholder="例如：大安區" value={form.district} onChange={(e) => updateForm("district", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">詳細地址</label>
            <input type="text" className={inputStyle} placeholder="街道、門牌、樓層" value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">付款方式</label>
            <select className={inputStyle} value={form.paymentMethod} onChange={(e) => updateForm("paymentMethod", e.target.value)}>
              <option value="">請選擇付款方式</option>
              <option value="超商取貨付款">超商取貨付款 </option>
              <option value="信用卡">信用卡</option>
            </select>
          </div>

          {/* 折扣碼區塊 */}
          <div className="space-y-2 pt-2 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
            <label className="text-sm font-medium text-gray-700 ml-1">專屬折扣碼</label>
            <div className="flex gap-3">
              <input type="text" className={inputStyle} placeholder="輸入代碼 (例如: FREE666)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button type="button" disabled={couponLoading} onClick={handleApplyCoupon} className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-black transition-all text-sm disabled:bg-gray-400 whitespace-nowrap">
                {couponLoading ? "驗證中" : "套用"}
              </button>
            </div>
            {couponMessage.text && (
              <p className={`text-xs ml-1 mt-1 ${couponMessage.isError ? "text-red-500" : "text-green-600"}`}>{couponMessage.text}</p>
            )}
          </div>

          {/* 🧾 金額摘要 */}
          <div className="border border-orange-100 rounded-2xl p-6 bg-[#fffcf9] space-y-3 mt-10">
            <div className="flex justify-between text-gray-600">
              <span>商品小計</span>
              <span>NT$ {subtotal?.toLocaleString()}</span>
            </div>

            {/* ✨ 新增：自動折扣金額顯示 */}
            {autoDiscountAmount > 0 && (
              <div className="flex justify-between text-red-500 font-medium">
                <span>滿額現折 (滿699折100)</span>
                <span>- NT$ {autoDiscountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 border-b border-orange-50 pb-3">
              <span>預估運費</span>
              <span className={shippingFee === 0 ? "text-green-600 font-bold" : ""}>
                {/* 🔍 判斷邏輯調整 */}
                {shippingFee === null 
                  ? "請選擇付款方式" 
                  : shippingFee === 0 
                    ? "NT$ 0 (免運優惠)" 
                    : `NT$ ${shippingFee?.toLocaleString()}`}
              </span>
            </div>
            
            <div className="flex justify-between font-bold text-xl text-gray-800 pt-1">
              <span>總金額</span>
              <span className="text-[#ef9d51]">NT$ {totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-[#ef9d51] text-white py-4 rounded-full text-lg font-medium hover:bg-[#d68a44] transition-all shadow-lg shadow-orange-100 active:scale-[0.98]">
              確認訂單資訊
            </button>
            <button type="button" onClick={() => navigate("/cart")} className="w-full mt-4 text-gray-400 text-sm hover:underline">
              返回購物車修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}