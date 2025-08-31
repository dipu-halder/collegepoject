// src/components/RiderPanel.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";
import { createSocket } from "../utils/socket";
import apiFetch from "../utils/apiFetch";
import { Link } from "react-router-dom";

const RiderPanel = () => {
  const { authorizationToken } = useAuth();
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // raw token (no "Bearer ")
  const rawToken = (() => {
    if (!authorizationToken) return localStorage.getItem("token") || "";
    return authorizationToken.startsWith("Bearer ") ? authorizationToken.split(" ")[1] : authorizationToken;
  })();

  const fetchRiderProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/api/rider/me", { method: "GET" });
      setRider(data);
    } catch (err) {
      console.error("fetchRiderProfile error:", err);
      setRider(null);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/rider/orders", { method: "GET" });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchOrders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!rawToken) return;
    fetchRiderProfile();
    fetchOrders();
  }, [rawToken, fetchRiderProfile, fetchOrders]);

  useEffect(() => {
    if (!rawToken || !rider) return;
    const socket = createSocket(rawToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      const rid = rider._id || rider.id;
      if (rid) socket.emit("joinRider", rid);
    });

    const events = [
      "order.offer",
      "assigned.order",
      "order.assigned",
      "order.unassigned",
      "order.status.updated",
      "order.delivered",
    ];

    events.forEach((ev) => socket.on(ev, fetchOrders));

    socket.on("connect_error", (err) => console.warn("Rider socket connect_error:", err?.message || err));
    socket.on("disconnect", (reason) => console.log("Rider socket disconnected:", reason));

    return () => {
      try {
        events.forEach((ev) => socket.off(ev, fetchOrders));
        socket.disconnect();
      } catch (e) {}
    };
  }, [rawToken, rider, fetchOrders]);

  const apiCall = async (path, method = "POST", body = null) => {
    try {
      return await apiFetch(path, { method, body });
    } catch (err) {
      return { error: err };
    }
  };

  const accept = async (orderId) => {
    const res = await apiCall(`/api/rider/orders/${orderId}/accept`, "POST");
    if (!res?.error) {
      toast.success("Order accepted");
      fetchOrders();
    } else {
      toast.error(res.error?.message || "Failed to accept");
    }
  };

  const reject = async (orderId) => {
    const res = await apiCall(`/api/rider/orders/${orderId}/reject`, "POST");
    if (!res?.error) {
      toast.info("Offer rejected");
      fetchOrders();
    } else {
      toast.error(res.error?.message || "Failed to reject");
    }
  };

  const markDelivered = async (orderId) => {
    if (!window.confirm("Mark this order as Delivered?")) return;
    const res = await apiCall(`/api/rider/orders/${orderId}/mark-delivered`, "PATCH");
    if (!res?.error) {
      toast.success("Marked delivered");
      fetchOrders();
    } else {
      toast.error(res.error?.message || "Failed to mark delivered");
    }
  };

  if (!rawToken) return <p>❌ Please login first</p>;
  if (loading) return <p>⏳ Loading rider panel...</p>;
  if (!rider) return <p>🚫 You are not registered as a rider yet. Please register.</p>;
  if (!rider.isApproved) return <p>⏳ Application pending</p>;

  const offers = orders.filter(
    (o) =>
      Array.isArray(o.pendingOffers) &&
      o.pendingOffers.some((p) => String(p._id || p) === String(rider._id || rider.id))
  );

  const assigned = orders.filter(
    (o) =>
      o.assignedRider &&
      String(o.assignedRider._id || o.assignedRider) === String(rider._id || rider.id) &&
      String((o.status || "").toLowerCase()) !== "delivered"
  );

  const completed = orders.filter(
    (o) =>
      o.assignedRider &&
      String(o.assignedRider._id || o.assignedRider) === String(rider._id || rider.id) &&
      String((o.status || "").toLowerCase()) === "delivered"
  );

  return (
    <div style={{ padding: 12 }}>
      <h2>Rider Panel</h2>
      <p><strong>{rider.name}</strong> — {rider.vehicle?.type} {rider.vehicle?.regNo}</p>
      <p><Link to="/rider/history">View delivery history</Link></p>

      <section style={{ marginTop: 12 }}>
        <h3>Offers ({offers.length})</h3>
        {offers.length === 0 ? <p>No offers</p> : offers.map((o) => (
          <div key={o._id} style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}>
            <div><strong>Order</strong> {o._id}</div>
            <div>{o.customerName} — {o.customerPhone}</div>
            <div style={{ marginTop: 6 }}>{o.items?.map((it, i) => <div key={i}>{it.name} × {it.quantity}</div>)}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => accept(o._id)}>Accept</button>
              <button onClick={() => reject(o._id)}>Reject</button>
              <Link to={`/rider/orders/${o._id}`}>View Detail</Link>
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Assigned ({assigned.length})</h3>
        {assigned.length === 0 ? <p>No assigned orders</p> : assigned.map((o) => (
          <div key={o._id} style={{ border: "1px solid #eee", margin: 8, padding: 8 }}>
            <div><strong>Order</strong> {o._id}</div>
            <div>{o.customerName} — {o.customerPhone}</div>
            <div>{o.customerAddress}</div>
            <div style={{ marginTop: 6 }}>{o.items?.map((it, i) => <div key={i}>{it.name} × {it.quantity}</div>)}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Link to={`/rider/orders/${o._id}`}>View Detail</Link>
              <button onClick={() => markDelivered(o._id)}>Mark Delivered</button>
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>✅ Completed ({completed.length})</h3>
        {completed.length === 0 ? <p>No completed orders</p> : completed.map((o) => (
          <div key={o._id} style={{ border: "1px solid #cfc", margin: 8, padding: 8, background: "#f6fff6" }}>
            <div><strong>Order</strong> {o._id}</div>
            <div>{o.customerName} — {o.customerPhone}</div>
            <div>{o.customerAddress}</div>
            <div style={{ marginTop: 6 }}>{o.items?.map((it, i) => <div key={i}>{it.name} × {it.quantity}</div>)}</div>
            <div style={{ marginTop: 6 }}><em>Delivered</em></div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default RiderPanel;
