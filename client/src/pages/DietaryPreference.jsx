import React, { useState } from 'react';
import "../Css/Suggestion.css";
import "../Css/Categories.css";
import { food } from "../data/fooditem";

const DietaryPreference = () => {
  const [items] = useState(food);
  const [cart, setCart] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const glutenFreeItems = items.filter(item => item.diet === "GlutenFree");
  const pescatarianItems = items.filter(item => item.diet === "Pescaterian");

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddToCart = (item) => {
    const newItem = {
      title: item.name,
      description: item.description,
      image: item.img,
      price: parseInt(item.pices),
      quantity: 1,
      tag: item.type,
    };
    setCart([...cart, newItem]);
    alert(`${item.name} added to cart`);
  };

  return (
    <>
      <div className="parent-2 p">
        <h1>Gluten Free</h1>
        <div className="Wrapper-box1 y">
          {glutenFreeItems.map((item) => (
            <div
              className={`Box1 x ${expandedId === item.id ? "expanded" : ""}`}
              key={item.id}
              onClick={() => handleToggle(item.id)}
            >
              <img src={item.img} alt={item.name} className="food-img" />
              <h3>{item.name}</h3>
              {expandedId === item.id && (
                <div className="details">
                  <p>{item.description}</p>
                  <p>Price: ₹{item.pices}</p>
                  <p>Rating: ⭐{item.rating} | ⏱ {item.time} min</p>
                  <button className="add-to-cart" onClick={(e) => {
                    e.stopPropagation(); // prevent collapse
                    handleAddToCart(item);
                  }}>
                    Add to cart
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="parent-3 p">
        <h1>Pescatarian</h1>
        <div className="Wrapper-box1 y">
          {pescatarianItems.map((item) => (
            <div
              className={`Box1 x ${expandedId === item.id ? "expanded" : ""}`}
              key={item.id}
              onClick={() => handleToggle(item.id)}
            >
              <img src={item.img} alt={item.name} className="food-img" />
              <h3>{item.name}</h3>
              {expandedId === item.id && (
                <div className="details">
                  <p>{item.description}</p>
                  <p>Price: ₹{item.pices}</p>
                      <button className="add-to-cart" onClick={(e) => {
                    e.stopPropagation(); // prevent collapse
                    handleAddToCart(item);
                  }}>
                    Add to cart
                  </button>
                </div>

              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DietaryPreference;
