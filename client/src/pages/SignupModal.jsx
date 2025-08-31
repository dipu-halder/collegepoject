import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import './style/LoginSignup.css';
import { toast } from "react-toastify";

const SignupPage = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();
  const { storeTokenInLS } = useAuth();

  // Input change handler
  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
          credentials: "include",
        }
      );

      const res_data = await response.json();

      if (response.ok) {
        toast.success("Sign up successful 🎉", { theme: "colored" });
        storeTokenInLS(res_data.token);

        // reset form
        setUser({ username: "", email: "", phone: "", password: "" });

        navigate("/");
      } else {
        toast.error(res_data.extraDetails || res_data.message, {
          theme: "colored",
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Something went wrong. Please try again.", {
        theme: "colored",
      });
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
              placeholder="Enter your name"
              value={user.username}
              onChange={handleInput}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={handleInput}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={user.phone}
              onChange={handleInput}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={handleInput}
              required
              autoComplete="off"
            />
          </div>

          <button type="submit" className="btn-submit">
            Sign Up
          </button>
        </form>

        <p className="login-or">Already have an account?👇</p>
        <Link to="/login">
          <button type="button" className="btn-submit">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
