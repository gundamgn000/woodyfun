import React from "react";
import "./OrderStatusTracker.css";

// 線上付款（信用卡 / ATM）
const ONLINE_STEPS = [
  { key: "pending", label: "待付款" },
  { key: "paid", label: "已付款" },
  { key: "shipped", label: "已出貨" },
  { key: "completed", label: "已完成" }
];

// 貨到付款（COD）
const COD_STEPS = [
  { key: "pending", label: "訂單成立" },
  { key: "shipped", label: "已出貨" },
  { key: "completed", label: "已完成" }
];

export default function OrderStatusTracker({ status, isCOD = false }) {
  const steps = isCOD ? COD_STEPS : ONLINE_STEPS;

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="order-tracker">
      {steps.map((step, index) => (
        <div className="tracker-step" key={step.key}>
          <div
            className={`step-circle ${
              index <= currentIndex ? "active" : ""
            }`}
          />
          <span
            className={`step-label ${
              index <= currentIndex ? "active" : ""
            }`}
          >
            {step.label}
          </span>

          {index < steps.length - 1 && (
            <div
              className={`step-line ${
                index < currentIndex ? "active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
