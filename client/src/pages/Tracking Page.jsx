import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Css/Trackingorder.css';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order/${orderId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
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
  }, [orderId, token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="tracking-container">
      <h2>Order Tracking</h2>
      {order ? (
        <div className="tracking-card">
          <div className="tracking-header">
            <h3>Order ID: {order._id}</h3>
            <p>Status: <strong>{order.status}</strong></p>
          </div>

          <div className="user-info">
            <h4>Customer Info:</h4>
            <p><strong>Name:</strong> {order.customerName || "-"}</p>
            <p><strong>Email:</strong> {order.customerEmail || "-"}</p>
            <p><strong>Mobile:</strong> {order.customerPhone || "-"}</p>
            <p><strong>Address:</strong> {order.customerAddress || "-"}</p>
          </div>

          <div className="order-items">
            <h4>Items:</h4>
            {Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.img}
                    alt={item.name}
                    onError={(e) => (e.target.src = "/placeholder.jpg")}
                  />
                  <div>
                    <p><strong>{item.name}</strong></p>
                    <p>Qty: {item.quantity}</p>
                    <p>₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No items found</p>
            )}
          </div>

          <h4 className="total">Total: ₹{order.total}</h4>

          {/* Tracking progress */}
          <div className="tracking-status">
            <p>Tracking Progress:</p>
            <ul className="progressbar">
              {["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]
                .filter(step => stepOrderIndex(step) <= stepOrderIndex(order.status))
                .map((step, idx) => (
                  <li
                    key={idx}
                    className={step === order.status ? "active" : "completed"}
                  >
                    {step}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="not-found">Order not found.</p>
      )}
      <ToastContainer />
    </div>
  );
}

function stepOrderIndex(step) {
  const orderSteps = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];
  return orderSteps.indexOf(step);
}
