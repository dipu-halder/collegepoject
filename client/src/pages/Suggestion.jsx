// import React from 'react'
// import { Link } from 'react-router-dom';
// import "../Css/Suggestion.css";    
// // -> Import Css Like This
// const Suggestion = () => {
//     //javascript start from here
//   return (
//     <div class="Parent">
//     <div class="s1"><Link to="/DietaryPreference" style={{ textDecoration: 'none', color: 'inherit' }}><h1>Dietry Preference</h1></Link></div>
//     <div class="s1"><h1>Track Your Order</h1></div>
//     <div class="s1"><h1>Our Recomendations</h1></div>
//     {/* <div class="s1"></div> */}
//     </div>
//   )
// }
// export default Suggestion

import React from 'react';
import { Link } from 'react-router-dom';
import "../Css/Suggestion.css";

const Suggestion = () => {
  return (
    <div className="suggestion-container">
      <div  className="suggestion-box"><Link to="/DietaryPreference">
        <img src="" alt="" />
        <h3 className="suggestion-title">Dietry Preference</h3>
        <p className="suggestion-desc">
      
        </p>
     </Link> </div>
      
      <div className="suggestion-box">
        <img src="" alt="" />
        <h3 className="suggestion-title">Track Your Order</h3>
        <p className="suggestion-desc">
  
        </p>
      </div>

      <div className="suggestion-box">
        <img src="" alt="" />
        <h3 className="suggestion-title">Our Recomendations</h3>
        <p className="suggestion-desc">
      
        </p>
      </div>
    </div>
  );
};

export default Suggestion;
