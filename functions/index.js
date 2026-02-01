const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

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
          // 加上隨機數，避免訂單編號重複造成的 03009 錯誤
          MerchantOrderNo: "WF" + timeStamp, 
          Amt: Math.round(Number(amount)),
          ItemDesc: "WoodyFunOrder",
          LoginType: 0,
          // 嘗試增加這個欄位，告訴藍新我們要強行使用 JSON 回傳
          RespondType: "JSON"
        };

        // 拼接時務必確認順序與參數個數
        const rawString = `MerchantID=${tradeParams.MerchantID}&RespondType=${tradeParams.RespondType}&TimeStamp=${tradeParams.TimeStamp}&Version=${tradeParams.Version}&MerchantOrderNo=${tradeParams.MerchantOrderNo}&Amt=${tradeParams.Amt}&ItemDesc=${tradeParams.ItemDesc}&LoginType=${tradeParams.LoginType}`;
        // 3. AES 加密
        const key = CryptoJS.enc.Utf8.parse(H_KEY);
        const iv = CryptoJS.enc.Utf8.parse(H_IV);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        
        const TradeInfoHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

        // 4. SHA256 加密
        const shaRaw = `HashKey=${H_KEY}&TradeInfo=${TradeInfoHex}&HashIV=${H_IV}`;
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

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