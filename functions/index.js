const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

// 1. 先定義最原始的金鑰
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
        
        // 2. 在這裡進行 Trim，確保後續使用的都是這組變數
        const M_ID = MERCHANT_ID.trim();
        const CURRENT_H_KEY = HASH_KEY.trim();
        const CURRENT_H_IV = HASH_IV.trim();

        const timeStamp = Math.floor(Date.now() / 1000);

        // 3. 建立交易參數
        const tradeParams = {
          MerchantID: M_ID,
          RespondType: "JSON",
          TimeStamp: timeStamp,
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: Math.round(Number(amount)),
          ItemDesc: "WoodyFunOrder",
          LoginType: 0,
          EmailModify: 0, 
          LoginType: 0,
          Email: String(email || "test@example.com").trim(),
          
        };

        // 4. 拼接原始字串 (使用剛定義好的 M_ID)
        const rawString = `MerchantID=${tradeParams.MerchantID}&RespondType=${tradeParams.RespondType}&TimeStamp=${tradeParams.TimeStamp}&Version=${tradeParams.Version}&MerchantOrderNo=${tradeParams.MerchantOrderNo}&Amt=${tradeParams.Amt}&ItemDesc=${tradeParams.ItemDesc}&LoginType=${tradeParams.LoginType}&Email=${tradeParams.Email}`;

        // 5. AES 加密 (使用 CURRENT_H_KEY / CURRENT_H_IV)
        const key = CryptoJS.enc.Utf8.parse(CURRENT_H_KEY);
        const iv = CryptoJS.enc.Utf8.parse(CURRENT_H_IV);
        const encrypted = CryptoJS.AES.encrypt(rawString, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        
        const TradeInfoHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

        // 6. SHA256 加密
        const shaRaw = `HashKey=${CURRENT_H_KEY}&TradeInfo=${TradeInfoHex}&HashIV=${CURRENT_H_IV}`;
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

        return res.json({
          ok: true,
          v: "FIX_ORDER_V6", 
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: M_ID,
            TradeInfo: TradeInfoHex,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error("Error Detail:", err.message);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);