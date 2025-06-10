import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import './style/LoginSignup.css';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const LoginModal = () => {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const res_data = await response.json();

      if (response.ok) {
        storeTokenInLS(res_data.token);
        toast.success('Login successful', { theme: 'colored' });
        setUser({ email: '', password: '' });
        navigate('/');
      } else {
        toast.error(res_data.extraDetails || res_data.message, { theme: 'colored' });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
     <div className="login-wrapper"> <img 
        src="/delivery.png" // Place image inside /public
        alt="Delivery Illustration"
        
        className="login-image ,"
      />

      <div className="login-login">
        <h2 className="login-title"> Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={handleInput}
              required
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
            />
          </div>

          <button type="submit" className="btn-submit">login</button>
        </form>
        <p className="login-or">or</p>
        <Link to="/signup"> <button type="submit" className="btn-submit">Sign Up</button></Link> 
      </div>
      </div>
    </div>
  );
};

export default LoginModal;
