import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role.toLowerCase() !== "patient") {
        navigate("/signin", { replace: true });
      } else {
        setUser(parsedUser);
      }
    } else {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin", { replace: true });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Patient Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.username}!</p>
        <div className="dashboard-info">
          <p><strong>Role:</strong> {user.role.toLowerCase()}</p>
          <p><strong>Your Appointments:</strong></p>
          <div className="appointment-list">
            <p>No appointments booked. (Feature coming soon!)</p>
          </div>
          <button
            className="action-button"
            onClick={() => navigate("/appointment")}
          >
            Book an Appointment
          </button>
        </div>
        <div className="dashboard-actions">
          <button className="action-button" onClick={() => navigate("/profile")}>
            View Profile
          </button>
          <button className="action-button logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;