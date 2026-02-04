/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

// ✅ 藍新專用 urlencode（RFC3986 + 空白轉 +）
// 你目前的參數其實沒空白，但保留這個沒壞處（之後 ItemDesc/Email 可能會用到）
function newebpayUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// === 藍新正式商店參數 ===
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV  = "Pr5t8YU839OZRXaC";

// CORS
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
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

    try {
      const { amount, orderId } = req.body || {};
      const Amt = Math.round(Number(amount));

      if (!Number.isFinite(Amt) || Amt <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid amount" });
      }

      const TimeStamp = Math.floor(Date.now() / 1000);

      // ✅ MerchantOrderNo：要唯一、限英數（避免特殊字元）
      const MerchantOrderNo = orderId
        ? String(orderId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || `WF${TimeStamp}`
        : `WF${TimeStamp}`;

      // ✅ 建議手動組 rawString：確保順序固定（跟你現在做的一樣）
      const rawString =
        `MerchantID=${MERCHANT_ID}` +
        `&RespondType=JSON` +
        `&TimeStamp=${TimeStamp}` +
        `&Version=2.0` +
        `&MerchantOrderNo=${MerchantOrderNo}` +
        `&Amt=${Amt}` +
        `&ItemDesc=WoodyFunOrder` +
        `&LoginType=0`;

      // ✅ 只 encode 一次
      const encoded = newebpayUrlEncode(rawString);

      // ✅ AES-256-CBC + PKCS7
      const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
      const iv  = CryptoJS.enc.Utf8.parse(HASH_IV);

      const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(encoded),
        key,
        { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      // ✅ 關鍵：TradeInfo 用 Hex，但「不要改大小寫」
      // CryptoJS.enc.Hex 會輸出小寫 hex（這正好符合藍新回信呈現的風格）
      const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

      // ✅ 關鍵：TradeSha 的字串要長這樣（藍新信件範例）
      const shaRaw = `HashKey=${HASH_KEY}&TradeInfo=${TradeInfo}&HashIV=${HASH_IV}`;

      // ✅ TradeSha 結果轉大寫
      const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

      // Debug（先留到成功為止；成功後請刪掉敏感資訊）
      console.log("[NewebPay] typeof newebpayUrlEncode =", typeof newebpayUrlEncode);
      console.log("[NewebPay] rawString:", rawString);
      console.log("[NewebPay] encoded:", encoded);
      console.log("[NewebPay] TradeInfo:", TradeInfo); // 小寫 hex
      console.log("[NewebPay] shaRaw:", shaRaw);
      console.log("[NewebPay] TradeSha:", TradeSha);

      return res.json({
        ok: true,
        action: "https://core.newebpay.com/MPG/mpg_gateway",
        params: {
          MerchantID: MERCHANT_ID,
          TradeInfo: TradeInfo,   // ✅ 就送這串「原樣」
          TradeSha: TradeSha,     // ✅ 大寫
          Version: "2.0",
        },
      });
    } catch (err) {
      console.error("[NewebPay Error]", err);
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });
});
