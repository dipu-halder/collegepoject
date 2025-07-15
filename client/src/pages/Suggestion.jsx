import React from 'react'
import { Link } from 'react-router-dom';
import "../Css/Suggestion.css";    
// -> Import Css Like This
const Suggestion = () => {
    //javascript start from here
  return (
    <div class="Parent">
    <div class="s1"><Link to="/DietaryPreference" style={{ textDecoration: 'none', color: 'inherit' }}><h1>Dietry Preference</h1></Link></div>
    <div class="s1"><h1>Track Your Order</h1></div>
    <div class="s1"><h1>Our Recomendations</h1></div>
    {/* <div class="s1"></div> */}
    </div>
  )
}
export default Suggestion