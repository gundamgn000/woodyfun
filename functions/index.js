/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

const MERCHANT_ID = defineSecret("MERCHANT_ID");
const HASH_KEY = defineSecret("HASH_KEY");
const HASH_IV = defineSecret("HASH_IV");

const cors = corsLib({
  origin: true, 
  methods: ["POST", "OPTIONS"],
});

exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    secrets: [MERCHANT_ID, HASH_KEY, HASH_IV],
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");

      try {
        const merchantId = MERCHANT_ID.value();
        const hashKey = HASH_KEY.value();
        const hashIv = HASH_IV.value();

        const { amount, orderId } = req.body || {};
        const Amt = Math.round(Number(amount));
        const TimeStamp = Math.floor(Date.now() / 1000);
        const MerchantOrderNo = orderId || `WF${TimeStamp}`;

        // --- 網址設定 ---
        const BASE_URL = "https://www.woodyfun.tw"; 
        const ReturnURL = `${BASE_URL}/checkout/success`;
        
        // 💡 這裡是之後你要填入 paymentNotify 網址的地方
        // 目前我們先填 BASE_URL 確保藍新不會報格式錯誤
        const NotifyURL = BASE_URL; 

        // --- 組合 rawString (包含 CVSCOM=3 開啟超商物流) ---
        // 這邊確保所有的 & 符號都有正確連接
        const rawString = `MerchantID=${merchantId}&RespondType=JSON&TimeStamp=${TimeStamp}&Version=2.0&MerchantOrderNo=${MerchantOrderNo}&Amt=${Amt}&ItemDesc=WoodyFunOrder&LoginType=0&ReturnURL=${encodeURIComponent(ReturnURL)}&NotifyURL=${encodeURIComponent(NotifyURL)}&CVSCOM=3`;

        // --- AES 加密核心 (保持不變) ---
        const key = CryptoJS.enc.Utf8.parse(hashKey);
        const iv = CryptoJS.enc.Utf8.parse(hashIv);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        // --- SHA256 加密核心 (保持不變) ---
        const shaRaw = `HashKey=${hashKey}&${TradeInfo}&HashIV=${hashIv}`;
        const TradeSha = CryptoJS.SHA256(shaRaw)
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();

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