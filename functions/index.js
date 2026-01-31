const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");
const qs = require("querystring"); 

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], 
});

// ⚠️ 請再次確認這三組資料與你藍新後台「正式環境」完全一致
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

function createTradeInfo(data) {
  // 使用 qs.stringify 自動處理所有欄位，這是最穩定的做法
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
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function createTradeSha(tradeInfoHex) {
  const plainText = `HashKey=${HASH_KEY}&TradeInfo=${tradeInfoHex}&HashIV=${HASH_IV}`;
  return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex).toUpperCase();
}

exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");
      
      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        
        const tradeData = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: String(itemDesc), 
          LoginType: "0",
        };

        if (email) { tradeData.Email = email; }

        const TradeInfo = createTradeInfo(tradeData);
        const TradeSha = createTradeSha(TradeInfo);

        return res.json({
          ok: true,
          v: "DEBUG_VERSION_101", // <--- 這是用來確認有沒有部署成功的標記
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