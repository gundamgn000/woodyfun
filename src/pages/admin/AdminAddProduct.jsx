import { useState } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../context/AuthContext";
import { ImagePlus, X, Save, PackagePlus, Baby, Sparkles, Layers, Info } from 'lucide-react';

export default function AdminAddProduct() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // 狀態管理
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "專注力玩具",
    subCategory: "",
    ageRange: "",
    material: "天然實木",
    abilities: [], 
    tags: "", 
    isActive: true,
    status: "active"
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [subImages, setSubImages] = useState([]);
  const [subPreviews, setSubPreviews] = useState([]); 

  const abilityOptions = ["手眼協調", "觸覺刺激", "空間邏輯", "色彩認知", "精細動作"];

  // --- 處理邏輯區 ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
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
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleSubImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...subImages, ...files].slice(0, 5); 
      setSubImages(newFiles);
      setSubPreviews(newFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const removeSubImage = (index) => {
    const updatedImages = subImages.filter((_, i) => i !== index);
    const updatedPreviews = subPreviews.filter((_, i) => i !== index);
    setSubImages(updatedImages);
    setSubPreviews(updatedPreviews);
  };

  const uploadImage = async (file, path) => {
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressedFile);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("登入狀態異常");
    if (!product.name || !product.price || !mainImage) return alert("請填寫必要資訊並上傳主圖");

    try {
      setLoading(true);
      
      // 1. 上傳圖片
      const mainUrl = await uploadImage(mainImage, `products/main/${Date.now()}_${mainImage.name}`);
      const subUrls = await Promise.all(
        subImages.map(img => uploadImage(img, `products/sub/${Date.now()}_${img.name}`))
      );

      // 2. 準備存入的數據
      const finalData = {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        tags: product.tags.split(",").map(t => t.trim()).filter(Boolean),
        mainImageUrl: mainUrl,
        imageUrl: mainUrl, 
        subImageUrls: subUrls,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "products"), finalData);
      alert("🎉 木玩上架成功！");
      window.location.reload(); // 簡單重整頁面清空資料
    } catch (err) {
      console.error(err);
      alert("新增失敗，請檢查網路或權限");
    } finally {
      setLoading(false);
    }
  };

  // --- 樣式定義 ---
  const inputStyle = "w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2";

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PackagePlus className="text-orange-600" /> 新增木玩商品
          </h1>
          <p className="text-gray-500">上傳新的精選玩具至商店</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
        >
          {loading ? "處理中..." : <><Save size={18} /> 立即發布商品</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 基本資訊 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
              <Info size={18} className="text-orange-500" /> 基本資訊
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>商品名稱</label>
                <input name="name" value={product.name} onChange={handleChange} type="text" className={inputStyle} placeholder="例如：森林感官積木組" />
              </div>
              <div>
                <label className={labelStyle}>詳細描述</label>
                <textarea name="description" value={product.description} onChange={handleChange} rows="5" className={inputStyle} placeholder="描述玩具的設計理念與玩法..."></textarea>
              </div>
            </div>
          </section>

          {/* 能力標籤 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
              <Sparkles size={18} className="text-orange-500" /> 發展能力 (複選)
            </h2>
            <div className="flex flex-wrap gap-2">
              {abilityOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggleAbility(option)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    product.abilities.includes(option) 
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
          {/* 規格分類 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
              <Layers size={18} className="text-orange-500" /> 規格分類
            </h2>
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

              {/* 在基本資訊區塊內 */}
              <div>
                <label className={labelStyle}>商品分類</label>
                <select 
                  name="category" 
                  value={product.category} 
                  onChange={handleChange} 
                  className={inputStyle}
                >
                  <option value="專注力玩具">專注力玩具</option>
                  <option value="拼圖系列">拼圖系列</option>
                  <option value="親子桌遊">親子桌遊</option>
                  <option value="角色扮演">角色扮演</option>ㄋ
                </select>
              </div>
              <div>
                <label className={labelStyle}><Baby size={16} className="text-orange-500"/> 適齡階段</label>
                <select name="ageRange" value={product.ageRange} onChange={handleChange} className={inputStyle}>
                  <option value="">選擇年齡</option>
                  <option value="0-1歲">0-1歲</option>
                  <option value="1-3歲">1-3歲</option>
                  <option value="3-6歲">3-6歲</option>
                </select>
              </div>

              
              <div>
                <label className={labelStyle}>主要材質</label>
                <input name="material" value={product.material} onChange={handleChange} type="text" className={inputStyle} />
              </div>
            </div>
          </section>

          {/* 主圖上傳 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">商品主圖</h2>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" id="main-upload" />
              <label htmlFor="main-upload" className="cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-4 block hover:bg-orange-50 transition-all text-center">
                {mainPreview ? (
                  <img src={mainPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <div className="py-8 flex flex-col items-center text-gray-400">
                    <ImagePlus size={32} />
                    <span className="text-xs mt-2">點擊選擇主圖</span>
                  </div>
                )}
              </label>
            </div>
          </section>

          {/* 副圖上傳 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
              <Layers size={18} className="text-orange-500" /> 副圖 (最多 5 張)
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {subPreviews.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeSubImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {subImages.length < 5 && (
                <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-lg aspect-square flex flex-col items-center justify-center hover:bg-orange-50 text-gray-400">
                  <input type="file" accept="image/*" multiple onChange={handleSubImagesChange} className="hidden" />
                  <ImagePlus size={20} />
                </label>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}