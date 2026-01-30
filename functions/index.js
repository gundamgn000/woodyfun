const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({ origin: ["https://woodyfun.vercel.app"] });

// 僅定義正式環境 Secrets
const NEWEBPAY_HASH_KEY = defineSecret("NEWEBPAY_HASH_KEY");
const NEWEBPAY_HASH_IV = defineSecret("NEWEBPAY_HASH_IV");
const NEWEBPAY_MERCHANT_ID = defineSecret("NEWEBPAY_MERCHANT_ID");

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
  const plainText = `HashKey=${hashKey}&TradeInfo=${tradeInfoHex}&HashIV=${hashIV}`;
  return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex).toUpperCase();
}

exports.createNewebPayOrder = onRequest(
  {
    region: "us-central1",
    secrets: [NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV, NEWEBPAY_MERCHANT_ID],
  },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        
        // 強制使用正式環境網址
        const action = "https://core.newebpay.com/MPG/mpg_gateway";
        
        // 取得正式環境 Keys
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
          action,
          params: { MerchantID: merchantId, TradeInfo, TradeSha, Version: "2.0" },
        });
      } catch (err) { return res.status(500).json({ ok: false }); }
    });
  }
);