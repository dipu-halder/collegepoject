import React, { useState } from "react";
import { food } from "../data/fooditem";
import "./food.css";
import { IonIcon } from "@ionic/react";
import { cartOutline } from "ionicons/icons";
import { Link } from "react-router-dom";

const Food = () => {
  const [items] = useState(food.slice(0, 6)); // Only first 6 items

  const handleAddToCart = (item) => {
    const newItem = {
      title: item.name,
      description: item.description,
      image: item.img,
      price: parseInt(item.pices),
      quantity: 1,
      tag: item.type,
    };

    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existing = cart.find(product => product.title === newItem.title);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    alert(`${item.name} added to cart!`);
  };

  return (
    <div className="categories-page">
      <p className="section-title">menu</p>

      {/* Food Cards */}
      <div className="cards" id="cardContainer">
        {items.map((item, idx) => (
          <div className="card" key={idx}>
            <img src={item.img} alt={item.name} />
            <div className="card-content">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <div className="delites">
              <p>⭐ {item.rating} | {item.time} min | {item.type}</p>
            </div>
            <div className="bottom-row">
              <strong>₹{item.pices}</strong>
              <button className="add-to-cart" onClick={() => handleAddToCart(item)}>
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* More Food Button */}
      <div className="more-btn-wrapper">
      <Link to="categories"><button  className="more-food-btn"> More Food Items</button></Link>  
      </div>
    </div>
  );
};

export default Food;


