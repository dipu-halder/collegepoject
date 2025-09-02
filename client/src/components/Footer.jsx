import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-title">Tiffin wala</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
             <li><Link to="/rider/map" onClick={() => setIsOpen(false)}>ridermap</Link></li>
             <li><Link to="/riderform" onClick={() => setIsOpen(false)}>riderregister</Link></li>
             <li><Link to="/riderpanel" onClick={() => setIsOpen(false)}>riderpamder</Link></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Menu</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <p>123 Ulubaria, Howrah</p>
            <p>Email: info@tiffinwala.com</p>
            <p>Phone: +91 999 888 7790</p>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Time</h3>
            <p>Mon - Sat: 9:00 AM - 9:00 PM</p>
            <p>Sun: Closed</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Tiffin wala. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
