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



// frontend/src/pages/OrderPage.jsx
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import '../Css/OrderPage.css';

export default function OrderPage() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', address: '' });
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(data);
    const totalAmount = data.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    setTotal(totalAmount);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.address || cartItems.length === 0) {
      toast.error('Please fill required fields and ensure cart is not empty');
      return;
    }

    const payload = {
      userInfo: { name: form.name, email: form.email, mobile: form.mobile, address: form.address },
      cartItems,
      totalAmount: total,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');

      const orderId = data.orderId;
      localStorage.setItem('orderId', orderId);
      toast.success('Order placed! ID: ' + orderId);
      window.location.href = `/track/${orderId}`;
    } catch (err) {
      console.error('Place order error:', err);
      toast.error('Order failed. Try again.');
    }
  };

  return (
    <div className='order-page'>
      <form onSubmit={placeOrder} className="order-form">
        <h2>Place Order</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
        <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <button type="submit">Place Order</button>
      </form>
<div className="cart-summary">
  <h3>Your Cart</h3>
  {cartItems.length === 0 ? (
    <p>No items</p>
  ) : (
    cartItems.map((item, index) => (
      <div className="cart-itemed" key={index}>
        <img src={item.image} alt={item.title} className="cart-item-image" />
        <div className="cart-item-details">
          <div className="item-name">{item.title}</div>
          <div className="item-quantity">x {item.quantity}</div>
          <div className="item-price">
            ₹{(item.price || 0) * (item.quantity || 1)}
          </div>
        </div>
      </div>
    ))
  )}


  <hr />
  <div className="cart-total"><strong>Total: ₹{total}</strong></div>
</div>


      <ToastContainer />
    </div>
  );
}
