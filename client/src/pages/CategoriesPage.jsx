import React, { useState } from "react";
import { food, manu } from "../data/fooditem";
import "../Css/Categories.css";
import { IonIcon } from "@ionic/react";
import { searchOutline, cartOutline } from "ionicons/icons";
import { Link } from "react-router-dom";

const Categories = () => {
  const [items, setItems] = useState(food);
  const [filterTitle, setFilterTitle] = useState("All Items");

  const handleFilter = (type) => {
    if (type === "veg") {
      setItems(food.filter(item => item.type.toLowerCase() === "veg"));
      setFilterTitle("Showing: Veg Items");
    } else if (type === "non-veg") {
      setItems(food.filter(item => item.type.toLowerCase() === "non-veg"));
      setFilterTitle("Showing: Non-Veg Items");
    } else if (type === "sweet") {
      setItems(food.filter(item => item.type.toLowerCase() === "sweet"));
      setFilterTitle("Showing: Sweet Items");
    } else if (type === "low-high") {
      setItems([...food].sort((a, b) => a.pices - b.pices));
      setFilterTitle("Showing: Cost Low to High");
    } else if (type === "high-low") {
      setItems([...food].sort((a, b) => b.pices - a.pices));
      setFilterTitle("Showing: Cost High to Low");
    } else {
      setItems(food);
      setFilterTitle("All Items");
    }
  };

  const handleSearch = () => {
    const val = document.getElementById("search").value.toLowerCase();
    const filtered = food.filter(item =>
      item.name.toLowerCase().includes(val)
    );
    setItems(filtered);
    setFilterTitle(`Search Result for "${val}"`);
  };

  const handleMenuClick = (itemName) => {
    const filtered = food.filter(item =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );
    setItems(filtered);
    setFilterTitle(`Showing: ${itemName}`);
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
      {/* Search Input */}
      <div id="input-search">
        <input type="search" id="search" placeholder="Search For Your Food Item" />
        <button id="searchBtn" onClick={handleSearch}>
          <IonIcon icon={searchOutline} />
        </button>
      </div>

      {/* Menu Scroll */}
      <div className="menu-scroll">
        {manu.map((m, idx) => (
          <div className="menu-card" key={idx} onClick={() => handleMenuClick(m.name)}>
            <img src={m.img} alt="food" />
            <p>{m.name}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters">
        <label onClick={() => handleFilter("veg")}>Veg</label>
        <label onClick={() => handleFilter("non-veg")}>Non-Veg</label>
        <label onClick={() => handleFilter("sweet")}>Sweet</label>
        <label onClick={() => handleFilter("low-high")}>Cost: Low to High</label>
        <label onClick={() => handleFilter("high-low")}>Cost: High to Low</label>
        <label onClick={() => handleFilter("clear")} style={{ color: "red" }}>Clear Filters</label>
      </div>

      <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
        {filterTitle}
      </p>

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
              <button className="add-to-cart" onClick={() => handleAddToCart(item)}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>

<div className="">
  <Link to="/cart"><button className="cart-float-btn">

    <IonIcon icon={cartOutline} className="text-xl" />
  </button>
</Link>
</div>
    </div>
  );
};

export default Categories;
