import React, { useState } from 'react';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prev => {
      const next = !prev;
      document.body.classList.toggle('no-scroll', next);
      return next;
    });
  };

  return (
    <header className="navbar">
      <div ><img className="logo" src="/images/Logo-removeb1g.png" alt="tiffin wala" /></div>

      <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
         <button className="close-btn" onClick={toggleMenu}>✕</button>
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/categories" onClick={() => setIsOpen(false)}>Categories</Link>
        <Link to="#" onClick={() => setIsOpen(false)}>Orders</Link>
        <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
        <Link to="#" onClick={() => setIsOpen(false)}>Suggestion</Link>
        <Link to="/admin" onClick={() => setIsOpen(false)}>Admin</Link>
        <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
      </nav>
<Link to="/cart">
      <div className="icons">
        <FaShoppingCart className="icon cart-icon" />
        <button className="icon menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div></Link>
    </header>
  );
};

export default Navbar;
