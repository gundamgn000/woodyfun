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

        const amt = Math.round(Number(amount));
        if (!Number.isFinite(amt) || amt <= 0) {
          return res.status(400).json({ ok: false, error: "Invalid amount" });
        }

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

        // 1) querystring
        const rawString = qs.stringify(tradeParams);

        // 2) encode（一定要）
        const encoded = encodeURIComponent(rawString);

        // 3) AES
        const key = CryptoJS.enc.Utf8.parse(H_KEY);
        const iv  = CryptoJS.enc.Utf8.parse(H_IV);

        const encrypted = CryptoJS.AES.encrypt(encoded, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        // ✅ TradeInfo：不要轉大寫
        const TradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        // 4) SHA256（✅ 一定用 trim 後的 H_KEY / H_IV）
        const shaRaw = `HashKey=${H_KEY}&TradeInfo=${TradeInfo}&HashIV=${H_IV}`;

        // ✅ TradeSha 才轉大寫
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

        // debug
        console.log("rawString:", rawString);
        console.log("encoded:", encoded);
        console.log("TradeInfo:", TradeInfo);
        console.log("shaRaw:", shaRaw);
        console.log("TradeSha:", TradeSha);
        console.log("keyLen/ivLen:", H_KEY.length, H_IV.length);


        return res.json({
          ok: true,
          v: "PROD_FINAL_V7", 
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: M_ID,
            TradeInfo: TradeInfo,
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