const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"], // 確保這是您的前端網址
});

// ⚠️【正式環境金鑰】直接寫入，確保數值絕對正確
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

/* =========================
   AES 加密函數
   (順序必須嚴格遵守藍新規定)
========================= */
function createTradeInfo(data) {
  const params = [
    `MerchantID=${data.MerchantID}`,
    `RespondType=${data.RespondType}`,
    `TimeStamp=${data.TimeStamp}`,
    `Version=${data.Version}`,
    `MerchantOrderNo=${data.MerchantOrderNo}`,
    `Amt=${data.Amt}`,
    `ItemDesc=${encodeURIComponent(data.ItemDesc)}`, // 這裡進行 URL 編碼
    `LoginType=${data.LoginType}`,
  ];

  // 如果有 Email，必須加入加密字串
  if (data.Email) {
    params.push(`Email=${data.Email}`);
  }

  const raw = params.join('&');

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

/* =========================
   SHA256 壓碼函數
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
        
        if (!orderId || !amount) {
          return res.status(400).json({ ok: false, message: "缺少必要欄位" });
        }

        // 強制鎖定正式環境網址
        const action = "https://core.newebpay.com/MPG/mpg_gateway";
        
        const tradeData = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: String(itemDesc),
          LoginType: "0",
          Email: email || ""
        };

        const TradeInfo = createTradeInfo(tradeData);
        const TradeSha = createTradeSha(TradeInfo);

        console.log(`建立訂單: ${orderId}, 金額: ${amount}`);

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
        return res.status(500).json({ ok: false });
      }
    });
  }
);