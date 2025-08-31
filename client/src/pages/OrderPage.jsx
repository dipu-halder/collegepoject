// import React, { useEffect, useState } from 'react';
// import '../Css/OrderPage.css';
// import { ToastContainer, toast } from 'react-toastify';

// const OrderPage = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     mobile: '',
//     email: '',
//     address: '',
//     city: '',
//     state: '',
//   });

//   const [cartItems, setCartItems] = useState([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [totalQuantity, setTotalQuantity] = useState(0);

//   useEffect(() => {
//     const data = JSON.parse(localStorage.getItem("cartItems")) || [];
//     setCartItems(data);
//     calculateTotal(data);
//   }, []);

//   const calculateTotal = (data) => {
//     let total = 0;
//     let quantity = 0;
//     data.forEach(item => {
//       total += item.price * item.quantity;
//       quantity += item.quantity;
//     });
//     setTotalAmount(total);
//     setTotalQuantity(quantity);
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const isFormValid = Object.values(formData).every((v) => v.trim() !== '');
//     if (!isFormValid) return alert('Please fill all fields');
//     if (cartItems.length === 0) return alert('Cart is empty!');

//     const orderData = {
//       userInfo: {
//         name: formData.name,
//         email: formData.email,
//         address: formData.address,
//       },
//       cartItems,
//       totalAmount,
//     };
// // Place Order
// const placeOrder = async () => {
//   try {
//     const res = await fetch("https://your-backend.onrender.com/orders", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         cartItems,
//         totalAmount,
//         userInfo,
//       }),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       localStorage.setItem("orderId", data.orderId);
//       window.location.href = "/track-order";
//     } else {
//       alert(data.message || "Something went wrong");
//     }
//   } catch (error) {
//     console.error("Order Error:", error);
//   }
// };

//   };

//   return (
//     <div className="order-wrapper">
//       <div className="order-container">
//         <h2>Place Your Order</h2>
//         <form onSubmit={handleSubmit} className="order-form">
//           <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
//           <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} />
//           <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
//           <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleChange}></textarea>
//           <select name="city" value={formData.city} onChange={handleChange}>
//             <option value="">Select City</option>
//             <option value="Mumbai">Mumbai</option>
//             <option value="Delhi">Delhi</option>
//             <option value="Kolkata">Kolkata</option>
//           </select>
//           <select name="state" value={formData.state} onChange={handleChange}>
//             <option value="">Select State</option>
//             <option value="West Bengal">West Bengal</option>
//             <option value="Delhi">Delhi</option>
//           </select>
//           <button type="submit">Place Order</button>
//         </form>
//       </div>

//       <div className="cart-summary">
//         <h3>Your Cart</h3>
//         {cartItems.length === 0 ? (
//           <p>No items in cart.</p>
//         ) : (
//           <>
//             {cartItems.map((item, index) => (
//               <div className="cart-item" key={index}>
//                 <img src={item.image || "/fallback.jpg"} alt={item.title} className="cart-img" />
//                 <div className="cart-item-details">
//                   <div className="cart-item-title">{item.title} × {item.quantity}</div>
//                   <div className="cart-item-price">₹{item.price * item.quantity}</div>
//                 </div>
//               </div>
//             ))}
//             <hr />
//             <div className="cart-total">
//               <strong>Total: ₹{totalAmount}</strong><br />
//               <small>Items: {totalQuantity}</small>
//             </div>
//           </>
//         )}
//       </div>

//       <ToastContainer />
//     </div>
//   );
// };
// // frontend/src/pages/OrderPage.jsx
// import React, { useEffect, useState } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import '../Css/OrderPage.css';
// import { useNavigate } from "react-router-dom";

// export default function OrderPage() {
//   const [form, setForm] = useState({ name: '', email: '', mobile: '', address: '' });
//   const [cartItems, setCartItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   // Load cart from localStorage
//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
//     setCartItems(storedCart);
//     let sum = 0;
//     storedCart.forEach(item => sum += (Number(item.price) || Number(item.pices) || 0) * (Number(item.quantity) || 1));
//     setTotal(sum);
//   }, []);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   // Normalize cart data before sending to backend
//   const normalizeForBackend = (items) => items.map(i => ({
//     name: i.name || i.title || "Unknown",
//     price: Number(i.price ?? i.pices ?? 0),
//     quantity: Number(i.quantity ?? i.qty ?? 1),
//     img: i.img || i.image || i.imagePath || ""
//   }));

//   const placeOrder = async (e) => {
//     e.preventDefault();

//     if (cartItems.length === 0) {
//       toast.error("Your cart is empty!");
//       return;
//     }

//     try {
//       const itemsToSend = normalizeForBackend(cartItems);
//       const computedTotal = itemsToSend.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { "Authorization": `Bearer ${token}` }) // Pass JWT to backend
//         },
//         body: JSON.stringify({
//           customerName: form.name,
//           customerPhone: form.mobile,
//           customerAddress: form.address,
//           customerEmail: form.email,
//           items: itemsToSend,
//           total: computedTotal
//         })
//       });

//       const data = await res.json();
//       console.log("Order response:", res.status, data);

//       if (res.ok) {
//         toast.success("Order placed successfully!");
//         localStorage.removeItem("cartItems");

//         // Navigate to order details or history
//         if (data._id) {
//           navigate(`/track/${data._id}`);
//         } else {
//           navigate("/order-history");
//         }
//       } else {
//         toast.error(data.message || "Order failed");
//       }
//     } catch (err) {
//       console.error("Order creation failed:", err);
//       toast.error("Order creation failed");
//     }
//   };


//   return (
//     <div className='order-page'>
//       <form onSubmit={placeOrder} className="order-form">
//         <h2>Place Order</h2>
//         <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
//         <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" required />
//         <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
//         <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
//         <button type="submit">Place Order</button>
//       </form>

//       <div className="cart-summary">
//         <h3>Your Cart</h3>
//         {cartItems.length === 0 ? (
//           <p>No items</p>
//         ) : (
//           cartItems.map((item, index) => (
//             <div className="cart-itemed" key={index}>
             
//                <img src={item.image || "/fallback.jpg"} alt={item.title} className="cart-img" 
              
               
//                 onError={e => e.target.src = "/placeholder.jpg"}
//               />
//               <div className="cart-item-details">
//                 <div className="item-name">{item.name || item.title}</div>
//                 <div className="item-quantity">x {item.quantity}</div>
//                 <div className="item-price">
//                   ₹{(Number(item.price) || Number(item.pices) || 0) * (Number(item.quantity) || 1)}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//         <hr />
//         <div className="cart-total"><strong>Total: ₹{total}</strong></div>
//       </div>

//       <ToastContainer />
//     </div>
//   );
// }
// src/pages/OrderPage.jsx
// src/pages/OrderPage.jsx
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Css/OrderPage.css";
import { useNavigate } from "react-router-dom";
import MapPickerGoogle from "../components/MapPickerGoogle"; // ✅ USE GOOGLE

export default function OrderPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", address: "" });
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null); // { lat, lng }
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Load cart from localStorage and compute total
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const normalized = storedCart.map((i) => ({
      name: i.name || i.title || "Unknown",
      price: Number(i.price ?? i.pices ?? 0) || 0,
      quantity: Number(i.quantity ?? i.qty ?? 1) || 1,
      img: i.img || i.image || i.imagePath || "/placeholder.jpg",
    }));
    setCartItems(normalized);
    setTotal(normalized.reduce((s, it) => s + it.price * it.quantity, 0));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isValidMobile = (m) => /^[6-9]\d{9}$/.test(m);
  const isValidEmail = (em) => !em || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const normalizeForBackend = (items) =>
    items.map((i) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      img: i.img,
    }));

  const placeOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Please fill name and address.");
      return;
    }

    if (!isValidMobile(form.mobile)) {
      toast.error("Enter valid 10-digit mobile number.");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Enter a valid email or leave blank.");
      return;
    }

    // Require picking a location for accurate tracking
    if (!position) {
      toast.error("Please pick your delivery location on the map — required for live tracking.");
      return;
    }

    if (!token) {
      toast.info("Please login to place an order.");
      return navigate("/login");
    }

    const itemsToSend = normalizeForBackend(cartItems);
    const computedTotal = itemsToSend.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.mobile,
          customerAddress: form.address,
          customerEmail: form.email,
          items: itemsToSend,
          total: computedTotal,
          status: "Confirmed",
          orderTime: new Date().toISOString(),
          // include lat/lng for map-based tracking
          customerLat: position.lat,
          customerLng: position.lng,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Order placed successfully!");
        localStorage.removeItem("cartItems");
        setCartItems([]);
        setTotal(0);

        if (data && data._id) {
          localStorage.setItem(
            "latestOrder",
            JSON.stringify({
              orderId: data._id,
              status: data.status || "Confirmed",
              createdAt: data.createdAt || new Date().toISOString(),
            })
          );
          navigate(`/track/${data._id}`);
        } else {
          navigate("/order-history");
        }
      } else {
        toast.error(data.message || "Order failed");
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error("Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page" style={{ display: "flex", gap: 20, padding: 16 }}>
      <form onSubmit={placeOrder} className="order-form" style={{ flex: 1, maxWidth: 520 }}>
        <h2>Place Order</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
        <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email (optional)" />
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address (house/flat/landmark)"
          required
        />

        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 600 }}>Delivery Location (pick on map)</label>
          <div style={{ marginTop: 8 }}>
            <MapPickerGoogle position={position} setPosition={setPosition} />
            <div style={{ marginTop: 8 }}>
              {position ? (
                <div>
                  Selected: <strong>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</strong>
                </div>
              ) : (
                <div style={{ color: "#b00" }}>No location selected — required for live tracking</div>
              )}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>

      <div className="cart-summary" style={{ width: 360 }}>
        <h3>Your Cart</h3>
        {cartItems.length === 0 ? (
          <p>No items</p>
        ) : (
          cartItems.map((item, index) => (
            <div className="cart-itemed" key={index} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <img
                src={item.img}
                alt={item.name}
                className="cart-img"
                style={{ width: 70, height: 70, objectFit: "cover" }}
                onError={(e) => (e.target.src = "/placeholder.jpg")}
              />
              <div className="cart-item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-quantity">x {item.quantity}</div>
                <div className="item-price">₹{item.price * item.quantity}</div>
              </div>
            </div>
          ))
        )}
        <hr />
        <div className="cart-total">
          <strong>Total: ₹{total}</strong>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
