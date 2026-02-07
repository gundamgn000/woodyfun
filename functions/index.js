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
  methods: ["POST", "GET", "OPTIONS"],
});

// 輔助函式：AES 解密 (用來讀取藍新回傳的門市資訊)
function decryptNewebPay(TradeInfo, key, iv) {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const ivHex = CryptoJS.enc.Utf8.parse(iv);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Hex.parse(TradeInfo) },
    keyHex,
    { iv: ivHex, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    secrets: [MERCHANT_ID, HASH_KEY, HASH_IV],
  },
  (req, res) => {
    // -----------------------------------------------------------
    // 🚀 【核心優化】中繼站邏輯：解密資料並轉導
    // -----------------------------------------------------------
    if (req.method === "POST" && req.query.from === "newebpay") {
      try {
        const { TradeInfo } = req.body;
        const hashKey = HASH_KEY.value();
        const hashIv = HASH_IV.value();

        // 解密資料，這裏面會包含用戶選的：門市名稱、門市編號
        const result = decryptNewebPay(TradeInfo, hashKey, hashIv);
        console.log("藍新回傳結果:", result);

        // 如果是超商取貨付款，result.Result 裡面會有：
        // CVSStoreName (門市名), CVSAddress (門市地址), CVSStoreID (店號)
        
        // TODO: 這裡你可以使用 Firebase Admin SDK 更新資料庫，把門市存入訂單
        // const orderId = result.Result.MerchantOrderNo;
        
        const successUrl = "https://www.woodyfun.tw/checkout/success";
        return res.redirect(302, successUrl);
      } catch (err) {
        console.error("解密回傳失敗:", err);
        return res.redirect(302, "https://www.woodyfun.tw/checkout/success");
      }
    }

    // -----------------------------------------------------------
    // 原本的建立訂單邏輯 (保持你修改後的版本)
    // -----------------------------------------------------------
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");

      try {
        const merchantId = MERCHANT_ID.value();
        const hashKey = HASH_KEY.value();
        const hashIv = HASH_IV.value();

        const { amount, orderId, method } = req.body || {};
        const Amt = Math.round(Number(amount));
        const TimeStamp = Math.floor(Date.now() / 1000);
        const MerchantOrderNo = orderId || `WF${TimeStamp}`;

        const MY_FUNCTION_URL = "https://createnewebpayorder-l7op6fj4oq-uc.a.run.app";
        const ReturnURL = `${MY_FUNCTION_URL}?from=newebpay`;
        const ClientBackURL = "https://www.woodyfun.tw/checkout/success";
        const NotifyURL = ReturnURL; // 幕後通知
        // 1. 強制確保 method 正確

        const currentMethod = (method || "").trim();

        // 動態判定：如果是超商，CREDIT 要關掉 (0)，CVSCOM 要開啟 (3)
        const creditParam = (currentMethod === "信用卡") ? 1 : 0;
        let cvscomParam = (currentMethod === "超商取貨付款") ? 3 : 0;

        // 注意：Lanyin 規範中，若要觸發地圖，CVSCOM 需為 3 (取貨付款) 或 2 (純取貨)
        const rawString = [
          `MerchantID=${merchantId}`,
          `RespondType=JSON`,
          `TimeStamp=${TimeStamp}`,
          `Version=2.0`,
          `MerchantOrderNo=${MerchantOrderNo}`,
          `Amt=${Amt}`,
          `ItemDesc=WoodyFunOrder`,
          `LoginType=0`,
          `ReturnURL=${encodeURIComponent(ReturnURL)}`,
          `NotifyURL=${encodeURIComponent(NotifyURL)}`,
          `ReturnMethod=1`,
          `ClientBackURL=${encodeURIComponent(ClientBackURL)}`,
          `CREDIT=${creditParam}`,
          `CVSCOM=${cvscomParam}`,
          `LWA=0` // 關閉藍新錢包，減少干擾
        ].join("&");
        const key = CryptoJS.enc.Utf8.parse(hashKey);
        const iv = CryptoJS.enc.Utf8.parse(hashIv);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        const shaRaw = `HashKey=${hashKey}&${TradeInfo}&HashIV=${hashIv}`;
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

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