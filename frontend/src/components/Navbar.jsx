import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  // Mock user - replace with actual auth logic
  const [user, setUser] = useState(null); // Example: { role: 'doctor', name: 'Dr. Smith' }

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const toggleDoctorDropdown = () => setDoctorDropdownOpen(!doctorDropdownOpen);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
        setDoctorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
    setDoctorDropdownOpen(false);
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Public Nav Items
  const commonNavItems = [
    { path: '/', name: 'Home' },

  ];

  // Doctor-specific links
  const doctorNavItems = [
    { path: '/doctor/dashboard', name: 'Dashboard' },
    { path: '/doctor/schedule', name: 'My Schedule' },
    { path: '/doctor/appointments', name: 'Appointments' },
    { path: '/doctor/patients', name: 'My Patients' },
    { path: '/doctor/profile', name: 'Profile' },
    { path: '/doctor/prescriptions', name: 'Prescriptions' },
  ];

  // Admin-specific links
  const adminNavItems = [
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/admin/doctors', name: 'Manage Doctors' },
    { path: '/admin/patients', name: 'Manage Patients' },
  ];

  // Shown only when not logged in
  const authNavItems = [
    { path: '/register', name: 'Register' },
    { path: '/signin', name: 'Sign In' },
  ];

  const handleLogout = () => {
    setUser(null);
    closeMenu();
    setDoctorDropdownOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={`navbar ${scrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="navbar-container">
        <Link to="/" className="logo" aria-label="MediCare Home">
          <span>MediCare</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger ${isOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`nav-list ${isOpen ? 'open' : ''}`}>
          {/* Public Navigation */}
          {commonNavItems.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Link to={item.path} onClick={closeMenu}>
                {item.name}
              </Link>
            </li>
          ))}

          {/* Doctor Dropdown */}
          {user?.role === 'doctor' && (
            <li className={`nav-item dropdown ${doctorDropdownOpen ? 'open' : ''}`}>
              <button
                className="dropdown-toggle"
                onClick={toggleDoctorDropdown}
                aria-expanded={doctorDropdownOpen}
              >
                Doctor <span className="dropdown-arrow"></span>
              </button>
              <ul className="dropdown-menu">
                {doctorNavItems.map((item) => (
                  <li
                    key={item.path}
                    className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <Link to={item.path} onClick={() => {
                      closeMenu();
                      setDoctorDropdownOpen(false);
                    }}>
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li className="dropdown-item">
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </li>
          )}

          {/* Admin Navigation */}
          {user?.role === 'admin' && adminNavItems.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Link to={item.path} onClick={closeMenu}>
                {item.name}
              </Link>
            </li>
          ))}

          {/* Auth Options (when not logged in) */}
          {!user && authNavItems.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Link to={item.path} onClick={closeMenu}>
                {item.name}
              </Link>
            </li>
          ))}

          {/* Profile & Logout */}
          {user && user.role !== 'doctor' && user.role !== 'admin' && (
            <li className="nav-item">
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <button onClick={handleLogout}>Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;