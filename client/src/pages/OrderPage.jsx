
// src/pages/OrderPage.jsx
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Css/OrderPage.css";
import { useNavigate } from "react-router-dom";
import MapPickerGoogle from "../components/MapPickerGoogle";
import { useAuth } from "../store/auth";

export default function OrderPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", address: "" });
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const navigate = useNavigate();
  const { token, authorizationToken } = useAuth();
  const authHeader = authorizationToken || (token ? `Bearer ${token}` : null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const normalized = stored.map((i) => ({
        name: i.name || i.title || "Unknown",
        price: Number(i.price ?? i.pices ?? 0) || 0,
        quantity: Number(i.quantity ?? i.qty ?? 1) || 1,
        img: i.img || i.image || i.imagePath || "/placeholder.jpg",
      }));
      setCartItems(normalized);
      setTotal(normalized.reduce((s, it) => s + it.price * it.quantity, 0));
    } catch (err) {
      console.warn("Failed to load cart:", err);
      setCartItems([]);
      setTotal(0);
    }
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const isValidMobile = (m) => /^[6-9]\d{9}$/.test(String(m).trim());
  const isValidEmail = (em) => !em || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(em).trim());

  const normalizeForBackend = (items) => items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, img: i.img }));

  const safeJson = async (res) => {
    try { return await res.json(); } catch { return null; }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!authHeader) { toast.info("Please login to place order."); navigate("/login"); return; }
    if (!cartItems.length) { toast.error("Cart is empty"); return; }
    if (!form.name.trim() || !form.address.trim()) { toast.error("Fill name and address"); return; }
    if (!isValidMobile(form.mobile)) { toast.error("Enter valid 10-digit mobile"); return; }
    if (!isValidEmail(form.email)) { toast.error("Enter valid email or leave blank"); return; }
    if (!position || position.lat == null) { toast.error("Pick delivery location on map"); return; }

    const itemsToSend = normalizeForBackend(cartItems);
    const computedTotal = itemsToSend.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: String(form.mobile).trim(),
          customerAddress: form.address.trim(),
          customerEmail: form.email?.trim() || "",
          items: itemsToSend,
          total: computedTotal,
          customerLat: Number(position.lat),
          customerLng: Number(position.lng),
        }),
      });
      const data = await safeJson(res);
      if (res.ok) {
        toast.success("Order placed");
        localStorage.removeItem("cartItems");
        setCartItems([]);
        setTotal(0);
        if (data && data._id) {
          try { localStorage.setItem("latestOrder", JSON.stringify({ orderId: data._id, status: data.status })); } catch {}
          navigate(`/track/${data._id}`);
        } else navigate("/order-history");
      } else {
        toast.error(data?.message || "Order failed");
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Order failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="order-page" style={{ display: "flex", gap: 20, padding: 16 }}>
      <form onSubmit={placeOrder} className="order-form" style={{ flex: 1, maxWidth: 520 }}>
        <h2>Place Order</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
        <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email (optional)" />
        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 600 }}>Delivery Location (pick on map)</label>
          <div style={{ marginTop: 8 }}>
            <MapPickerGoogle position={position} setPosition={setPosition} />
            <div style={{ marginTop: 8 }}>
              {position ? (
                <div>Selected: <strong>{Number(position.lat).toFixed(5)}, {Number(position.lng).toFixed(5)}</strong></div>
              ) : (<div style={{ color: "#b00" }}>No location selected — required for live tracking</div>)}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>{loading ? "Placing..." : "Place Order"}</button>
      </form>

      <div className="cart-summary" style={{ width: 360 }}>
        <h3>Your Cart</h3>
        {cartItems.length === 0 ? <p>No items</p> : cartItems.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <img src={item.img} alt={item.name} style={{ width: 70, height: 70, objectFit: "cover" }} onError={(e)=> e.target.src="/placeholder.jpg"} />
            <div>
              <div>{item.name}</div>
              <div>× {item.quantity}</div>
              <div>₹{item.price * item.quantity}</div>
            </div>
          </div>
        ))}
        <hr />
        <div><strong>Total: ₹{total}</strong></div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
