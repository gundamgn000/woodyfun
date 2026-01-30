const { onRequest } = require("firebase-functions/v2/https");
const CryptoJS = require("crypto-js");
const corsLib = require("cors");

const cors = corsLib({ origin: ["https://woodyfun.vercel.app"] });

// ⚠️【除錯模式】直接將金鑰寫入，排除環境變數讀取問題
const MERCHANT_ID = "MS1812982970";
const HASH_KEY = "y4VruhR6gUmMkTskrjhKfQzwMXjFFekC";
const HASH_IV = "Ps8veSSs1stEdf8C";

// 交易資料加密函數
function createTradeInfo(data) {
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
  
  // 只有當 Email 存在且不為空時才加入
  if (data.Email) {
    params.push(`Email=${data.Email}`);
  }

  const raw = params.join('&');
  
  const encrypted = CryptoJS.AES.encrypt(raw, CryptoJS.enc.Utf8.parse(HASH_KEY), {
    iv: CryptoJS.enc.Utf8.parse(HASH_IV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

// 雜湊檢查碼函數
function createTradeSha(tradeInfoHex) {
  const plainText = `HashKey=${HASH_KEY}&TradeInfo=${tradeInfoHex}&HashIV=${HASH_IV}`;
  return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex).toUpperCase();
}

exports.createNewebPayOrder = onRequest(
  { region: "us-central1" },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const { orderId, amount, itemDesc, email } = req.body || {};
        
        // 強制使用正式環境網址
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

        return res.json({
          ok: true,
          action,
          params: { MerchantID: MERCHANT_ID, TradeInfo, TradeSha, Version: "2.0" },
        });
      } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ ok: false });
      }
    });
  }
);