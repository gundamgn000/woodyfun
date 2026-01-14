import { useState } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../context/AuthContext";

export default function AdminAddProduct() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    status: "active",
    sizes: "",
    tags: "",
  });

  const [mainImage, setMainImage] = useState(null);
  const [subImages, setSubImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleSubImagesChange = (e) => {
    setSubImages(Array.from(e.target.files));
  };

  const uploadImage = async (file, path) => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressedFile);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 必補：登入狀態保護
    if (!user) {
      alert("登入狀態異常，請重新登入後再試一次");
      return;
    }

    if (!product.name || !product.price || !mainImage) {
      alert("請至少填寫商品名稱、價格，並上傳主圖");
      return;
    }

    try {
      setLoading(true);

      // 主圖
      const mainImageUrl = await uploadImage(
        mainImage,
        `products/main/${Date.now()}_${mainImage.name}`
      );

      // 副圖
      const subImageUrls = [];
      for (const img of subImages) {
        const url = await uploadImage(
          img,
          `products/sub/${Date.now()}_${img.name}`
        );
        subImageUrls.push(url);
      }

      const sizesArray = product.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const tagsArray = product.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

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

        // ⭐ admin 專用欄位（關鍵）
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert("商品新增成功");

      // reset
      setProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        status: "active",
        sizes: "",
        tags: "",
      });
      setMainImage(null);
      setSubImages([]);
    } catch (err) {
      console.error("新增商品失敗", err);
      alert("新增失敗，請確認權限或稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">新增商品</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="商品名稱"
          className="w-full border p-2"
        />

        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="商品描述"
          className="w-full border p-2"
        />

        <input
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          placeholder="價格"
          className="w-full border p-2"
        />

        <input
          name="stock"
          type="number"
          value={product.stock}
          onChange={handleChange}
          placeholder="庫存"
          className="w-full border p-2"
        />

        <input
          name="category"
          value={product.category}
          onChange={handleChange}
          placeholder="分類"
          className="w-full border p-2"
        />

        <input
          name="sizes"
          value={product.sizes}
          onChange={handleChange}
          placeholder="尺寸（逗號分隔）"
          className="w-full border p-2"
        />

        <input
          name="tags"
          value={product.tags}
          onChange={handleChange}
          placeholder="標籤（逗號分隔）"
          className="w-full border p-2"
        />

        <input type="file" accept="image/*" onChange={handleMainImageChange} />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleSubImagesChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded"
        >
          {loading ? "上傳中..." : "新增商品"}
        </button>
      </form>
    </div>
  );
}
