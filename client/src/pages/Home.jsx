import React, { useState } from "react";
import "../Css/Style1.css"; // Import your CSS file here (same as Style1.css)
import { NavLink } from "react-router-dom";
import { useAuth } from "../store/auth";
import { BsCart3 } from "react-icons/bs";

const HomePage = () => {
  const [showContact, setShowContact] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { isLoggedin } = useAuth();
  const handleBackdropClick = (e, closeFn) => {
    if (e.target.className.includes("modal")) {
      closeFn();
    }
  };

  return (
    <>
      <nav id="navbar">
        <div className="nav1">
          <div className="logo-container"></div>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="categories">Categories</NavLink></li>
            <li><NavLink to="/order">Orders</NavLink></li>
            <li ><NavLink to="/contact">Contact Us</NavLink></li>
            <li><NavLink to="#">Suggestion</NavLink></li>
            <li><NavLink to="/admin">admin</NavLink></li>
            {isLoggedin ? <li><NavLink to="/logout" >Logout</NavLink></li> :<><li><NavLink to="/signup" >Sign Up</NavLink></li></>}
            
            
            <li><NavLink to="cart"><BsCart3 /></NavLink></li>
          </ul>
        </div>

        <div className="section">
          <h1>WELCOME TO OUR WEBSITE</h1>
          <div className="left">
            Order Delicious <br /> Food Item <button>Continue</button>
          </div>
          <div className="right">
            <h2>Select Your City</h2>
            <select name="city" id="city">
              <option value="Kolkata">Kolkata</option>
              <option value="Burdwan">Burdwan</option>
              <option value="Uluberia">Uluberia</option>
              <option value="Budge Budge">Budge Budge</option>
            </select>
            <button id="Btn">Find Now</button>
          </div>
        </div>
      </nav>

      <section id="SectionBar">
        <div className="searchbar-container">
          <label htmlFor="searchBar">
            <div className="icon-holder">
              <ion-icon name="search-outline"></ion-icon>
            </div>
          </label>
          <input type="text" id="searchBar" placeholder="  Search Food Items" />
        </div>

        <div className="carousel">
          <div className="carousel-images">
            <img src="/Css/images/Burger.jpg" className="carousel-slide active" />
            <img src="/Css/images/Pizza.jpg" className="carousel-slide" />
            <img src="/Css/images/Pulao.jpg" className="carousel-slide" />
            <img src="/Css/images/Momos.png" className="carousel-slide" />
            <img src="/Css/images/dosa.webp" className="carousel-slide" />
          </div>

          <button className="prev">&#10094;</button>
          <button className="next">&#10095;</button>

          <div className="dots">
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} className={`dot ${i === 0 ? "active" : ""}`}></span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContact && (
        <div className="modal" onClick={(e) => handleBackdropClick(e, () => setShowContact(false))}>
          <div className="modal-content animate-zoom" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowContact(false)}>&times;</span>
            <h2>Contact</h2>
            <form action="https://api.web3forms.com/submit" method="POST">
              <input type="hidden" name="access_key" value="4aa0e9e1-6b7e-4d5a-a848-75a2cde20f03" />
              <label>Username</label>
              <input type="text" name="name" placeholder="Enter your name" required />
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter your email" required />
              <label>Number</label>
              <input type="number" name="number" placeholder="Enter your number" required />
              <label>Message</label>
              <textarea name="message" placeholder="Your message" required></textarea>
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignup && (
        <div className="modal-signup" onClick={(e) => handleBackdropClick(e, () => setShowSignup(false))}>
          <div className="modal-content-signup" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowSignup(false)}>&times;</span>
            <h2>Create account</h2>
            <form action="https://api.web3forms.com/submit" method="POST">
              <input type="hidden" name="access_key" value="4aa0e9e1-6b7e-4d5a-a848-75a2cde20f03" />
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email address" required />
              <input type="tel" placeholder="Phone Number" required pattern="[0-9]{10}" title="Enter a 10-digit phone number" />
              <input type="password" placeholder="Password" required />
              <input type="password" placeholder="Confirm Password" required />
              <button type="submit" id="sub-btn">Sign Up</button>
            </form>
            <div className="toggle-link">
              already have an account? <a onClick={() => { setShowSignup(false); setShowLogin(true); }}>Login</a>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-signup" onClick={(e) => handleBackdropClick(e, () => setShowLogin(false))}>
          <div className="modal-content-signup" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowLogin(false)}>&times;</span>
            <h2>Login</h2>
            <form>
              <input type="text" placeholder="Username or Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" id="sub-btn">Login</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
