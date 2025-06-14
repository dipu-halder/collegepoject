import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../store/auth";
import './style/LoginSignup.css';
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

const SignupPage = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  const Navigate = useNavigate();
  const { storeTokenInLS } = useAuth();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user),
        credentials: "include" 
      });

      const res_data = await response.json();

      if (response.ok) {
        toast.success("Sign up successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // Store the token
        storeTokenInLS(res_data.token);

        // Reset form
        setUser({
          username: '',
          email: '',
          phone: '',
          password: '',
        });

        Navigate("/");
      } else {
        toast.error(res_data.extraDetails ? res_data.extraDetails : res_data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      console.log("Signup error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-signup">
        <h2 className="login-title">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="username"
              id="username"
              required
              autoComplete="off"
              placeholder="Enter your username"
              value={user.username}
              onChange={handleInput}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="off"
              placeholder="Enter your email"
              value={user.email}
              onChange={handleInput}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="number"
              name="phone"
              id="phone"
              required
              autoComplete="off"
              placeholder="Enter your phone number"
              value={user.phone}
              onChange={handleInput}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              autoComplete="off"
              placeholder="Enter your password"
              value={user.password}
              onChange={handleInput}
            />
          </div>

          <button type="submit" className="btn-submit">
            Sign Up
          </button>
        </form>

        <p className="login-or">or</p>
        <Link to="/login">
          <button type="button" className="btn-submit">Login</button>
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
