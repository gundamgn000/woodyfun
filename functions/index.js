const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");
const qs = require("querystring");

const cors = corsLib({
  origin: [
    "https://woodyfun.vercel.app",
    "https://www.woodyfun.tw",
  ],
});

// === 藍新正式商店參數 ===
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV  = "Pr5t8YU839OZRXaC";

exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      try {
        const { amount } = req.body || {};

        const Amt = Math.round(Number(amount));
        if (!Number.isFinite(Amt) || Amt <= 0) {
          return res.status(400).json({ ok: false, error: "Invalid amount" });
        }

        const TimeStamp = Math.floor(Date.now() / 1000);

        const tradeParams = {
          MerchantID: MERCHANT_ID,
          RespondType: "JSON",
          TimeStamp,
          Version: "2.0",
          MerchantOrderNo: `WF${TimeStamp}`, // ✔ 每筆唯一
          Amt,
          ItemDesc: "WoodyFunOrder",
          LoginType: 0,
        };

        // 1️⃣ QueryString（不可自行排序）
        const rawString = qs.stringify(tradeParams);

        // 2️⃣ URL Encode（藍新規格）
        const encoded = encodeURIComponent(rawString);

        // 3️⃣ AES-256-CBC 加密
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

        // 4️⃣ TradeInfo（Hex + 大寫）
        const TradeInfo = encrypted.ciphertext
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();

        // 5️⃣ TradeSha（⚠️ 關鍵修正點）
        // ❌ 不能加 TradeInfo=
        const shaRaw = `HashKey=${HASH_KEY}&${TradeInfo}&HashIV=${HASH_IV}`;

        const TradeSha = CryptoJS.SHA256(shaRaw)
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();

        // 🔍 Debug（可留，正式上線後可移除）
        console.log("rawString:", rawString);
        console.log("encoded:", encoded);
        console.log("TradeInfo:", TradeInfo);
        console.log("shaRaw:", shaRaw);
        console.log("TradeSha:", TradeSha);

        return res.json({
          ok: true,
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: MERCHANT_ID,
            TradeInfo,
            TradeSha,
            Version: "2.0",
          },
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: err.message });
      }
    });
  }
);
