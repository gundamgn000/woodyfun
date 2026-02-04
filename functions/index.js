/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

/**
 * ✅ 藍新專用 UrlEncode (RFC3986)
 * 藍新要求：除了英數字外，其餘字元轉成 %HEX，且空白要轉成 +
 */
function newebpayUrlEncode(str) {
  if (!str) return "";
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// === 藍新正式商店參數 (請確認與後台一致) ===
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV = "Pr5t8YU839OZRXaC";

// CORS 設定
const cors = corsLib({
  origin: [
    "https://woodyfun.vercel.app",
    "https://www.woodyfun.tw",
    "https://woodyfun.tw",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

exports.createNewebPayOrder = onRequest({ region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    // 處理預檢請求
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

    try {
      const { amount, orderId, email } = req.body || {};
      const Amt = Math.round(Number(amount));

      if (!Number.isFinite(Amt) || Amt <= 0) {
        return res.status(400).json({ ok: false, error: "無效的金額" });
      }

      const TimeStamp = Math.floor(Date.now() / 1000);
      // MerchantOrderNo 限英數，長度限制 20 字元
      const MerchantOrderNo = orderId
        ? String(orderId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || `WF${TimeStamp}`
        : `WF${TimeStamp}`;

      /**
       * ✅ 步驟 1：組合原始字串 (CheckValue)
       * 注意：
       * 1. 這裡的 & 與 = 「絕對不能」被編碼。
       * 2. 只有「參數值」(如 ItemDesc) 若含中文或特殊符號才需要 newebpayUrlEncode。
       */
      const itemDesc = "WoodyFunOrder";
      const rawString = 
        `MerchantID=${MERCHANT_ID}` +
        `&RespondType=JSON` +
        `&TimeStamp=${TimeStamp}` +
        `&Version=2.0` +
        `&MerchantOrderNo=${MerchantOrderNo}` +
        `&Amt=${Amt}` +
        `&ItemDesc=${itemDesc}` +
        `&LoginType=0`;

      /**
       * ✅ 步驟 2：AES 加密 (TradeInfo)
       * 模式：AES/CBC/PKCS7Padding
       */
      const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
      const iv = CryptoJS.enc.Utf8.parse(HASH_IV);

      const encrypted = CryptoJS.AES.encrypt(
        rawString, // 直接加密原始字串
        key,
        { 
          iv: iv, 
          mode: CryptoJS.mode.CBC, 
          padding: CryptoJS.pad.Pkcs7 
        }
      );

      // 轉換成 Hex 字串 (藍新通常使用小寫 hex)
      const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

      /**
       * ✅ 步驟 3：SHA256 壓碼 (TradeSha)
       * 格式：HashKey=xxx&TradeInfo=xxx&HashIV=xxx
       */
      const shaRaw = `HashKey=${HASH_KEY}&TradeInfo=${TradeInfo}&HashIV=${HASH_IV}`;
      const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

      // Log 資訊 (生產環境穩定後建議移除敏感資訊)
      console.log(`[NewebPay] Order: ${MerchantOrderNo}, Amt: ${Amt}`);
      console.log(`[NewebPay] TradeInfo: ${TradeInfo}`);
      console.log(`[NewebPay] TradeSha: ${TradeSha}`);

      // 回傳給前端，前端應建立一個隱藏表單自動提交至 action
      return res.json({
        ok: true,
        action: "https://core.newebpay.com/MPG/mpg_gateway",
        params: {
          MerchantID: MERCHANT_ID,
          TradeInfo: TradeInfo,
          TradeSha: TradeSha,
          Version: "2.0",
        },
      });

    } catch (err) {
      console.error("[NewebPay Error]", err);
      return res.status(500).json({ ok: false, error: err.message || "內部伺服器錯誤" });
    }
  });
});