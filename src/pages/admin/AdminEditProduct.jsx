// ==========================================
// AdminEditProduct.jsx — 使用 Admin UI 元件版（編輯商品）
// ==========================================

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Admin UI Components
import AdminCard from "../../components/admin/AdminCard";
import AdminInput from "../../components/admin/AdminInput";
import AdminTextarea from "../../components/admin/AdminTextarea";
import AdminButton from "../../components/admin/AdminButton";
import AdminLayout from "../../components/admin/AdminLayout";
// 圖片壓縮工具
const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        let w = img.width;
        let h = img.height;
        const maxW = 1200;
        const maxH = 1200;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w *= ratio;
          h *= ratio;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

// 上傳圖片
const uploadImage = async (file) => {
  const compressed = await compressImage(file);
  const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, compressed);
  return await getDownloadURL(fileRef);
};

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    status: "active",
    sizes: "",
    tags: "",
    mainImageUrl: "",
    subImageUrls: [],
  });

  const [newMainImage, setNewMainImage] = useState(null);
  const [newGalleryImages, setNewGalleryImages] = useState([]);

  // 讀取商品
  useEffect(() => {
    const loadProduct = async () => {
      const refDoc = doc(db, "products", id);
      const snap = await getDoc(refDoc);
      if (!snap.exists()) return;

      const data = snap.data();

      // 舊 / 新資料格式兼容
      const mainImage =
        data.mainImageUrl ??
        data.imageUrl ??
        "";

      const subs =
        data.subImageUrls ??
        data.images ??
        [];

      const sizes =
        Array.isArray(data.sizes)
          ? data.sizes.join(",")
          : data.sizes ?? "";

      const tags =
        Array.isArray(data.tags)
          ? data.tags.join(",")
          : data.tags ?? "";

      setProduct({
        name: data.name ?? "",
        price: data.price ?? "",
        stock: data.stock ?? "",
        category: data.category ?? "",
        description: data.description ?? "",
        status: data.status ?? "active",
        sizes,
        tags,
        mainImageUrl: mainImage,
        subImageUrls: subs,
      });
    };

    loadProduct();
  }, [id]);

  // 表單輸入
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleMainChange = (e) => setNewMainImage(e.target.files[0]);
  const handleGalleryChange = (e) =>
    setNewGalleryImages([...e.target.files]);

  const removeGalleryImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      subImageUrls: prev.subImageUrls.filter((_, i) => i !== index),
    }));
  };

  // 儲存
  const handleSave = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "products", id);

      const sizesArray = product.sizes
        ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const tagsArray = product.tags
        ? product.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      // 主圖
      let mainUrl = product.mainImageUrl;
      if (newMainImage) {
        mainUrl = await uploadImage(newMainImage);
      }

      // 副圖
      const subs = [...product.subImageUrls];
      for (let file of newGalleryImages) {
        const url = await uploadImage(file);
        if (url) subs.push(url);
      }

      await updateDoc(docRef, {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        category: product.category,
        description: product.description,
        status: product.status,
        sizes: sizesArray,
        tags: tagsArray,
        mainImageUrl: mainUrl,
        subImageUrls: subs,
      });

      alert("商品已更新成功！");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("儲存失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  };

  // 刪除
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "確定要刪除這個商品嗎？刪除後將無法復原。"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", id));
      alert("商品已成功刪除！");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("刪除失敗，請稍後再試");
    }
  };

  // ======================= UI ============================
  return (
    
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-semibold tracking-wide mb-8 text-gray-800">
          編輯商品
        </h1>

        {/* 基本資料 */}
        <AdminCard className="space-y-8">
          <AdminInput
            label="商品名稱"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="商品名稱"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 form-section">
            <AdminInput
              label="價格"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
            />
            <AdminInput
              label="庫存"
              name="stock"
              type="number"
              value={product.stock}
              onChange={handleChange}
            />
          </div>

          <AdminInput
            label="分類"
            name="category"
            value={product.category}
            onChange={handleChange}
          />

          <AdminInput
            label="尺寸（逗號分隔）"
            name="sizes"
            value={product.sizes}
            onChange={handleChange}
            placeholder="S,M,L"
          />

          <AdminInput
            label="Tags（逗號分隔）"
            name="tags"
            value={product.tags}
            onChange={handleChange}
            placeholder="冬季, 可愛, 黑色"
          />

          <AdminTextarea
            label="商品描述"
            name="description"
            value={product.description}
            onChange={handleChange}
            rows={4}
          />
        </AdminCard>

        {/* 圖片管理 */}
        <AdminCard className="space-y-8 mt-10">
          <h2 className="text-xl font-semibold text-gray-700">圖片管理</h2>

          {/* 主圖 */}
          <div className="form-section">
            <label className="field-label">主圖（封面）</label>
            {product.mainImageUrl && (
              <img
                src={product.mainImageUrl}
                className="w-40 h-40 rounded-xl object-cover shadow mb-4"
              />
            )}
            <input type="file" onChange={handleMainChange} />
          </div>

          {/* 副圖 */}
          <div className="form-section">
            <label className="field-label">副圖（可新增 / 刪除）</label>
            <div className="flex flex-wrap gap-4">
              {product.subImageUrls?.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    className="w-28 h-28 rounded-xl object-cover shadow"
                  />
                  <button
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              multiple
              className="mt-3"
              onChange={handleGalleryChange}
            />
          </div>
        </AdminCard>

        {/* 底部按鈕 */}
        <div className="flex justify-between mt-8 gap-4">
          <AdminButton variant="danger" onClick={handleDelete}>
            刪除商品
          </AdminButton>

          <AdminButton
            variant="save"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "儲存中..." : "儲存變更"}
          </AdminButton>
        </div>
      </div>
    
    
  );
}
