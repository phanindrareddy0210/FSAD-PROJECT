import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Appointment from "./pages/Appointment";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";

// Wrapper component to handle conditional Navbar rendering
const Layout = ({ children }) => {
  const location = useLocation();
  
  // List of routes where the Navbar should be hidden
  const hideNavbarRoutes = [
    '/appointment',
    '/register',
    '/signin',
    '/appointment/confirmation',
    '/doctor/dashboard',
    '/patient/dashboard'
  ];
  
  // Check if the current route is in the hideNavbarRoutes list
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for persisted user session on app load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/appointment/confirmation" element={<AppointmentConfirmation />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;