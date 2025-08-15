// frontend/src/pages/OrderHistory.jsx
import React, { useEffect, useState } from "react";
import "../Css/OrderHistory.css"; // Ensure correct path

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        console.warn("No token found, cannot fetch orders");
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/order/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setOrders(data);
        } else {
          console.error("Fetch orders failed:", data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, [token]);

  return (
    <div className="order-history-container">
      <h2>My Orders</h2>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div><strong>Order ID:</strong> {order._id}</div>
              <div><strong>Status:</strong> {order.status}</div>
              <div><strong>Total:</strong> ₹{order.total}</div>
            </div>

            <div className="user-info">
              <p><strong>Name:</strong> {order.customerName || "-"}</p>
              <p><strong>Email:</strong> {order.customerEmail || "-"}</p>
              <p><strong>Mobile:</strong> {order.customerPhone || "-"}</p>
              <p><strong>Address:</strong> {order.customerAddress || "-"}</p>
            </div>

            <div className="order-items">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                
                              
                  return (
                    <div
                      key={idx}
                      className="order-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                   
                        <img
                       src={item.img}
                              
                          alt={item.name || "Item"}
                          onError={(e) => (e.target.src = "/placeholder.jpg")}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      
                      <div>
                        <p><strong>{item.name}</strong></p>
                        <p>Qty: {item.quantity}</p>
                        <p>₹{item.price}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No items</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
}
