import React from "react";

const steps = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function OrderTimeline({ currentStatus = "Pending" }) {
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="order-timeline" style={{ marginTop: 12 }}>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {steps.map((s, idx) => {
          const state = idx < currentIndex ? "done" : idx === currentIndex ? "active" : "upcoming";
          const bg = state === "done" ? "#2ecc71" : state === "active" ? "#f39c12" : "#ecf0f1";
          const color = state === "upcoming" ? "#333" : "#fff";
          return (
            <li key={s} style={{ padding: "8px 12px", borderRadius: 20, background: bg, color }}>
              {s}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
