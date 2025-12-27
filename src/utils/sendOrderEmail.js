// src/utils/sendOrderEmail.js
import emailjs from "@emailjs/browser";

/**
 * 寄出訂單通知（客戶 + 管理員）
 */
export async function sendOrderEmail({
  orderId,
  customerName,
  email,       // 客戶 Email
  address,
  items,       // 陣列：購物車內容
  total,       // number
  payment,     // "credit" | "cod"
  orderDate,   // 字串，例如 "2025/11/26"
}) {
  const serviceId       = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId      = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const adminTemplateId = import.meta.env.VITE_ADMIN_EMAIL_TEMPLATE;
  const publicKey       = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const adminEmail      = import.meta.env.VITE_ADMIN_EMAIL;

  if (!serviceId || !templateId || !adminTemplateId || !publicKey) {
    console.error("[sendOrderEmail] EmailJS .env 設定不完整", {
      serviceId,
      templateId,
      adminTemplateId,
      publicKey,
    });
    return { success: false, reason: "missing_env" };
  }

  // 組商品文字
  const itemsText = (items || [])
    .map((item) =>
      `${item.name}（${item.size}）×${item.quantity} － NT$${item.priceNumber?.toLocaleString?.() ?? item.price}`
    )
    .join("\n");

  const templateParams = {
    orderId,
    customerName,
    email,
    address,
    items: itemsText,
    total: total?.toLocaleString(),
    payment: payment === "credit" ? "信用卡付款" : "貨到付款",
    orderDate,
  };

  const adminTemplateParams = {
    ...templateParams,
    admin_email: adminEmail,
  };

  try {
    emailjs.init(publicKey);

    console.log("[sendOrderEmail] 客戶信 params:", templateParams);
    const customerResult = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log("[sendOrderEmail] 管理員信 params:", adminTemplateParams);
    const adminResult = await emailjs.send(
      serviceId,
      adminTemplateId,
      adminTemplateParams
    );

    console.log("[sendOrderEmail] 客戶信寄出成功:", customerResult);
    console.log("[sendOrderEmail] 管理員信寄出成功:", adminResult);

    return { success: true };
  } catch (error) {
    console.error("[sendOrderEmail] 寄信失敗:", error);
    return { success: false, error };
  }
}
