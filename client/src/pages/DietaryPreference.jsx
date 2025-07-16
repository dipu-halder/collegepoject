import React from 'react'
import "../Css/Suggestion.css";    
// -> Import Css Like This

import { food, manu } from "../data/fooditem";
import "../Css/Categories.css";
// import { IonIcon } from "@ionic/react";
// import {  cartOutline } from "ionicons/icons";
// import { Link } from "react-router-dom";

const DietaryPreference = () => {
  
  const glutenFreeItems = food.filter(item => item.type === "veg");
  const Pescatarian = food.filter(item => item.type ==="non-veg")
  return (
    <>
<div className="parent-2 p">
        <h1>Gluten Free</h1>
       <div className="Wrapper-box1 y">
        {glutenFreeItems.map((item) => (
          <div className="Box1 x" key={item.id}>
            <img src={item.img} alt={item.name} className="food-img" />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>Price: ₹{item.pices}</p>
            <p>Rating: ⭐{item.rating} | ⏱ {item.time} min</p>
          </div>
        ))}
      </div>
      </div>


   <div class="parent-3 p">
   <h1>Pescatarian</h1>
          <div className="Wrapper-box1 y">
        {glutenFreeItems.map((item) => (
          <div className="Box1 x" key={item.id}>
            <img src={item.img} alt={item.name} className="food-img" />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>Price: ₹{item.pices}</p>
            <p>Rating: ⭐{item.rating} | ⏱ {item.time} min</p>
          </div>
        ))}
      </div>
   </div>


   <div class="parent-4 p">
   <h1>Pescatarian</h1>
   <div className="Wrapper-box3 y">
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   <div class="Box3 x"></div>
   </div>
   </div>

   <div class="parent-5 p">
   <h1>Pescatarian</h1>
   <div className="Wrapper-box4 y">
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   <div class="Box4 x"></div>
   </div>
   </div>


   <div class="parent-6 p">
   <h1>Pescatarian</h1>
   <div className="Wrapper-box5 y">
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   <div class="Box5 x"></div>
   </div>
   </div>
  </>
  );
}
export default DietaryPreference