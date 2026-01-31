const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");
const qs = require("querystring"); 

// 允許你的前端網址跨網域存取
const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

// ⚠️ 請確保這三組資料與藍新管理後台完全一致
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

/* =========================
   AES 加密函數 (使用 qs 確保編碼 100% 正確)
========================= */
function createTradeInfo(data) {
  // 手動拼接，確保順序與內容完全掌控
  const components = [
    `MerchantID=${data.MerchantID}`,
    `RespondType=${data.RespondType}`,
    `TimeStamp=${data.TimeStamp}`,
    `Version=${data.Version}`,
    `MerchantOrderNo=${data.MerchantOrderNo}`,
    `Amt=${data.Amt}`,
    `ItemDesc=${data.ItemDesc}`,
    `LoginType=${data.LoginType}`,
    `Email=${data.Email}`
  ];
  
  const rawString = components.join('&');

  const encrypted = CryptoJS.AES.encrypt(
    rawString,
    CryptoJS.enc.Utf8.parse(HASH_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(HASH_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function createTradeSha(tradeInfoHex) {
  const plainText = `HashKey=${HASH_KEY}&TradeInfo=${tradeInfoHex}&HashIV=${HASH_IV}`;
  return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex).toUpperCase();
}

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
        
        // 1. 再次確保金鑰與 ID 前後無空白字元 (Trim)
        const M_ID = MERCHANT_ID.trim();
        const H_KEY = HASH_KEY.trim();
        const H_IV = HASH_IV.trim();

        // 2. 準備乾淨的資料
        const tradeData = {
          MerchantID: M_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: "WoodyFunOrder", // ⚠️ 先寫死純英文，排除中文編碼問題
          LoginType: "0",
          Email: String(email || "test@example.com").trim()
        };

        // 3. 嚴格的手動拼接 (不要用 encodeURIComponent)
        // 藍新 MPG03009 通常是這裡的字串跟後台算的不一樣
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

        // 4. AES 加密 (確保使用剛剛 Trim 過的 KEY/IV)
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
        // 5. SHA256 加密 (順序: HashKey + TradeInfo + HashIV)
        const shaRaw = `HashKey=${H_KEY}&TradeInfo=${TradeInfo}&HashIV=${H_IV}`;
        const TradeSha = CryptoJS.SHA256(shaRaw).toString(CryptoJS.enc.Hex).toUpperCase();

        return res.json({
          ok: true,
          v: "FINAL_FIX_V3", // 更新版本號以便確認部署成功
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