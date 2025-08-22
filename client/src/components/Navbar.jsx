// // import React, { useState } from 'react';
// // import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
// // import './Navbar.css';
// // import { Link } from 'react-router-dom';

// // const Navbar = () => {
// //   const [isOpen, setIsOpen] = useState(false);

// //   const toggleMenu = () => {
// //     setIsOpen(prev => {
// //       const next = !prev;
// //       document.body.classList.toggle('no-scroll', next);
// //       return next;
// //     });
// //   };

// //   return (
// //     <header className="navbar">
// //       <div ><img className="logo" src="/images/Logo-removeb1g.png" alt="tiffin wala" /></div>

// //       <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
// //          <button className="close-btn" onClick={toggleMenu}>✕</button>
// //         <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
// //         <Link to="/categories" onClick={() => setIsOpen(false)}>Categories</Link>
// //         <Link to="OrderPage" onClick={() => setIsOpen(false)}>Orders</Link>
// //         <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
// //         <Link to="/Suggestion" onClick={() => setIsOpen(false)}>Suggestion</Link>
// //         <Link to="/admin" onClick={() => setIsOpen(false)}>Admin</Link>
// //         <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
// //         <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
// //       </nav>
// // <Link to="/cart">
// //       <div className="icons">
// //         <FaShoppingCart className="icon cart-icon" />
// //         <button className="icon menu-icon" onClick={toggleMenu}>
// //           {isOpen ? <FaTimes /> : <FaBars />}
// //         </button>
// //       </div></Link>
// //     </header>
// //   );
// // };

// // export default Navbar;
//   import React, { useState, useEffect } from "react";
// import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import "./Navbar.css";

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [username, setUsername] = useState("");

//   const toggleMenu = () => {
//     setIsOpen((prev) => {
//       const next = !prev;
//       document.body.classList.toggle("no-scroll", next);
//       return next;
//     });
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setIsLoggedIn(true);

//       fetch("http://localhost:5000/api/auth/user", {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           if (data?.userData?.username) {
//             setUsername(data.userData.username);
//           }
//         })
//         .catch(() => setIsLoggedIn(false));
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//     setDropdownOpen(false);
//     window.location.href = "/login";
//   };

//   return (
//     <header className="navbar">
//       <div>
//         <img
//           className="logo"
//           src="/images/Logo-removeb1g.png"
//           alt="tiffin wala"
//         />
//       </div>

//       <nav className={`nav-links ${isOpen ? "open" : ""}`}>
//         <button className="close-btn" onClick={toggleMenu}>
//           ✕
//         </button>
//         <Link to="/" onClick={() => setIsOpen(false)}>
//           Home
//         </Link>
//         <Link to="/categories" onClick={() => setIsOpen(false)}>
//           Categories
//         </Link>
//         <Link to="/OrderPage" onClick={() => setIsOpen(false)}>
//           Orders
//         </Link>
//         <Link to="/contact" onClick={() => setIsOpen(false)}>
//           Contact Us
//         </Link>
//         <Link to="/Suggestion" onClick={() => setIsOpen(false)}>
//           Suggestion
//         </Link>
//         <Link to="/admin" onClick={() => setIsOpen(false)}>
//           Admin
//         </Link>

//         {/* ✅ Conditional Profile / Signup */}
//         {!isLoggedIn ? (
//           <Link to="/signup" onClick={() => setIsOpen(false)}>
//             Sign Up
//           </Link>
//         ) : (
//           <div
//             className="profile-dropdown"
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//           >
//             <span className="profile-name">{username.length > 10 ? username.substring(0, 10) + "..." : username}</span>
//             {dropdownOpen && (
//               <div className="dropdown-menu">
//                 <Link to="/profile" onClick={() => setIsOpen(false)}>
//                   My Profile
//                 </Link>
//                 <Link to="/order-history" onClick={() => setIsOpen(false)}>
//                  order history
//                 </Link>
//                 <button onClick={handleLogout}>Logout</button>
//               </div>
//             )}
//           </div>
//         )}
//       </nav>

//       <Link to="/cart">
//         <div className="icons">
//           <FaShoppingCart className="icon cart-icon" />
//           <button className="icon menu-icon" onClick={toggleMenu}>
//             {isOpen ? <FaTimes /> : <FaBars />}
//           </button>
//         </div>
//       </Link>
//     </header>
//   );
// };

// export default Navbar;


import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);   // ✅ admin state

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const next = !prev;
      document.body.classList.toggle("no-scroll", next);
      return next;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);

      fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("User Data from API:", data); // 🔍 debug
          if (data?.userData?.username) {
            setUsername(data.userData.username);
            setIsAdmin(data.userData.isAdmin);   // ✅ get admin status
          }
        })
        .catch(() => setIsLoggedIn(false));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    window.location.href = "/login";
  };

  return (
    <header className="navbar">
      <div>
        <img
          className="logo"
          src="/images/Logo-removeb1g.png"
          alt="tiffin wala"
        />
      </div>

      <nav className={`nav-links ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleMenu}>
          ✕
        </button>
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/categories" onClick={() => setIsOpen(false)}>Categories</Link>
        <Link to="/OrderPage" onClick={() => setIsOpen(false)}>Orders</Link>
        <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
        <Link to="/Suggestion" onClick={() => setIsOpen(false)}>Suggestion</Link>

        {/* ✅ Only visible if user is admin */}
        {isAdmin && (
          <Link to="/admin" onClick={() => setIsOpen(false)}>Admin</Link>
        )}

        {!isLoggedIn ? (
          <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
        ) : (
          <div
            className="profile-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="profile-name">
              {username.length > 10 ? username.substring(0, 10) + "..." : username}
            </span>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link>
                <Link to="/order-history" onClick={() => setIsOpen(false)}>Order History</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>

      <Link to="/cart">
        <div className="icons">
          <FaShoppingCart className="icon cart-icon" />
          <button className="icon menu-icon" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;
