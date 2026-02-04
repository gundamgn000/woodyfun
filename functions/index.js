/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

// 這是你的商店資訊 (已根據你提供的資料填入)
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV = "Pr5t8YU839OZRXaC";

const cors = corsLib({
  origin: true, // 允許所有來源，確保測試順利
  methods: ["POST", "OPTIONS"],
});

exports.createNewebPayOrder = onRequest({ region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      const { amount, orderId } = req.body || {};
      const Amt = Math.round(Number(amount));
      const TimeStamp = Math.floor(Date.now() / 1000);
      const MerchantOrderNo = orderId || `WF${TimeStamp}`;

      // 1. 組合 TradeInfo 的原始字串
      const rawString = `MerchantID=${MERCHANT_ID}&RespondType=JSON&TimeStamp=${TimeStamp}&Version=2.0&MerchantOrderNo=${MerchantOrderNo}&Amt=${Amt}&ItemDesc=WoodyFunOrder&LoginType=0`;

      // 2. AES 加密 (產生 TradeInfo)
      const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
      const iv = CryptoJS.enc.Utf8.parse(HASH_IV);
      const encrypted = CryptoJS.AES.encrypt(rawString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

      // 3. SHA256 加密 (產生 TradeSha) - 這是修正後的正確格式
      const shaRaw = `HashKey=${HASH_KEY}&${TradeInfo}&HashIV=${HASH_IV}`;
      const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

      // 回傳給前端
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
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
});