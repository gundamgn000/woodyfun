import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AddressList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleNext = () => {
    if (!name || !phone || !address) {
      alert("請完整填寫所有欄位");
      return;
    }

    // 暫存收件資料到 localStorage → 下一頁會讀取
    const shippingInfo = {
      name,
      phone,
      address,
      email: user?.email || "",
    };

    localStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));

    navigate("/order-confirm");
  };

  return (
    <div className="container mx-auto pt-32 pb-20 px-4">
      <h1 className="text-3xl font-bold mb-10">收件資料</h1>

      <div className="max-w-xl space-y-6">

        <div>
          <label className="block font-semibold mb-1">姓名</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入收件人姓名"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">電話</label>
          <input
            type="tel"
            className="w-full border p-3 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="請輸入聯絡電話"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">收件地址</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="請輸入收件地址"
          />
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-black text-white py-3 rounded-full text-lg mt-6 hover:opacity-80"
        >
          前往下一步：確認訂單
        </button>
      </div>
    </div>
  );
};

export default AddressList;
