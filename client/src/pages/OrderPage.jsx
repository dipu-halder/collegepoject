import React, { useEffect, useState } from 'react';
import '../Css/OrderPage.css';
import { ToastContainer, toast } from 'react-toastify';

const OrderPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
  });

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(data);
    calculateTotal(data);
  }, []);

  const calculateTotal = (data) => {
    let total = 0;
    let quantity = 0;
    data.forEach(item => {
      total += item.price * item.quantity;
      quantity += item.quantity;
    });
    setTotalAmount(total);
    setTotalQuantity(quantity);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isFormValid = Object.values(formData).every((v) => v.trim() !== '');
    if (!isFormValid) return alert('Please fill all fields');
    if (cartItems.length === 0) return alert('Cart is empty!');

    const orderData = {
      userInfo: {
        name: formData.name,
        email: formData.email,
        address: formData.address,
      },
      cartItems,
      totalAmount,
    };

    fetch(`https://tiffin-wala.onrender.com/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Order failed");
        return res.json();
      })
      .then((data) => {
        toast.success("Order placed successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        localStorage.removeItem("cartItems");
        setCartItems([]);
        setFormData({
          name: '',
          mobile: '',
          email: '',
          address: '',
          city: '',
          state: '',
        });
      })
      .catch((error) => {
        console.error("Order failed:", error);
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <div className="order-wrapper">
      <div className="order-container">
        <h2>Place Your Order</h2>
        <form onSubmit={handleSubmit} className="order-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleChange}></textarea>
          <select name="city" value={formData.city} onChange={handleChange}>
            <option value="">Select City</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Kolkata">Kolkata</option>
          </select>
          <select name="state" value={formData.state} onChange={handleChange}>
            <option value="">Select State</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Delhi">Delhi</option>
          </select>
          <button type="submit">Place Order</button>
        </form>
      </div>

      <div className="cart-summary">
        <h3>Your Cart</h3>
        {cartItems.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <div className="cart-item" key={index}>
                <img src={item.image || "/fallback.jpg"} alt={item.title} className="cart-img" />
                <div className="cart-item-details">
                  <div className="cart-item-title">{item.title} × {item.quantity}</div>
                  <div className="cart-item-price">₹{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
            <hr />
            <div className="cart-total">
              <strong>Total: ₹{totalAmount}</strong><br />
              <small>Items: {totalQuantity}</small>
            </div>
          </>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default OrderPage;
