/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

// 🔒 藍新金流專用 urlencode（與官方 PHP 行為一致）
function newebpayUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) =>
      "%" + c.charCodeAt(0).toString(16).toUpperCase()
    );
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
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

exports.createNewebPayOrder = onRequest({ region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      const { amount } = req.body || {};
      const Amt = Math.round(Number(amount));

      if (!Number.isFinite(Amt) || Amt <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid amount" });
      }

      const TimeStamp = Math.floor(Date.now() / 1000);
      const MerchantOrderNo = `WF${TimeStamp}`;

      // 🔑 手動組 querystring（關鍵）
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

      // AES 加密
      const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
      const iv  = CryptoJS.enc.Utf8.parse(HASH_IV);

      const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(encoded),
        key,
        {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const TradeInfo = encrypted.toString(); // ⚠️ 不轉 Hex，不轉大寫


      // ✅ 藍新規定的 SHA 算法
      const shaRaw = `HashKey=${HASH_KEY}&TradeInfo=${TradeInfo}&HashIV=${HASH_IV}`;
      const TradeSha = CryptoJS.SHA256(shaRaw)
        .toString(CryptoJS.enc.Hex)
        .toUpperCase();

      // Debug（第一次成功前保留）
      console.log("rawString:", rawString);
      console.log("encoded:", encoded);
      console.log("TradeInfo:", TradeInfo);
      console.log("TradeSha:", TradeSha);

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
