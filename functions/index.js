const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

// 允許你的前端網址跨網域存取
const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

// ⚠️ 請確保這三組資料與藍新管理後台完全一致
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

/* =========================
   API 主程式
========================= */
exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      // 處理瀏覽器預檢請求
      if (req.method === "OPTIONS") return res.status(204).send("");
      
      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        
        // 1. 金鑰去空白處理
        const M_ID = MERCHANT_ID.trim();
        const H_KEY = HASH_KEY.trim();
        const H_IV = HASH_IV.trim();

        // 2. 準備交易資料
        const tradeData = {
          MerchantID: M_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: "WoodyFunOrder", 
          LoginType: "0",
          Email: String(email || "test@example.com").trim()
        };

        // 3. 拼接原始字串
        const rawString = [
          `MerchantID=${tradeData.MerchantID}`,
          `RespondType=${tradeData.RespondType}`,
          `TimeStamp=${tradeData.TimeStamp}`,
          `Version=${tradeData.Version}`,
          `MerchantOrderNo=${tradeData.MerchantOrderNo}`,
          `Amt=${tradeData.Amt}`,
          `ItemDesc=${tradeData.ItemDesc}`,
          `LoginType=${tradeData.LoginType}`,
          `Email=${tradeData.Email}`
        ].join('&');

        console.log("Debug - 加密前原始字串:", rawString);

        // 4. AES 加密 (產生 TradeInfoHex)
        const encrypted = CryptoJS.AES.encrypt(
          rawString,
          CryptoJS.enc.Utf8.parse(H_KEY),
          {
            iv: CryptoJS.enc.Utf8.parse(H_IV),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        );
        
        const TradeInfoHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

        // 5. SHA256 加密 (⚠️ 變數已統一修正為 TradeInfoHex)
        const shaRaw = `HashKey=${H_KEY}&TradeInfo=${TradeInfoHex}&HashIV=${H_IV}`;
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

        return res.json({
          ok: true,
          v: "STABLE_V4_SUCCESS", // 看到這個版本號代表邏輯已修正
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: M_ID,
            TradeInfo: TradeInfoHex,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error("Encryption Error:", err.message);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);