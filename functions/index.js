/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const crypto = require("crypto");
const qs = require("querystring");

// ✅ 建議：正式上線請改用 functions:config 或 .env，不要硬寫在程式裡
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV = "Pr5t8YU839OZRXaC";

// ✅ CORS：放行 Vercel + 自訂網域 + 本機
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

// RFC3986 encode（更貼近藍新常見範例需求）
function encodeRFC3986(str) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// AES-256-CBC + PKCS7（Node crypto 預設 padding 即 PKCS7）
function createTradeInfo(aesKey, aesIv, params) {
  // 1) querystring：MerchantID=...&RespondType=...（不排序也行，但建議固定順序）
  const raw = qs.stringify(params);

  // 2) URL encode（藍新端普遍預期）
  const encoded = encodeRFC3986(raw);

  // 3) AES encrypt -> HEX
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, aesIv);
  cipher.setAutoPadding(true);

  let encrypted = cipher.update(encoded, "utf8", "hex");
  encrypted += cipher.final("hex");

  // ✅ TradeInfo 建議大寫
  return encrypted.toUpperCase();
}

function createTradeSha(hashKey, tradeInfo, hashIv) {
  // ⚠️ 藍新範例：HashKey=...&TradeInfo=...&HashIV=...
  const shaRaw = `HashKey=${hashKey}&TradeInfo=${tradeInfo}&HashIV=${hashIv}`;
  return crypto.createHash("sha256").update(shaRaw).digest("hex").toUpperCase();
}

function buildMerchantOrderNo(orderId) {
  // ✅ 正式不要用固定單號，避免重複（藍新可能直接拒絕或造成不可預期）
  // 你可以傳入 orderId，就用它；沒傳就用時間戳
  if (orderId && typeof orderId === "string") {
    return orderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20) || `WF${Date.now()}`;
  }
  return `WF${Date.now()}`; // 長度OK，且唯一性夠用
}

exports.createNewebPayOrder = onRequest({ region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method Not Allowed" });
      }

      const { orderId, amount } = req.body || {};

      const M_ID = (MERCHANT_ID || "").trim();
      const H_KEY = (HASH_KEY || "").trim();
      const H_IV = (HASH_IV || "").trim();

      if (!M_ID || !H_KEY || !H_IV) {
        return res.status(500).json({ ok: false, error: "Missing merchant config" });
      }

      const amt = Math.round(Number(amount));
      if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid amount" });
      }

      const timeStamp = Math.floor(Date.now() / 1000);
      const merchantOrderNo = buildMerchantOrderNo(orderId);

      // ✅ 最小必要參數（你要擴充再加）
      const tradeParams = {
        MerchantID: M_ID,        // 內層 MerchantID
        RespondType: "JSON",
        TimeStamp: timeStamp,
        Version: "2.0",
        MerchantOrderNo: merchantOrderNo,
        Amt: amt,
        ItemDesc: "WoodyFunOrder",
        LoginType: 0,
      };

      const aesKey = Buffer.from(H_KEY, "utf8");
      const aesIv = Buffer.from(H_IV, "utf8");

      const TradeInfo = createTradeInfo(aesKey, aesIv, tradeParams);
      const TradeSha = createTradeSha(H_KEY, TradeInfo, H_IV);

      // （可留、但正式上線建議減少敏感資訊輸出）
      console.log("[NewebPay] MerchantOrderNo:", merchantOrderNo);
      console.log("[NewebPay] Amt:", amt);
      console.log("[NewebPay] TradeInfo:", TradeInfo);
      console.log("[NewebPay] TradeSha:", TradeSha);

      return res.json({
        ok: true,
        v: "PROD_FINAL",
        action: "https://core.newebpay.com/MPG/mpg_gateway",
        params: {
          MerchantID: M_ID,  // 外層 MerchantID（一定要跟內層一致）
          TradeInfo,
          TradeSha,
          Version: "2.0",
        },
      });
    } catch (err) {
      console.error("[NewebPay] Error:", err);
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });
});
