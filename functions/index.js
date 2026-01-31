const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");
const qs = require("querystring"); // 確保引入

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"],
});

// ⚠️ 請再次確認這些金鑰與你的「正式環境」商店後台完全一致
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

/* =========================
   AES 加密函數 (修正版)
========================= */
function createTradeInfo(data) {
  // 1. 使用 qs.stringify 自動處理所有欄位的編碼與拼接
  // 這會處理好 ItemDesc 的編碼，並確保格式為 key1=value1&key2=value2
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

  // 必須轉為 Hex 格式的大寫字串
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

/* =========================
   SHA256 壓碼函數
========================= */
function createTradeSha(tradeInfoHex) {
  // 順序必須死守：HashKey -> TradeInfo -> HashIV
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

        const action = "https://core.newebpay.com/MPG/mpg_gateway";
        
        // 準備原始資料物件
        const tradeData = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: String(itemDesc), // 不要在此手動 encode，qs 會幫你處理
          LoginType: "0",
        };

        if (email) {
          tradeData.Email = email;
        }

        const TradeInfo = createTradeInfo(tradeData);
        const TradeSha = createTradeSha(TradeInfo);

        return res.json({
          ok: true,
          action,
          version: "v1.0.1-testing", // <--- 加這一行
          params: {
            MerchantID: MERCHANT_ID,
            TradeInfo: TradeInfo,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });

        
      } catch (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ ok: false });
      }
    });
  }
);