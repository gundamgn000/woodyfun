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
    // 🚀 【核心優化】中繼站邏輯：解密資料並轉導 (保持不變)
    // -----------------------------------------------------------
    if (req.method === "POST" && req.query.from === "newebpay") {
      try {
        const { TradeInfo } = req.body;
        const hashKey = HASH_KEY.value();
        const hashIv = HASH_IV.value();

        // 解密資料，這裏面會包含用戶選的：門市名稱、門市編號
        const result = decryptNewebPay(TradeInfo, hashKey, hashIv);
        console.log("藍新回傳結果 (ReturnURL):", result);

        // TODO: 若需要將門市資訊寫回 Firestore，請在此處初始化 Admin SDK 並寫入
        // const storeName = result.Result.CVSStoreName;
        // const storeID = result.Result.CVSStoreID;
        
        const successUrl = "https://www.woodyfun.tw/checkout/success";
        return res.redirect(302, successUrl);
      } catch (err) {
        console.error("解密回傳失敗:", err);
        return res.redirect(302, "https://www.woodyfun.tw/checkout/success");
      }
    }

    // -----------------------------------------------------------
    // 建立訂單邏輯 (修正 MPG05007 錯誤)
    // -----------------------------------------------------------
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");

      try {
        console.log("收到前端請求 Body:", JSON.stringify(req.body));
        const merchantId = MERCHANT_ID.value();
        const hashKey = HASH_KEY.value();
        const hashIv = HASH_IV.value();

        const { amount, orderId, method } = req.body || {};
        const Amt = amount ? Math.round(Number(amount)) : 999;
        const TimeStamp = Math.floor(Date.now() / 1000);
        // 如果沒有 orderId，產生一個測試用的
        const MerchantOrderNo = orderId || `WF${TimeStamp}`; 
        console.log(`最終計算金額 Amt: ${Amt}, 訂單編號: ${MerchantOrderNo}, 付款方式: ${method}`);

        const MY_FUNCTION_URL = "https://createnewebpayorder-l7op6fj4oq-uc.a.run.app";
        // 這裡加上 ?from=newebpay 是為了讓上面的中繼站邏輯能抓到
        const ReturnURL = `${MY_FUNCTION_URL}?from=newebpay`; 
        
        // ClientBackURL 是使用者點擊「返回商店」時去的網址
        const ClientBackURL = "https://www.woodyfun.tw/checkout/success";
        const NotifyURL = ""; // 如果不需要幕後通知可留空，或填寫另外的 webhook url

        // 1. 強制確保 method 正確
        const currentMethod = (method || "").trim();

        // 2. 設定參數 (🔴 修正重點：MPG05007 解決方案)
        let creditParam = 0;
        let cvscomParam = 0;

        if (currentMethod === "超商取貨付款") {
           cvscomParam = 3; // 開啟超商取貨付款
           creditParam = 1; // 💡 關鍵：必須同時開啟信用卡，藍新才允許使用 CVSCOM
        } else {
           // 預設或信用卡都開啟信用卡支付
           creditParam = 1;
           cvscomParam = 0;
        }

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
          `CREDIT=${creditParam}`,   // 帶入修正後的參數
          `CVSCOM=${cvscomParam}`,   // 帶入修正後的參數
          `LWA=0`
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
        console.error("產生訂單失敗:", err);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);