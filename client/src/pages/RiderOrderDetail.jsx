import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";

export default function RiderOrderDetail() {
  const { id } = useParams();
  const { authorizationToken } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeader = (() => {
    if (!authorizationToken) return "";
    return authorizationToken.startsWith("Bearer ")
      ? authorizationToken
      : `Bearer ${authorizationToken}`;
  })();

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // IMPORTANT: backend single-order route is /api/order/:id (see backend routes)
        const res = await fetch(`${API}/api/order/${id}`, {
          headers: { Authorization: authHeader },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(text || `Failed to load order (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) setOrder(data);
      } catch (err) {
        console.error("fetchOrder error:", err);
        toast.error("Could not load order");
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!authHeader) {
      toast.info("Please login to view order");
      navigate("/login");
      return;
    }

    fetchOrder();
    return () => { cancelled = true; };
  }, [API, id, authHeader, navigate]);

  if (loading) return <p>Loading order...</p>;
  if (!order) return (
    <div style={{ padding: 12 }}>
      <p>Order not found</p>
      <p><Link to="/rider">← Back to Rider Panel</Link></p>
    </div>
  );

  return (
    <div style={{ padding: 12 }}>
      <h2>Order Detail</h2>
      <p><strong>ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Customer:</strong> {order.customerName} ({order.customerPhone})</p>
      <p><strong>Address:</strong> {order.customerAddress}</p>

      <h3>Items</h3>
      {order.items?.map((it, i) => (
        <div key={i}>
          {it.name} × {it.quantity} — ₹{it.price}
        </div>
      ))}

      <p style={{ marginTop: 12 }}><strong>Total:</strong> ₹{order.total}</p>

      <div style={{ marginTop: 12 }}>
        <Link to="/rider">← Back to Rider Panel</Link>
      </div>
    </div>
  );
}
