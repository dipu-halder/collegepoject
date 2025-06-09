


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from "../store/auth";

import { ToastContainer, toast } from 'react-toastify';

const AdminUpdate = () => {
  const [data, setData] = useState({
    username: "",
    email: "",
    phone: "",
  });


  const params = useParams();
  const { authorizationToken } = useAuth();

  const getSingleUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${params.id}`, {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      });
      const result = await response.json();
      console.log("Single user data: ", result);
      setData(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleUserData();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/update/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {   
        toast.success("Updated successfully", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",});

          
      } else {
        toast.error("Not updated successfully", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",});
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="Registration-form">
        <h1 className="main-heading mb-3">Update User</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              required
              autoComplete="off"
              placeholder="Enter your username"
              value={data.username}
              onChange={handleInput}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="off"
              placeholder="Enter your email"
              value={data.email}
              onChange={handleInput}
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input
              type="number"
              name="phone"
              id="phone"
              required
              autoComplete="off"
              placeholder="Enter your phone number"
              value={data.phone}
              onChange={handleInput}
            />
          </div>
          <br />
          <button type="submit" className="btn btn-submit">
            Update User
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default AdminUpdate;
