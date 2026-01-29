const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");
const qs = require("querystring");

const cors = corsLib({
  origin: ["https://woodyfun.vercel.app"],
});

/* =========================
   NewebPay Secrets（v2 正確寫法）
========================= */
const NEWEBPAY_HASH_KEY = defineSecret("NEWEBPAY_HASH_KEY");
const NEWEBPAY_HASH_IV = defineSecret("NEWEBPAY_HASH_IV");
const NEWEBPAY_MERCHANT_ID = defineSecret("NEWEBPAY_MERCHANT_ID");

/* =========================
   AES + SHA 工具
========================= */
function createTradeInfo(data, hashKey, hashIV) {
  const queryString = qs.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(
    queryString,
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
  const plainText = `HashKey=${hashKey}&TradeInfo=${tradeInfoHex}&HashIV=${hashIV}`;
  return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex).toUpperCase();
}

/* =========================
   建立 NewebPay 訂單
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
      if (req.method !== "POST")
        return res.status(405).send("Method Not Allowed");

      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        if (!orderId || !amount || !itemDesc) {
          return res.status(400).json({ ok: false, message: "缺少必要欄位" });
        }

        const Amt = Math.round(Number(amount));
        if (!Number.isFinite(Amt) || Amt <= 0) {
          return res.status(400).json({ ok: false, message: "amount 不合法" });
        }

        const TimeStamp = Math.floor(Date.now() / 1000);

        const hashKey = NEWEBPAY_HASH_KEY.value();
        const hashIV = NEWEBPAY_HASH_IV.value();
        const merchantId = NEWEBPAY_MERCHANT_ID.value();

        const action = "https://core.newebpay.com/MPG/mpg_gateway";

        const tradeData = {
          MerchantID: merchantId,
          RespondType: "JSON",
          TimeStamp: String(TimeStamp),
          Version: "2.0",
          MerchantOrderNo: String(orderId),
          Amt: String(Amt),
          ItemDesc: String(itemDesc),
          Email: email || "",
          LoginType: "0",
        };

        const TradeInfo = createTradeInfo(tradeData, hashKey, hashIV);
        const TradeSha = createTradeSha(TradeInfo, hashKey, hashIV);

        return res.json({
          ok: true,
          action,
          params: {
            MerchantID: merchantId,
            TradeInfo,
            TradeSha,
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
