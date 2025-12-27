// src/components/admin/AdminButton.jsx

export default function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary / save / secondary / danger
  className = "",
  disabled = false,
}) {
  const base =
    "px-6 py-3 rounded-lg shadow text-white transition tracking-wide ";

  const variants = {
    // 後台主視覺：黑底白字（新增商品等主動作）
    primary: "bg-black hover:bg-gray-900",

    // 編輯儲存用：藍色（Save）
    save: "bg-blue-600 hover:bg-blue-700",

    // 灰色次要按鈕（暫時沒用到，保留以後擴充）
    secondary: "bg-gray-500 hover:bg-gray-600",

    // 危險操作：刪除商品
    danger: "bg-red-500 hover:bg-red-600",
  };

  const variantClass = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variantClass} ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
