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
  // 強制將空格轉為 %20，這是藍新最穩定的接收格式
  const rawString = qs.stringify(data).replace(/\+/g, '%20');

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
        
        // 準備送給藍新的原始欄位
        const tradeData = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: String(itemDesc || "WoodyFunOrder"), 
          LoginType: "0",
          Email: email || ""
        };

        const TradeInfo = createTradeInfo(tradeData);
        const TradeSha = createTradeSha(TradeInfo);

        return res.json({
          ok: true,
          v: "FINAL_FIX_V1", // <--- 部署後請檢查 F12 是否看到這個版本號
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: MERCHANT_ID,
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