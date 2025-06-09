import { useState } from "react";
import { TfiAlignJustify } from "react-icons/tfi";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div id="navbar">
      <div className="nav1">
        {/* Mobile Icon */}
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          <TfiAlignJustify />
        </div>

        {/* Logo */}
        <div className="logo-container"></div>

        {/* Menu */}
        <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Menu</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li id="openSignupLink">
            <a href="#">Signup</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
