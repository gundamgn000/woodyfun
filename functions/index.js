/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");

// ✅ 用 Firebase Secrets 取代硬編碼
const MERCHANT_ID = defineSecret("MERCHANT_ID");
const HASH_KEY = defineSecret("HASH_KEY");
const HASH_IV = defineSecret("HASH_IV");

const cors = corsLib({
  origin: true,
  methods: ["POST", "GET", "OPTIONS"], // ✅ 加入 GET 確保跳轉順利
});

exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    secrets: [MERCHANT_ID, HASH_KEY, HASH_IV],
  },
  (req, res) => {
    // -----------------------------------------------------------
    // 🚀 【核心修正】處理藍新跳轉回來的「中繼站」邏輯
    // -----------------------------------------------------------
    if (req.method === "POST" && req.query.from === "newebpay") {
      console.log("收到藍新回傳資料，準備執行轉導...");
      
      // 這裡藍新會把結果放在 req.body。你可以視需求讀取 TradeInfo
      // 但最重要的是：把用戶導航回你的官網成功頁面 (使用 GET)
      const successUrl = "https://www.woodyfun.tw/checkout/success";
      
      // 執行 302 跳轉，這會強制瀏覽器改用 GET 請求你的網站，繞過 405 錯誤
      return res.redirect(302, successUrl);
    }

    // -----------------------------------------------------------
    // 原本的建立訂單邏輯
    // -----------------------------------------------------------
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

        // 💡 這裡最關鍵：ReturnURL 指向 Function 自己的網址，並帶上識別參數
        // 請確認你的 Function 網址是否正確 (如果不確定，可以從 Firebase Console 複製)
        const MY_FUNCTION_URL = "https://createnewebpayorder-l7op6fj4oq-uc.a.run.app";
        const ReturnURL = `${MY_FUNCTION_URL}?from=newebpay`;
        const ClientBackURL = "https://www.woodyfun.tw/checkout/success";

        const rawString = `MerchantID=${merchantId}&RespondType=JSON&TimeStamp=${TimeStamp}&Version=2.0&MerchantOrderNo=${MerchantOrderNo}&Amt=${Amt}&ItemDesc=WoodyFunOrder&LoginType=0&ReturnURL=${encodeURIComponent(ReturnURL)}&NotifyURL=&ReturnMethod=1&ClientBackURL=${encodeURIComponent(ClientBackURL)}`;

        // AES 加密
        const key = CryptoJS.enc.Utf8.parse(hashKey);
        const iv = CryptoJS.enc.Utf8.parse(hashIv);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        // SHA256 加密
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