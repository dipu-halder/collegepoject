

import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.userData);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // logout ke baad login page pe bhej do
  };

  const handleEdit = () => {
    alert("Edit Profile feature coming soon 🚀");
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p className="warning">⚠️ Please login to see your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
        </div>
        <h2 className="profile-names">{user.username}</h2>
        <span className={`role-badge ${user.isAdmin ? "admin" : "user"}`}>
          {user.isAdmin ? "🛡️ Admin" : "👤 User"}
        </span>

        <div className="profile-details">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>

        <div className="profile-buttons">
          <button className="btn edit" onClick={handleEdit}>✏️ Edit Profile</button>
          <button className="btn logout" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
