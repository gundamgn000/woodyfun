import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../context/AuthContext";
import { 
  Save, Trash2, ChevronLeft, ImagePlus, X, 
  Sparkles, Baby, Layers, Info, Package 
} from 'lucide-react';

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 1. 初始化資料結構 (對齊玩具電商格式)
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "感官啟蒙",
    ageRange: "",
    material: "天然實木",
    abilities: [],
    tags: "",
    status: "active",
    mainImageUrl: "",
    subImageUrls: []
  });

  const [newMainFile, setNewMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [newSubFiles, setNewSubFiles] = useState([]);
  const [subPreviews, setSubPreviews] = useState([]);

  const abilityOptions = ["手眼協調", "觸覺刺激", "空間邏輯", "色彩認知", "精細動作"];

  // 2. 載入原始資料
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            ...data,
            tags: data.tags ? data.tags.join(", ") : ""
          });
          setMainPreview(data.mainImageUrl || data.imageUrl);
        } else {
          alert("找不到該商品");
          navigate("/admin/products");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // --- 邏輯處理 ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleAbility = (ability) => {
    setProduct(prev => ({
      ...prev,
      abilities: prev.abilities.includes(ability) 
        ? prev.abilities.filter(a => a !== ability)
        : [...prev.abilities, ability]
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMainFile(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleSubImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewSubFiles(prev => [...prev, ...files]);
    setSubPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingSubImage = (url) => {
    setProduct(prev => ({
      ...prev,
      subImageUrls: prev.subImageUrls.filter(img => img !== url)
    }));
  };

  const uploadImage = async (file, path) => {
    const options = { maxSizeMB: 0.7, maxWidthOrHeight: 1200, useWebWorker: true };
    const compressed = await imageCompression(file, options);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressed);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      let finalMainUrl = product.mainImageUrl;
      
      // 如果有換新主圖
      if (newMainFile) {
        finalMainUrl = await uploadImage(newMainFile, `products/main/${Date.now()}_edit`);
      }

      // 上傳新選的副圖
      const newlyUploadedSubUrls = await Promise.all(
        newSubFiles.map(file => uploadImage(file, `products/sub/${Date.now()}_${file.name}`))
      );

      const finalData = {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        tags: product.tags.split(",").map(t => t.trim()).filter(Boolean),
        mainImageUrl: finalMainUrl,
        imageUrl: finalMainUrl,
        subImageUrls: [...product.subImageUrls, ...newlyUploadedSubUrls],
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, "products", id), finalData);
      alert("更新成功！");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("確定要徹底刪除此玩具嗎？")) {
      await deleteDoc(doc(db, "products", id));
      navigate("/admin/products");
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-400">載入中...</div>;

  const inputStyle = "w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2";

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">編輯玩具商品</h1>
            <p className="text-sm text-gray-500">正在編輯：{product.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 size={18} /> 刪除
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 disabled:opacity-50"
          >
            {saving ? "儲存中..." : <><Save size={18} /> 儲存變更</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700"><Info size={18} className="text-orange-500" /> 基本資訊</h2>
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>商品名稱</label>
                <input name="name" value={product.name} onChange={handleChange} type="text" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>詳細描述</label>
                <textarea name="description" value={product.description} onChange={handleChange} rows="6" className={inputStyle}></textarea>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700"><Sparkles size={18} className="text-orange-500" /> 發展能力</h2>
            <div className="flex flex-wrap gap-2">
              {abilityOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggleAbility(option)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    product.abilities?.includes(option) 
                    ? "bg-orange-100 border-orange-500 text-orange-700 font-bold" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700"><Layers size={18} className="text-orange-500" /> 規格與庫存</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>售價</label>
                  <input name="price" value={product.price} onChange={handleChange} type="number" className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>庫存</label>
                  <input name="stock" value={product.stock} onChange={handleChange} type="number" className={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelStyle}><Baby size={16} className="text-orange-500"/> 適齡階段</label>
                <select name="ageRange" value={product.ageRange} onChange={handleChange} className={inputStyle}>
                  <option value="0-1歲">0-1歲</option>
                  <option value="1-3歲">1-3歲</option>
                  <option value="3-6歲">3-6歲</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">圖片管理</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs text-gray-500 mb-2 block">商品主圖 (點擊更換)</span>
                <input type="file" className="hidden" onChange={handleMainImageChange} />
                <div className="cursor-pointer border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:bg-orange-50 transition-all">
                  <img src={mainPreview} className="w-full h-40 object-cover" alt="Main" />
                </div>
              </label>

              <div>
                <span className="text-xs text-gray-500 mb-2 block">副圖清單 ({product.subImageUrls?.length})</span>
                <div className="grid grid-cols-3 gap-2">
                  {product.subImageUrls?.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} className="w-full h-full object-cover rounded-lg border" />
                      <button onClick={() => removeExistingSubImage(url)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-lg aspect-square flex items-center justify-center hover:bg-orange-50 text-gray-400">
                    <input type="file" multiple className="hidden" onChange={handleSubImagesChange} />
                    <ImagePlus size={20} />
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}