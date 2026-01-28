const { onRequest } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const CryptoJS = require("crypto-js");

const HASH_KEY = defineString("NEWEBPAY_HASH_KEY");
const HASH_IV = defineString("NEWEBPAY_HASH_IV");
const MERCHANT_ID = defineString("NEWEBPAY_MERCHANT_ID");
const cors = require("cors")({ origin: true });

function createTradeInfo(data) {
  const sorted = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  const raw = `HashKey=${HASH_KEY.value()}&${sorted}&HashIV=${HASH_IV.value()}`;
  const encrypted = CryptoJS.AES.encrypt(
    raw,
    CryptoJS.enc.Utf8.parse(HASH_KEY.value()),
    {
      iv: CryptoJS.enc.Utf8.parse(HASH_IV.value()),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.toString();
}

function createTradeSha(tradeInfo) {
  const sha = CryptoJS.SHA256(
    `HashKey=${HASH_KEY.value()}&${tradeInfo}&HashIV=${HASH_IV.value()}`
  );
  return sha.toString(CryptoJS.enc.Hex).toUpperCase();
}

exports.createNewebPayOrder = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { orderId, amount, itemDesc, email } = req.body;

      const tradeData = {
        MerchantID: MERCHANT_ID.value(),
        RespondType: "JSON",
        TimeStamp: Math.floor(Date.now() / 1000),
        Version: "2.0",
        MerchantOrderNo: orderId,
        Amt: Math.round(Number(amount)),
        ItemDesc: itemDesc,
        Email: email,
        NotifyURL:
          "https://us-central1-woodyfun-official.cloudfunctions.net/newebpayNotify",
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
      console.error(err);
      return res.status(500).send("NewebPay Error");
    }
  });
});


/* =========================
   ② NewebPay Notify（藍新主動通知）
========================= */
exports.newebpayNotify = onRequest(async (req, res) => {
  try {
    console.log("📩 NewebPay Notify 收到");

    const { TradeInfo } = req.body;

    if (!TradeInfo) {
      console.error("❌ 缺少 TradeInfo");
      return res.status(400).send("Missing TradeInfo");
    }

    // 👉 下一步我們會在這裡「解密 TradeInfo」
    console.log("🔐 TradeInfo:", TradeInfo);

    return res.send("SUCCESS");
  } catch (err) {
    console.error("❌ Notify Error:", err);
    return res.status(500).send("ERROR");
  }
});
