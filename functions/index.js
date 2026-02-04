/* eslint-disable */
const { onRequest } = require("firebase-functions/v2/https");
const corsLib = require("cors");
const CryptoJS = require("crypto-js");
const qs = require("querystring");

// ✅【一定要有】藍新專用 urlencode（RFC3986 + 空白轉 +）
function newebpayUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) =>
      "%" + c.charCodeAt(0).toString(16).toUpperCase()
    );
}

// === 藍新正式商店參數（確認與後台一致） ===
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV  = "Pr5t8YU839OZRXaC";

// CORS
const cors = corsLib({
  origin: [
    "https://woodyfun.vercel.app",
    "https://www.woodyfun.tw",
    "https://woodyfun.tw",
    "http://localhost:5173",
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      try {
        if (req.method !== "POST") {
          return res.status(405).json({ ok: false, error: "Method Not Allowed" });
        }

        const { amount, orderId } = req.body || {};
        const Amt = Math.round(Number(amount));

        if (!Number.isFinite(Amt) || Amt <= 0) {
          return res.status(400).json({ ok: false, error: "Invalid amount" });
        }

        const TimeStamp = Math.floor(Date.now() / 1000);
        const MerchantOrderNo = orderId
          ? String(orderId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
          : `WF${TimeStamp}`;

        // ✅ 內層 TradeInfo 參數（MerchantID 一定要在裡面）
        const tradeParams = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp,
          Version: "2.0",
          MerchantOrderNo,
          Amt,
          ItemDesc: "WoodyFunOrder",
          LoginType: 0,
        };

        // 1️⃣ QueryString
        const rawString = qs.stringify(tradeParams);

        // 2️⃣ 藍新 urlencode
        const encoded = newebpayUrlEncode(rawString);

        // 3️⃣ AES-256-CBC
        const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
        const iv  = CryptoJS.enc.Utf8.parse(HASH_IV);

        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.enc.Utf8.parse(encoded),
          key,
          {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        );

        const TradeInfo = encrypted.ciphertext
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();

        // 4️⃣ 正確 TradeSha
        const shaRaw = `HashKey=${HASH_KEY}&TradeInfo=${TradeInfo}&HashIV=${HASH_IV}`;
        const TradeSha = CryptoJS.SHA256(shaRaw)
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();


        // Debug（現在可以留）
        console.log("rawString:", rawString);
        console.log("encoded:", encoded);
        console.log("TradeInfo:", TradeInfo);
        console.log("TradeSha:", TradeSha);

        return res.json({
          ok: true,
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: MERCHANT_ID, // ⚠️ 外層一定要一樣
            TradeInfo,
            TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error("[NewebPay Error]", err);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);
