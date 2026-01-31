const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

// ⚠️ 請再次手動確認這三組資料，不要有任何空格
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");
      
      try {
        const { orderId, amount, email } = req.body || {};
        
        const M_ID = MERCHANT_ID.trim();
        const H_KEY = H_KEY.trim();
        const H_IV = H_IV.trim();

        // 藍新規範：TimeStamp 必須為 10 位數
        const timeStamp = Math.floor(Date.now() / 1000);

        // 1. 建立物件，確保所有必填欄位都在
        const tradeParams = {
          MerchantID: M_ID,
          RespondType: "JSON",
          TimeStamp: timeStamp,
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: Math.round(Number(amount)),
          ItemDesc: "WoodyFunOrder", // 確保純英文，避免編碼爭議
          LoginType: 0,
          Email: String(email || "test@example.com").trim()
        };

        // 2. 關鍵：手動拼接字串 (順序與官網範例一致)
        const rawString = `MerchantID=${tradeParams.MerchantID}&RespondType=${tradeParams.RespondType}&TimeStamp=${tradeParams.TimeStamp}&Version=${tradeParams.Version}&MerchantOrderNo=${tradeParams.MerchantOrderNo}&Amt=${tradeParams.Amt}&ItemDesc=${tradeParams.ItemDesc}&LoginType=${tradeParams.LoginType}&Email=${tradeParams.Email}`;

        console.log("Check this string:", rawString);

        // 3. AES 加密
        const key = CryptoJS.enc.Utf8.parse(H_KEY);
        const iv = CryptoJS.enc.Utf8.parse(H_IV);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        
        const TradeInfoHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

        // 4. SHA256 加密 (順序：HashKey + TradeInfo + HashIV)
        const shaRaw = `HashKey=${H_KEY}&TradeInfo=${TradeInfoHex}&HashIV=${H_IV}`;
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

        return res.json({
          ok: true,
          v: "ULTIMATE_V5", 
          action: "https://ccore.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: M_ID,
            TradeInfo: TradeInfoHex,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error("Error:", err.message);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);