import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AddAddress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "addresses"), form);

    navigate("/address");
  };

  return (
    <div className="container mx-auto mt-20 px-6">
      <h1 className="text-3xl tracking-widest text-center mb-12">新增配送地址</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto border p-8 rounded-xl shadow-md space-y-6"
      >
        <div>
          <label className="block mb-1">收件人</label>
          <input
            type="text"
            name="name"
            className="w-full border p-3 rounded-lg"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1">電話</label>
          <input
            type="text"
            name="phone"
            className="w-full border p-3 rounded-lg"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1">地址</label>
          <textarea
            name="address"
            className="w-full border p-3 rounded-lg"
            value={form.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-lg tracking-widest hover:opacity-80"
        >
          儲存地址
        </button>
      </form>
    </div>
  );
};

export default AddAddress;
