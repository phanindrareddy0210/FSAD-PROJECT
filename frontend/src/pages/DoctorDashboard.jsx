import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import "../styles/dashboard.css";

// Mock appointment data for the doctor
const mockAppointments = [
  {
    id: 1,
    doctor: { name: "Dr. Smith" },
    patient: {
      name: "John Doe",
      symptoms: "Chest pain and shortness of breath",
    },
    date: "2025-05-12T10:00:00Z",
    time: "10:00 AM",
    confirmationCode: "APP-12345678",
  },
  {
    id: 2,
    doctor: { name: "Dr. Smith" },
    patient: {
      name: "Sarah Johnson",
      symptoms: "Fever and cough",
    },
    date: "2025-05-13T14:00:00Z",
    time: "02:00 PM",
    confirmationCode: "APP-87654321",
  },
  {
    id: 3,
    doctor: { name: "Dr. Johnson" },
    patient: {
      name: "Mike Brown",
      symptoms: "Skin rash and itching",
    },
    date: "2025-05-14T09:00:00Z",
    time: "09:00 AM",
    confirmationCode: "APP-45678912",
  },
  {
    id: 4,
    doctor: { name: "Dr. Smith" },
    patient: {
      name: "Emily Davis",
      symptoms: "Headache and nausea",
    },
    date: "2025-05-15T11:30:00Z",
    time: "11:30 AM",
    confirmationCode: "APP-98765432",
  },
  {
    id: 5,
    doctor: { name: "Dr. Smith" },
    patient: {
      name: "Robert Wilson",
      symptoms: "Back pain and stiffness",
    },
    date: "2025-05-16T15:00:00Z",
    time: "03:00 PM",
    confirmationCode: "APP-34567890",
  },
  {
    id: 6,
    doctor: { name: "Dr. Johnson" },
    patient: {
      name: "Lisa Martinez",
      symptoms: "Sore throat and fatigue",
    },
    date: "2025-05-15T13:00:00Z",
    time: "01:00 PM",
    confirmationCode: "APP-23456789",
  },
  {
    id: 7,
    doctor: { name: "Dr. Johnson" },
    patient: {
      name: "David Lee",
      symptoms: "Allergies and watery eyes",
    },
    date: "2025-05-16T10:00:00Z",
    time: "10:00 AM",
    confirmationCode: "APP-67890123",
  },
  {
    id: 8,
    doctor: { name: "Dr. Smith" },
    patient: {
      name: "Anna Taylor",
      symptoms: "Abdominal pain and bloating",
    },
    date: "2025-05-17T09:30:00Z",
    time: "09:30 AM",
    confirmationCode: "APP-78901234",
  },
  {
    id: 9,
    doctor: { name: "Dr. Johnson" },
    patient: {
      name: "Chris Evans",
      symptoms: "Joint pain and swelling",
    },
    date: "2025-05-17T14:30:00Z",
    time: "02:30 PM",
    confirmationCode: "APP-89012345",
  },
  {
    id: 10,
    doctor: { name: "Dr. Smith" },
    patient: {
      name: "Olivia Brown",
      symptoms: "Dizziness and fatigue",
    },
    date: "2025-05-18T12:00:00Z",
    time: "12:00 PM",
    confirmationCode: "APP-90123456",
  },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role.toLowerCase() !== "doctor") {
        navigate("/signin", { replace: true });
      } else {
        setUser(parsedUser);
        // Filter mock appointments for this doctor
        const doctorAppointments = mockAppointments
          .filter(appointment => appointment.doctor.name.toLowerCase() === parsedUser.username.toLowerCase())
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
        setAppointments(doctorAppointments);
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
        <h1>Doctor Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, Dr. {user.username}!</p>
        <div className="dashboard-info">
          <p><strong>Role:</strong> {user.role.toLowerCase()}</p>
          <p><strong>Upcoming Appointments:</strong></p>
          <div className="appointment-list">
            {appointments.length === 0 ? (
              <p>No upcoming appointments.</p>
            ) : (
              appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <span className="confirmation-code">{appointment.confirmationCode}</span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Patient:</strong> {appointment.patient.name}</p>
                    <p><strong>Date:</strong> {format(parseISO(appointment.date), 'EEEE, MMMM d, yyyy')}</p>
                    <p><strong>Time:</strong> {appointment.time}</p>
                    <p><strong>Symptoms:</strong> {appointment.patient.symptoms}</p>
                  </div>
                </div>
              ))
            )}
          </div>
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

export default DoctorDashboard;