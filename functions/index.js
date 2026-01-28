const { onRequest } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const CryptoJS = require("crypto-js");

// 🔧 CORS：正式環境收斂 origin
const cors = require("cors")({
  origin: ["https://woodyfun.vercel.app"],
});

/* =========================
   NewebPay Secrets
========================= */
const HASH_KEY = defineString("NEWEBPAY_HASH_KEY");
const HASH_IV = defineString("NEWEBPAY_HASH_IV");
const MERCHANT_ID = defineString("NEWEBPAY_MERCHANT_ID");

/* =========================
   NewebPay 加密工具
========================= */
function createTradeInfo(data) {
  const sorted = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  const raw = `HashKey=${HASH_KEY.value()}&${sorted}&HashIV=${HASH_IV.value()}`;

  return CryptoJS.AES.encrypt(
    raw,
    CryptoJS.enc.Utf8.parse(HASH_KEY.value()),
    {
      iv: CryptoJS.enc.Utf8.parse(HASH_IV.value()),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString();
}

function createTradeSha(tradeInfo) {
  return CryptoJS.SHA256(
    `HashKey=${HASH_KEY.value()}&${tradeInfo}&HashIV=${HASH_IV.value()}`
  )
    .toString(CryptoJS.enc.Hex)
    .toUpperCase();
}

/* =========================
   ① 建立 NewebPay 訂單
========================= */
exports.createNewebPayOrder = onRequest((req, res) => {
  cors(req, res, async () => {

    // 🔧 OPTIONS 預檢
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { orderId, amount, itemDesc, email } = req.body;

      // 🔧 debug log
      console.log("🚀 createNewebPayOrder", {
        orderId,
        amount,
        itemDesc,
      });

      if (!orderId || !amount || !itemDesc) {
        return res.status(400).json({
          ok: false,
          message: "缺少必要參數",
        });
      }

      const tradeData = {
        MerchantID: MERCHANT_ID.value(),
        RespondType: "JSON",
        TimeStamp: Math.floor(Date.now() / 1000),
        Version: "2.0",
        MerchantOrderNo: orderId,
        Amt: Math.round(Number(amount)),
        ItemDesc: itemDesc,
        Email: email || "",
        NotifyURL:
          "https://us-central1-woodyfun-official.cloudfunctions.net/newebpayNotify",
        ReturnURL: "https://woodyfun.vercel.app/checkout/success",
      };

      const TradeInfo = createTradeInfo(tradeData);
      const TradeSha = createTradeSha(TradeInfo);

      return res.json({
        ok: true,
        gateway: "newebpay",
        action: "https://ccore.newebpay.com/MPG/mpg_gateway",
        params: {
          MerchantID: MERCHANT_ID.value(),
          TradeInfo,
          TradeSha,
          Version: "2.0",
        },
      });
    } catch (err) {
      console.error("❌ createNewebPayOrder error:", err);
      return res.status(500).json({
        ok: false,
        message: "NewebPay 建單失敗",
      });
    }
  });
});

/* =========================
   ② NewebPay Notify（後端回呼）
========================= */
exports.newebpayNotify = onRequest(async (req, res) => {
  try {
    // 🔧 保險用
    res.set("Access-Control-Allow-Origin", "*");

    console.log("📩 NewebPay Notify 收到");
    console.log("🔐 TradeInfo:", req.body?.TradeInfo);

    return res.send("SUCCESS");
  } catch (err) {
    console.error("❌ Notify Error:", err);
    return res.status(500).send("ERROR");
  }
});
