// ========================================================
// AdminAddProduct.jsx — 使用 Admin UI 元件版（新增商品）
// ========================================================

import { useState } from "react";
import { db, storage } from "../../firebase/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

import imageCompression from "browser-image-compression";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Admin UI Components
import AdminCard from "../../components/admin/AdminCard";
import AdminInput from "../../components/admin/AdminInput";
import AdminTextarea from "../../components/admin/AdminTextarea";
import AdminButton from "../../components/admin/AdminButton";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminAddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sizes: "",
    tags: "",
    status: "active",
  });

  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 通用欄位更新
  const updateField = (field, value) =>
    setProduct((prev) => ({ ...prev, [field]: value }));

  // 壓縮圖片
  const compressImage = async (file) =>
    await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1800,
      useWebWorker: true,
    });

  // 上傳圖片
  const uploadImage = async (file) => {
    const compressed = await compressImage(file);
    const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, compressed);
    return await getDownloadURL(fileRef);
  };

  // 拖曳排序
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...galleryImages];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setGalleryImages(reordered);
  };

  // 新增商品
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !mainImage) {
      alert("請至少填入商品名稱、價格並上傳主圖");
      return;
    }

    setLoading(true);

    try {
      // 主圖
      const mainImageUrl = await uploadImage(mainImage);

      // 副圖
      const subImageUrls = [];
      for (let img of galleryImages) {
        const url = await uploadImage(img);
        if (url) subImageUrls.push(url);
      }

      const sizesArray = product.sizes
        ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const tagsArray = product.tags
        ? product.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await addDoc(collection(db, "products"), {
        name: product.name,
        description: product.description,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        category: product.category,
        status: product.status,
        sizes: sizesArray,
        tags: tagsArray,
        mainImageUrl,
        subImageUrls,
        createdAt: Timestamp.now(),
        
      });

      alert("商品已新增！");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      alert("新增失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // ======================= UI ============================
  return (
     
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-semibold tracking-wide mb-8 text-gray-800">
           新增商品
        </h1>

        <form onSubmit={handleSubmit}>
          <AdminCard className="space-y-12">
            {/* 上半部：左文字欄位 + 右主圖 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 左側欄位 */}
              <div className="space-y-6">
                <AdminInput
                  label="商品名稱"
                  name="name"
                  value={product.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="例：和服,外套"
                />

                <AdminTextarea
                  label="商品描述"
                  name="description"
                  value={product.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  placeholder="輸入材質、特色、洗滌方式……"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 form-section">
                  <AdminInput
                    label="價格"
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="例：1600"
                  />
                  <AdminInput
                    label="庫存"
                    type="number"
                    name="stock"
                    value={product.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
                    placeholder="例：10"
                  />
                </div>

                <AdminInput
                  label="分類"
                  name="category"
                  value={product.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="例：外套 / 洋裝 / 和服"
                />

                <AdminInput
                  label="尺寸（逗號分隔）"
                  name="sizes"
                  value={product.sizes}
                  onChange={(e) => updateField("sizes", e.target.value)}
                  placeholder="S, M, L"
                />

                <AdminInput
                  label="Tags（逗號分隔）"
                  name="tags"
                  value={product.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  placeholder="冬季, 限量, 黑色"
                />
              </div>

              {/* 右側：主圖 */}
              <div className="space-y-4 form-section">
                <label className="field-label">主圖（封面）</label>
                <div
                  className="dropzone h-64 group relative overflow-hidden"
                  onClick={() =>
                    document.getElementById("main-img-input")?.click()
                  }
                >
                  {mainImage ? (
                    <img
                      src={URL.createObjectURL(mainImage)}
                      alt="主圖預覽"
                      className="w-full h-full object-cover rounded-2xl transition duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">
                      點擊選擇主圖（建議 3:4 / 4:5）
                    </p>
                  )}
                </div>

                <input
                  id="main-img-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) setMainImage(e.target.files[0]);
                  }}
                />
              </div>
            </div>

            {/* 副圖區 */}
            <div className="space-y-4 form-section">
              <label className="field-label">副圖（可多張、可拖曳排序）</label>

              <div
                className="dropzone h-32"
                onClick={() =>
                  document.getElementById("sub-img-input")?.click()
                }
              >
                <p className="text-gray-500 text-sm">點擊新增副圖</p>
              </div>

              <input
                id="sub-img-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files?.length) return;
                  setGalleryImages([
                    ...galleryImages,
                    ...Array.from(e.target.files),
                  ]);
                }}
              />

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="gallery">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-3 md:grid-cols-4 gap-4"
                    >
                      {galleryImages.map((file, index) => (
                        <Draggable
                          key={file.name + index}
                          draggableId={file.name + index}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative group"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                className="h-28 w-full object-cover rounded-xl shadow group-hover:scale-[1.05] transition"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* 送出按鈕 */}
            <div className="pt-4">
              <AdminButton
                type="submit"
                variant="primary" // 黑底白字
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? "處理中…" : "新增商品"}
              </AdminButton>
            </div>
          </AdminCard>
        </form>
      </div>
     
    
  );
}
