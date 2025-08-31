// src/components/RiderForm.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";

const RiderForm = () => {
  const { user, authorizationToken } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({ name: "", phone: "", vehicleType: "", vehicleRegNo: "" });
  const [existingRider, setExistingRider] = useState(null);

  const fetchRider = async () => {
    if (!authorizationToken) return;
    try {
      const res = await fetch(`${API}/api/rider/me`, { headers: { Authorization: authorizationToken } });
      if (res.ok) setExistingRider(await res.json());
      else setExistingRider(null);
    } catch (err) { console.error(err); setExistingRider(null); }
  };

  useEffect(() => { if (authorizationToken) fetchRider(); }, [authorizationToken]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorizationToken) { toast.error("Please login"); return; }
    try {
      const res = await fetch(`${API}/api/rider/register`, { method: "POST", headers: { "Content-Type":"application/json", Authorization: authorizationToken }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (res.ok) { toast.success("Submitted"); setFormData({ name: "", phone: "", vehicleType: "", vehicleRegNo: "" }); fetchRider(); }
      else toast.error(data.message || "Failed");
    } catch (err) { console.error(err); toast.error("Server error"); }
  };

  if (!authorizationToken) return <p>❌ Please login first</p>;
  if (existingRider?.isApproved) return <p className="text-green-600">✅ You are approved as a Rider.</p>;
  if (existingRider && !existingRider.isApproved) return <p className="text-yellow-600">⏳ Your application is pending.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Rider Registration</h2>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
      <input name="vehicleType" placeholder="Vehicle Type" value={formData.vehicleType} onChange={handleChange} required />
      <input name="vehicleRegNo" placeholder="Vehicle Reg No" value={formData.vehicleRegNo} onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
  );
};

export default RiderForm;
