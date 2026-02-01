const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});
const qs = require("querystring");
// ⚠️ 請再次手動輸入，確保沒有前後空格
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");
      
      try {
        const { orderId, amount } = req.body || {};
        
        const M_ID = MERCHANT_ID.trim();
        const H_KEY = HASH_KEY.trim();
        const H_IV = HASH_IV.trim();

        // 藍新要求：TimeStamp 為 10 位數
        const timeStamp = Math.floor(Date.now() / 1000);

        // 1. 建立最精簡的交易參數 (只留必填)
        // 注意：ItemDesc 絕對不能有空白或特殊符號
        // ... 前面引入保持不變 ...

        const tradeParams = {
          MerchantID: M_ID,
          RespondType: "JSON",
          TimeStamp: timeStamp,
          Version: "2.0",
          MerchantOrderNo: `WF${timeStamp}${Math.floor(Math.random() * 1000)}`,
          Amt: Math.round(Number(amount)),
          ItemDesc: "WoodyFunOrder",
          LoginType: 0,
        };
       // 1️⃣ 組 querystring（順序交給系統）
       const rawString = qs.stringify(tradeParams);

       // 2️⃣ 一定要 encode（藍新 MPG 2.0 核心）
       const encoded = encodeURIComponent(rawString);

       // 3️⃣ AES 加密「encoded 後的字串」
       const key = CryptoJS.enc.Utf8.parse(H_KEY);
       const iv = CryptoJS.enc.Utf8.parse(H_IV);

       const encrypted = CryptoJS.AES.encrypt(encoded, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
       });

      const TradeInfoHex = encrypted.ciphertext
        .toString(CryptoJS.enc.Hex)
        .toUpperCase();

        // 🚀 加入這幾行偵錯 (這會印在 Firebase 的後台)
        console.log("--- 🕵️ 藍新偵錯開始 ---");
        console.log("1. 原始拼接字串 (rawString):", rawString);
        console.log("2. AES 加密結果 (TradeInfoHex):", TradeInfoHex);
        console.log("3. SHA256 拼接前字串 (shaRaw):", shaRaw);
        console.log("4. 最終 SHA256 (TradeSha):", TradeSha);
        console.log("--- 🕵️ 藍新偵錯結束 ---");


        return res.json({
          ok: true,
          v: "PROD_FINAL_V7", 
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: M_ID,
            TradeInfo: TradeInfoHex,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);