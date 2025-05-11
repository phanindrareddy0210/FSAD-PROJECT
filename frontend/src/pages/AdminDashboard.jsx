import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8071";

// Mock doctor data (to be replaced by API response)
const mockDoctors = [
  {
    id: 1,
    name: "Dr. Smith",
    specialization: "Cardiologist",
    experience: "10 years",
    hospital: "City Medical Center",
    consultationFee: 1500,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Dr. Johnson",
    specialization: "Dermatologist",
    experience: "8 years",
    hospital: "Metro Skin Clinic",
    consultationFee: 1200,
    createdAt: new Date().toISOString(),
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState(mockDoctors); // Start with mock data
  const [error, setError] = useState("");
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    experience: "",
    hospital: "",
    consultationFee: "",
  });
  const [doctorFormErrors, setDoctorFormErrors] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role.toLowerCase() !== "admin") {
        navigate("/signin", { replace: true });
      } else {
        setUser(parsedUser);
        fetchUsers(parsedUser.id);
        fetchAppointments(parsedUser.id);
        fetchDoctors(parsedUser.id);
      }
    } else {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  const fetchUsers = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { "user-id": userId },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error(err);
    }
  };

  const fetchAppointments = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/appointments`, {
        headers: { "user-id": userId },
      });
      setAppointments(response.data);
    } catch (err) {
      setError("Failed to fetch appointments. Please try again.");
      console.error(err);
    }
  };

  const fetchDoctors = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/doctors`, {
        headers: { "user-id": userId },
      });
      setDoctors(response.data);
    } catch (err) {
      setError("Failed to fetch doctors. Please try again.");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This will also delete their appointments.")) {
      try {
        await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
          headers: { "user-id": user.id },
        });
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        setError("Failed to delete user. Please try again.");
        console.error(err);
      }
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/appointments/${appointmentId}`,
        { status: newStatus },
        {
          headers: { "user-id": user.id },
        }
      );
      setAppointments(
        appointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
    } catch (err) {
      setError("Failed to update appointment status. Please try again.");
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await axios.delete(`${API_URL}/api/admin/appointments/${appointmentId}`, {
          headers: { "user-id": user.id },
        });
        setAppointments(appointments.filter((appt) => appt.id !== appointmentId));
      } catch (err) {
        setError("Failed to delete appointment. Please try again.");
        console.error(err);
      }
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`${API_URL}/api/admin/doctors/${doctorId}`, {
          headers: { "user-id": user.id },
        });
        setDoctors(doctors.filter((doc) => doc.id !== doctorId));
      } catch (err) {
        setError("Failed to delete doctor. Please try again.");
        console.error(err);
      }
    }
  };

  const handleDoctorInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
    if (doctorFormErrors[name]) {
      setDoctorFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateDoctorForm = () => {
    const errors = {};
    if (!newDoctor.name.trim()) errors.name = "Name is required";
    if (!newDoctor.specialization.trim()) errors.specialization = "Specialization is required";
    if (!newDoctor.experience.trim()) errors.experience = "Experience is required";
    if (!newDoctor.hospital.trim()) errors.hospital = "Hospital is required";
    if (!newDoctor.consultationFee || newDoctor.consultationFee <= 0)
      errors.consultationFee = "Valid consultation fee is required";
    setDoctorFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!validateDoctorForm()) return;
    try {
      await axios.post(
        `${API_URL}/api/admin/doctors`,
        {
          name: newDoctor.name,
          specialization: newDoctor.specialization,
          experience: newDoctor.experience,
          hospital: newDoctor.hospital,
          consultationFee: parseFloat(newDoctor.consultationFee),
        },
        {
          headers: { "user-id": user.id },
        }
      );
      setNewDoctor({
        name: "",
        specialization: "",
        experience: "",
        hospital: "",
        consultationFee: "",
      });
      setShowAddDoctorForm(false);
      fetchDoctors(user.id); // Refresh the doctors list
    } catch (err) {
      setError("Failed to add doctor. Please try again.");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin", { replace: true });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.username}!</p>
        {error && <p className="error-message">{error}</p>}

        <div className="dashboard-section">
          <h2>Manage Users</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{new Date(u.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Manage Doctors</h2>
          <button
            className="action-button add-button"
            onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
          >
            {showAddDoctorForm ? "Cancel" : "Add Doctor"}
          </button>
          {showAddDoctorForm && (
            <form onSubmit={handleAddDoctor} className="doctor-form">
              <div className="form-row">
                <div className={`form-group ${doctorFormErrors.name ? "error" : ""}`}>
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newDoctor.name}
                    onChange={handleDoctorInputChange}
                    placeholder="Enter doctor's name"
                  />
                  {doctorFormErrors.name && (
                    <span className="error-message">{doctorFormErrors.name}</span>
                  )}
                </div>
                <div className={`form-group ${doctorFormErrors.specialization ? "error" : ""}`}>
                  <label>Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    value={newDoctor.specialization}
                    onChange={handleDoctorInputChange}
                    placeholder="Enter specialization"
                  />
                  {doctorFormErrors.specialization && (
                    <span className="error-message">{doctorFormErrors.specialization}</span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className={`form-group ${doctorFormErrors.experience ? "error" : ""}`}>
                  <label>Experience *</label>
                  <input
                    type="text"
                    name="experience"
                    value={newDoctor.experience}
                    onChange={handleDoctorInputChange}
                    placeholder="Enter years of experience"
                  />
                  {doctorFormErrors.experience && (
                    <span className="error-message">{doctorFormErrors.experience}</span>
                  )}
                </div>
                <div className={`form-group ${doctorFormErrors.hospital ? "error" : ""}`}>
                  <label>Hospital *</label>
                  <input
                    type="text"
                    name="hospital"
                    value={newDoctor.hospital}
                    onChange={handleDoctorInputChange}
                    placeholder="Enter hospital name"
                  />
                  {doctorFormErrors.hospital && (
                    <span className="error-message">{doctorFormErrors.hospital}</span>
                  )}
                </div>
                <div className={`form-group ${doctorFormErrors.consultationFee ? "error" : ""}`}>
                  <label>Consultation Fee *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={newDoctor.consultationFee}
                    onChange={handleDoctorInputChange}
                    placeholder="Enter consultation fee"
                    min="0"
                    step="0.01"
                  />
                  {doctorFormErrors.consultationFee && (
                    <span className="error-message">{doctorFormErrors.consultationFee}</span>
                  )}
                </div>
              </div>
              <button type="submit" className="action-button submit-button">
                Add Doctor
              </button>
            </form>
          )}
          {doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Hospital</th>
                    <th>Consultation Fee</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.name}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.experience}</td>
                      <td>{doc.hospital}</td>
                      <td>₹{doc.consultationFee.toFixed(2)}</td>
                      <td>{new Date(doc.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteDoctor(doc.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Manage Appointments</h2>
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Symptoms</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.id}</td>
                      <td>{appt.patient_name}</td>
                      <td>{appt.doctor_name}</td>
                      <td>{appt.date}</td>
                      <td>{appt.time}</td>
                      <td>{appt.symptoms}</td>
                      <td>
                        <select
                          value={appt.status}
                          onChange={(e) => handleUpdateAppointmentStatus(appt.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteAppointment(appt.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button className="action-button logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;