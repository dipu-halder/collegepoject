
// src/pages/TrackOrder.jsx
import React from "react";
import { useParams } from "react-router-dom";
import OrderTrackingMap from "../components/OrderTrackingMap";
import { useAuth } from "../store/auth";

export default function TrackOrder() {
  const { orderId } = useParams();
  const { authorizationToken, token } = useAuth();

  // Pass either the "Bearer <token>" string or null - createSocket handles normalization
  const socketToken = authorizationToken || (token ? `Bearer ${token}` : null);

  if (!socketToken) {
    return (
      <div style={{ padding: 20 }}>
        <h2>⚠️ Not Authorized</h2>
        <p>Please login to track your order (only the user who placed this order can view live tracking).</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h1>Track Order</h1>
      <p>Order ID: <strong>{orderId || "—"}</strong></p>
      <OrderTrackingMap orderId={orderId} token={socketToken} />
    </div>
  );
}
