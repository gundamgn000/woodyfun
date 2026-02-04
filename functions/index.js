/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const crypto = require("crypto");

// === 藍新正式商店參數 ===
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV  = "Pr5t8YU839OZRXaC";

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

// 藍新 urlencode（實際上你這組參數不會影響）
function newebpayUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, c =>
      "%" + c.charCodeAt(0).toString(16).toUpperCase()
    );
}

exports.createNewebPayOrder = onRequest({ region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ ok: false });

    try {
      const { amount } = req.body || {};
      const Amt = Math.round(Number(amount));
      if (!Number.isFinite(Amt) || Amt <= 0) {
        return res.status(400).json({ ok: false });
      }

      const TimeStamp = Math.floor(Date.now() / 1000);
      const MerchantOrderNo = `WF${TimeStamp}`;

      const rawString =
        `MerchantID=${MERCHANT_ID}` +
        `&RespondType=JSON` +
        `&TimeStamp=${TimeStamp}` +
        `&Version=2.0` +
        `&MerchantOrderNo=${MerchantOrderNo}` +
        `&Amt=${Amt}` +
        `&ItemDesc=WoodyFunOrder` +
        `&LoginType=0`;

      const encoded = newebpayUrlEncode(rawString);

      // ✅ Node crypto AES-256-CBC（跟藍新一致）
      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        HASH_KEY,
        HASH_IV
      );
      cipher.setAutoPadding(true);

      let encrypted = cipher.update(encoded, "utf8", "hex");
      encrypted += cipher.final("hex");

      const TradeInfo = encrypted.toUpperCase();

      const shaRaw = `HashKey=${HASH_KEY}&TradeInfo=${TradeInfo}&HashIV=${HASH_IV}`;
      const TradeSha = crypto
        .createHash("sha256")
        .update(shaRaw)
        .digest("hex")
        .toUpperCase();

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
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  });
});
