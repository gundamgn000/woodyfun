const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");
const qs = require("querystring"); // 已確認引入

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

// ⚠️【正式環境金鑰】直接寫入，確保數值絕對正確
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

/* =========================
   AES 加密函數 (修正版)
   使用 qs.stringify 處理所有編碼細節
========================= */
function createTradeInfo(data) {
  // 使用 qs.stringify 會自動將物件轉為 key1=value1&key2=value2 格式
  // 並自動處理 URL 編碼（例如：空格會轉為 +），這最符合藍新規範
  const raw = qs.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(
    raw,
    CryptoJS.enc.Utf8.parse(HASH_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(HASH_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  // 必須將 ciphertext 轉為 Hex 並大寫
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

/* =========================
   SHA256 壓碼函數 (維持穩定)
========================= */
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
      if (req.method === "OPTIONS") return res.status(204).send("");
      
      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        
        if (!orderId || !amount || !itemDesc) {
          return res.status(400).json({ ok: false, message: "缺少必要欄位" });
        }

        // 強制鎖定正式環境網址
        const action = "https://core.newebpay.com/MPG/mpg_gateway";
        
        // 準備傳給藍新的原始資料物件
        const tradeData = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: String(itemDesc), // 這裡不需要先 encode，qs.stringify 會幫你處理
          LoginType: "0",
        };

        // 只有在 email 有值時才加入，避免空字串影響加密
        if (email) {
          tradeData.Email = email;
        }

        const TradeInfo = createTradeInfo(tradeData);
        const TradeSha = createTradeSha(TradeInfo);

        console.log(`建立訂單: ${orderId}, 金額: ${amount}, Info長度: ${TradeInfo.length}`);

        return res.json({
          ok: true,
          action,
          params: {
            MerchantID: MERCHANT_ID,
            TradeInfo: TradeInfo,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);