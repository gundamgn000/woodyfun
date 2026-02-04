/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

// ✅ 用 Firebase Secrets 取代硬編碼（最終安全版）
const MERCHANT_ID = defineSecret("MERCHANT_ID");
const HASH_KEY = defineSecret("HASH_KEY");
const HASH_IV = defineSecret("HASH_IV");

const cors = corsLib({
  origin: true, // 允許所有來源，確保測試順利（你原本的設定）
  methods: ["POST", "OPTIONS"],
});

exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    // ✅ v2 正確用法：宣告本 function 會用到哪些 secrets
    secrets: [MERCHANT_ID, HASH_KEY, HASH_IV],
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");

      try {
        // ✅ 從 Secret 讀值（取代你原本的常數）
        const merchantId = MERCHANT_ID.value();
        const hashKey = HASH_KEY.value();
        const hashIv = HASH_IV.value();

        const { amount, orderId } = req.body || {};
        const Amt = Math.round(Number(amount));
        const TimeStamp = Math.floor(Date.now() / 1000);
        const MerchantOrderNo = orderId || `WF${TimeStamp}`;

        // 1) 組合 TradeInfo 的原始字串（完全保留你原本格式）
        // 我建議的寫法（更直覺，不容易漏掉 &）
        // ✅ 請務必連成「完整的一行」，中間不要按 Enter 換行
        const rawString = `MerchantID=${merchantId}&RespondType=JSON&TimeStamp=${TimeStamp}&Version=2.0&MerchantOrderNo=${MerchantOrderNo}&Amt=${Amt}&ItemDesc=WoodyFunOrder&LoginType=0`;

        // 2) AES 加密 (產生 TradeInfo)（完全保留你原本模式/補位）
        const key = CryptoJS.enc.Utf8.parse(hashKey);
        const iv = CryptoJS.enc.Utf8.parse(hashIv);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        // 藍新要的是 Hex
        const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        // 3) SHA256 加密 (產生 TradeSha)（完全保留你原本格式）
        const shaRaw = `HashKey=${hashKey}&${TradeInfo}&HashIV=${hashIv}`;
        const TradeSha = CryptoJS.SHA256(shaRaw)
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();

        // 回傳給前端（完全保留你的回傳結構）
        return res.json({
          ok: true,
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: merchantId,
            TradeInfo,
            TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);
