import React, { useEffect, useState } from "react";
import "../Css/cart.css";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCart(data);
    updateSummary(data);
  }, []);

  const updateSummary = (data) => {
    let total = 0;
    let quantity = 0;
    data.forEach(item => {
      total += item.price * item.quantity;
      quantity += item.quantity;
    });
    setTotalAmount(total);
    setTotalQuantity(quantity);
  };

  const handleIncrease = (index) => {
    const updated = [...cart];
    updated[index].quantity += 1;
    updateCart(updated);
  };

  const handleDecrease = (index) => {
    const updated = [...cart];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      updateCart(updated);
    }
  };

  const handleDelete = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    updateCart(updated);
  };

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    updateSummary(updatedCart);
  };

  return (
    <div className="container">
      <div className="main-wrapper">
        
        {/* LEFT SECTION */}
        <div className="left-section">
          <div className="top-bar">
            <p id="itemCount">{totalQuantity} item(s) you have selected</p>
            <a href="/Categories"><p className="explore">Explore More</p></a>
          </div>

          <div id="cartSection">
            {cart.map((item, index) => {
              const imageSrc = item.image || item.img || "/placeholder.jpg";
              return (
                <div className="carditem" key={index}>
                  <div className="card-info">
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="food-img"
                    />
                    <div>
                      <h1 className="food-title">{item.title}</h1>
                      <p className="food-desc">{item.description}</p>
                      <span className="tag">{item.tag || "veg"}</span>
                    </div>
                  </div>
                  <div className="card-price">
                    <p className="price">₹{item.price}</p>
                    <div className="qty-controls">
                      <button className="delete-item" onClick={() => handleDelete(index)}>🗑️</button>
                      <button className="decrease" onClick={() => handleDecrease(index)}>-</button>
                      <p>{item.quantity}</p>
                      <button className="increase" onClick={() => handleIncrease(index)}>+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="right-section">
          <div className="summary-box">
            <h2 className="summary-title">Price Details</h2>
            <div className="divider"></div>

            <div className="summary-item">
              <p>Total</p>
              <p className="bold" id="mep">₹{totalAmount}</p>
            </div>
            <div className="summary-item">
              <p>Delivery Fee</p>
              <p className="green">Free</p>
            </div>

            <div className="divider"></div>

            <div className="summary-item space-between">
              <p>Total Amount</p>
              <span id="totalItems">Item - {totalQuantity}</span>
              <p className="total-price" id="totalPrice">₹{totalAmount}</p>
            </div>

            <div className="order-button">
              <button onClick={() => navigate("/OrderPage")}>Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

