const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({ origin: ["https://woodyfun.vercel.app"] });

// Secrets 定義
const NEWEBPAY_HASH_KEY = defineSecret("NEWEBPAY_HASH_KEY");
const NEWEBPAY_HASH_IV = defineSecret("NEWEBPAY_HASH_IV");
const NEWEBPAY_MERCHANT_ID = defineSecret("NEWEBPAY_MERCHANT_ID");
const TEST_HASH_KEY = defineSecret("TEST_HASH_KEY");
const TEST_HASH_IV = defineSecret("TEST_HASH_IV");
const TEST_MERCHANT_ID = defineSecret("TEST_MERCHANT_ID");

function createTradeInfo(data, hashKey, hashIV) {
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
  if (data.Email) params.push(`Email=${data.Email}`);
  const raw = params.join('&');
  const encrypted = CryptoJS.AES.encrypt(raw, CryptoJS.enc.Utf8.parse(hashKey), {
    iv: CryptoJS.enc.Utf8.parse(hashIV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function createTradeSha(tradeInfoHex, hashKey, hashIV) {
  return CryptoJS.SHA256(`HashKey=${hashKey}&TradeInfo=${tradeInfoHex}&HashIV=${hashIV}`).toString(CryptoJS.enc.Hex).toUpperCase();
}

exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    secrets: [NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV, NEWEBPAY_MERCHANT_ID, TEST_HASH_KEY, TEST_HASH_IV, TEST_MERCHANT_ID],
  },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const { orderId, amount, itemDesc, email, isTest } = req.body || {};
        const action = isTest ? "https://ccore.newebpay.com/MPG/mpg_gateway" : "https://core.newebpay.com/MPG/mpg_gateway";
        const hashKey = isTest ? TEST_HASH_KEY.value() : NEWEBPAY_HASH_KEY.value();
        const hashIV = isTest ? TEST_HASH_IV.value() : NEWEBPAY_HASH_IV.value();
        const merchantId = isTest ? TEST_MERCHANT_ID.value() : NEWEBPAY_MERCHANT_ID.value();

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

        return res.json({ ok: true, action, params: { MerchantID: merchantId, TradeInfo, TradeSha, Version: "2.0" } });
      } catch (err) { return res.status(500).json({ ok: false }); }
    });
  }
);