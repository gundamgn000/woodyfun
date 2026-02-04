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

const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "SthQEGQfua8lf4dnPcqJXJlKSHRuKV9F";
const HASH_IV = "Pr5t8YU839OZRXaC";

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
        const MerchantOrderNo = `WF${TimeStamp}`;

        // ✅ 1. TradeInfo 內容（不要 encodeURIComponent）
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

        const rawString = qs.stringify(tradeParams);

        // ✅ 2. AES 加密
        const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
        const iv = CryptoJS.enc.Utf8.parse(HASH_IV);

        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.enc.Utf8.parse(rawString),
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

        // ✅ 3. TradeSha（照藍新客服給的格式）
        const shaString = `HashKey=${HASH_KEY}&TradeInfo=${TradeInfo}&HashIV=${HASH_IV}`;
        const TradeSha = CryptoJS.SHA256(shaString)
          .toString(CryptoJS.enc.Hex)
          .toUpperCase();

        // 🔍 Debug log（可留）
        console.log("rawString:", rawString);
        console.log("TradeInfo:", TradeInfo);
        console.log("TradeSha:", TradeSha);

        // ✅ 4. 回傳給前端
        return res.json({
          ok: true,
          action: "https://core.newebpay.com/MPG/mpg_gateway",
          params: {
            MerchantID: MERCHANT_ID, // ⚠️ 必須與 TradeInfo 裡一致
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
