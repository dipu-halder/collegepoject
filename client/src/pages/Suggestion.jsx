

import React from 'react';
import { Link } from 'react-router-dom';
import "../Css/Suggestion.css";

const Suggestion = () => {
  return (
    <div className="suggestion-container">
      <div  className="suggestion-box"><Link to="/DietaryPreference">
        <img src="/Dietry.jpg" alt="" class="Fixed-img"/>
        <h3 className="suggestion-title">Dietry Preference</h3>
        <p className="suggestion-desc">
          Choose meals tailored to your health goals.From low-calorie to protein-rich, we’ve got you covered.
        </p>
     </Link> </div>
      
      <div className="suggestion-box">
        <img src="/track.jpg" alt="" class="Fixed-img" />
        <h3 className="suggestion-title">Track Your Order</h3>
        <p className="suggestion-desc">
            Know exactly where your food is in real time.Stay updated from kitchen to doorstep.
        </p>
      </div>

      <div className="suggestion-box">
        <img src="/Our.jpg" alt="" class="Fixed-img"/>
        <h3 className="suggestion-title">Our Recomendations</h3>
        <p className="suggestion-desc">
          Handpicked dishes just for you.Based on your taste and previous orders.
        </p>
      </div>
    </div>
  );
};

export default Suggestion;
