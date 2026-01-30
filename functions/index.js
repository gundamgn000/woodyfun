const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

// 設定允許的來源
const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"],
});

/* =========================
   NewebPay Secrets (v2 寫法)
========================= */
const NEWEBPAY_HASH_KEY = defineSecret("NEWEBPAY_HASH_KEY");
const NEWEBPAY_HASH_IV = defineSecret("NEWEBPAY_HASH_IV");
const NEWEBPAY_MERCHANT_ID = defineSecret("NEWEBPAY_MERCHANT_ID");

/* =========================
   AES + SHA 工具 (修正 MPG03009 關鍵)
========================= */
function createTradeInfo(data, hashKey, hashIV) {
  // 1. 依照官方建議順序建立參數陣列
  const params = [
    `MerchantID=${data.MerchantID}`,
    `RespondType=${data.RespondType}`,
    `TimeStamp=${data.TimeStamp}`,
    `Version=${data.Version}`,
    `MerchantOrderNo=${data.MerchantOrderNo}`,
    `Amt=${data.Amt}`,
    `ItemDesc=${encodeURIComponent(data.ItemDesc)}`,
    `LoginType=${data.LoginType}`,
  ];

  // 🔑 關鍵：如果資料中有 Email，必須加入加密原始字串中
  if (data.Email) {
    params.push(`Email=${data.Email}`);
  }

  const raw = params.join('&');

  const encrypted = CryptoJS.AES.encrypt(
    raw,
    CryptoJS.enc.Utf8.parse(hashKey),
    {
      iv: CryptoJS.enc.Utf8.parse(hashIV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function createTradeSha(tradeInfoHex, hashKey, hashIV) {
  // 格式：HashKey=xxx&TradeInfo=xxx&HashIV=xxx
  const plainText = `HashKey=${hashKey}&TradeInfo=${tradeInfoHex}&HashIV=${hashIV}`;
  return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex).toUpperCase();
}

/* =========================
   建立 NewebPay 訂單 API
========================= */
exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    secrets: [
      NEWEBPAY_HASH_KEY,
      NEWEBPAY_HASH_IV,
      NEWEBPAY_MERCHANT_ID,
    ],
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        
        if (!orderId || !amount || !itemDesc) {
          return res.status(400).json({ ok: false, message: "缺少必要欄位" });
        }

        const hashKey = NEWEBPAY_HASH_KEY.value();
        const hashIV = NEWEBPAY_HASH_IV.value();
        const merchantId = NEWEBPAY_MERCHANT_ID.value();

        const tradeData = {
          MerchantID: merchantId,
          RespondType: "JSON",
          TimeStamp: String(Math.floor(Date.now() / 1000)),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Math.round(Number(amount))),
          ItemDesc: String(itemDesc),
          LoginType: "0",
          Email: email || "" 
        };

        const TradeInfo = createTradeInfo(tradeData, hashKey, hashIV);
        const TradeSha = createTradeSha(TradeInfo, hashKey, hashIV);

        return res.json({
          ok: true,
          action: "https://core.newebpay.com/MPG/mpg_gateway", // 正式環境網址
          params: {
            MerchantID: merchantId,
            TradeInfo: TradeInfo,
            TradeSha: TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error("❌ createNewebPayOrder error:", err);
        return res.status(500).json({ ok: false });
      }
    });
  }
);