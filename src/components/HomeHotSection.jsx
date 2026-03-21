import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

export default function HomeHotSection() {
  const [hotProducts, setHotProducts] = useState([]);

  useEffect(() => {
    const fetchHot = async () => {
      const q = query(
        collection(db, "products"), 
        where("isPopular", "==", true), // 🔍 對應你 Products.jsx 的欄位
        limit(4) // 首頁只顯示 4 個最精選的
      );
      const snap = await getDocs(q);
      setHotProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchHot();
  }, []);

  if (hotProducts.length === 0) return null;

  return (
    <section className="py-20 bg-[#faf9f6]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[#6a625d] tracking-wider">熱門精選</h2>
            <div className="h-1 w-10 bg-[#f39c42] mt-2"></div>
          </div>
          <Link to="/products?filter=popular" className="text-sm text-gray-400 hover:text-[#f39c42] transition-colors">
            查看更多 🔥
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {hotProducts.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square rounded-xl overflow-hidden mb-4">
                <img 
                  src={item.mainImageUrl || item.imageUrl || "/placeholder.png"} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-[#6a625d] text-sm font-medium truncate">{item.name}</h3>
              <p className="text-[#ef9d51] font-bold mt-1">NT$ {item.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}