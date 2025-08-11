// import React, { useState, useEffect } from "react";
// import { socket } from "../store/socket";

// export default function TrackOrder() {
//   const [orderId, setOrderId] = useState("");
//   const [status, setStatus] = useState("Not Tracking");

//   const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

//   useEffect(() => {
//     socket.on("orderStatusUpdate", (update) => {
//       setStatus(update.status);
//     });

//     return () => {
//       socket.off("orderStatusUpdate");
//     };
//   }, []);

//   const joinOrderRoom = async () => {
//     if (!orderId) return alert("Enter Order ID");

//     // Fetch current status
//     const res = await fetch(`${backendUrl}/api/orders/${orderId}`);
//     const data = await res.json();
//     setStatus(data.status);

//     // Join live updates
//     socket.emit("joinOrder", orderId);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Track Order</h2>
//       <input
//         type="text"
//         placeholder="Enter Order ID"
//         value={orderId}
//         onChange={(e) => setOrderId(e.target.value)}
//       />
//       <button onClick={joinOrderRoom}>Track</button>
//       <p><b>Current Status:</b> {status}</p>
//     </div>
//   );
// }
// frontend/src/pages/OrderTrackingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Css/Trackingorder.css'; // Import the CSS file

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Fetch order error:', err);
        toast.error('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Order Tracking</h2>
      {order ? (
        <div>
          <h3>Order ID: {order._id}</h3>
          <h4>Status: {order.status}</h4>
          <h4>User Info:</h4>
          <p>Name: {order.user.name}</p>
          <p>Email: {order.user.email}</p>
          <p>Mobile: {order.user.mobile}</p>
          <p>Address: {order.user.address}</p>
          <h4>Items:</h4>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <p>{item.title} x {item.quantity} - ₹{item.price * item.quantity}</p>
            </div>
          ))}
          <h4 className="total">Total: ₹{order.total}</h4>
        </div>
      ) : (
        <p className="not-found">Order not found.</p>
      )}
      <ToastContainer />
    </div>
  );
}
