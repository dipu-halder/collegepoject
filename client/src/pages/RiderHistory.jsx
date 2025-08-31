import { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const RiderHistory = () => {
  const { authorizationToken } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const authHeader = (() => {
    if (!authorizationToken) return "";
    return authorizationToken.startsWith("Bearer ")
      ? authorizationToken
      : `Bearer ${authorizationToken}`;
  })();

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const url = `${API}/api/rider/orders/history?days=${days}`;
        const res = await fetch(url, { headers: { Authorization: authHeader } });
        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(text || `Failed to load history (${res.status})`);
        }
        const data = await res.json().catch(() => []);
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchHistory error:", err);
        toast.error("Failed to load history");
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [API, authHeader, days]);

  return (
    <div style={{ padding: 12 }}>
      <h1>Delivered History</h1>
      <p><Link to="/rider">← Back to Rider Panel</Link></p>

      <div style={{ margin: "12px 0" }}>
        <label>
          Show last &nbsp;
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          &nbsp; of deliveries
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No delivered orders in the selected period.</p>
      ) : (
        <div>
          {orders.map((o) => (
            <div key={o._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
              <div><strong>Order:</strong> {o._id}</div>
              <div><strong>Delivered At:</strong> {new Date(o.updatedAt).toLocaleString()}</div>
              <div>
                <strong>Customer:</strong> {o.customerName || o.user?.name} ({o.customerPhone || o.user?.mobile})
              </div>
              <div><strong>Address:</strong> {o.customerAddress || o.user?.address}</div>
              <div style={{ marginTop: 6 }}>
                Items:
                <ul>
                  {Array.isArray(o.items) && o.items.map((it, i) => (
                    <li key={i}>{it.name} × {it.quantity}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 8 }}>
                <Link to={`/rider/orders/${o._id}`}>View Detail</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderHistory;
