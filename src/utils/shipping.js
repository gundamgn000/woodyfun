// src/utils/shipping.js

/**
 * 運費規則：
 * - 開幕免運到 2026/02/28 23:59:59 (台灣時間)
 * - 活動結束後：
 *    - 信用卡（宅配到府）= 180
 *    - 其他（超商取貨付款）= 65
 */
export const OPENING_END = new Date("2026-02-28T23:59:59+08:00");

export const calculateShipping = (paymentMethod, now = new Date()) => {
  if (now <= OPENING_END) return 0;
  return paymentMethod === "信用卡" ? 180 : 65;
};

/**
 * 本地測試用：可用 localStorage 覆寫現在時間
 * localStorage.setItem("WF_MOCK_NOW", "2026-03-01T00:01:00+08:00")
 */
export const getNow = () => {
  const mock = localStorage.getItem("WF_MOCK_NOW");
  return mock ? new Date(mock) : new Date();
};