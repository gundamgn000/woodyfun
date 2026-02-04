/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const crypto = require("crypto");

// ===== 商店設定 =====
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV  = "Pr5t8YU839OZRXaC";

// ===== CORS =====
const cors = corsLib({
  origin: [
    "https://woodyfun.vercel.app",
    "https://www.woodyfun.tw",
    "https://woodyfun.tw",
    "http://localhost:5173",
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

// ===== 核心工具 =====
function createTradeInfo(key, iv, raw) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(raw, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted.toUpperCase();
}

function createTradeSha(key, tradeInfo, iv) {
  const raw = `HashKey=${key}&TradeInfo=${tradeInfo}&HashIV=${iv}`;
  return crypto.createHash("sha256").update(raw).digest("hex").toUpperCase();
}

// ===== 主函式 =====
exports.createNewebPayOrder = onRequest({ region: "us-central1" }, (req, res) => {
  cors(req, res, () => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      const { amount, orderId } = req.body || {};
      const amt = Math.round(Number(amount));

      if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid amount" });
      }

      const timeStamp = Math.floor(Date.now() / 1000);
      const merchantOrderNo = orderId || `WF${Date.now()}`;

      // ⚠️【重點】手動固定順序（這是藍新最在意的）
      const rawString =
        `MerchantID=${MERCHANT_ID}` +
        `&RespondType=JSON` +
        `&TimeStamp=${timeStamp}` +
        `&Version=2.0` +
        `&MerchantOrderNo=${merchantOrderNo}` +
        `&Amt=${amt}` +
        `&ItemDesc=WoodyFunOrder` +
        `&LoginType=0`;

      // encodeURIComponent（不要 RFC3986）
      const encoded = encodeURIComponent(rawString);

      const TradeInfo = createTradeInfo(
        Buffer.from(HASH_KEY, "utf8"),
        Buffer.from(HASH_IV, "utf8"),
        encoded
      );

      const TradeSha = createTradeSha(HASH_KEY, TradeInfo, HASH_IV);

      return res.json({
        ok: true,
        action: "https://core.newebpay.com/MPG/mpg_gateway",
        params: {
          MerchantID: MERCHANT_ID,
          TradeInfo,
          TradeSha,
          Version: "2.0",
        },
      });
    } catch (err) {
      console.error("[NewebPay Error]", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
});
