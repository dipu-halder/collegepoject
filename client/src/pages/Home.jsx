
// export default HomePage;


import React from 'react';
import "../Css/Style1.css";
import Footer from '../components/Footer';
import  Food  from '../components/food';
import { Link } from 'react-router-dom';

export default function Home() {
  return (<>
    <div className="home">
     



      <main className="hero">
        <div className="hero-content">
          <h2>Get Delicious Food <span>Delivered Fast!</span></h2>
          <p>Discover amazing local dishes and enjoy lightningfast delivery.</p>
        <Link to="categories">   <button className="order-btn">Order Now</button> </Link>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092" alt="Food delivery" />
        </div>
      </main>
    <Food />
    </div>
   <Footer /></>
  );
}
