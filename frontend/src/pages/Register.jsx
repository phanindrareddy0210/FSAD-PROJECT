import axios from 'axios';
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default role
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8071";
  const signupUrl = `${API_URL}/api/auth/signup`;

  const checkPasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters and can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (id === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }

    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roleString: formData.role.toUpperCase(), // Changed from 'role' to 'roleString' to match backend
      };

      console.log("Sending signup payload:", JSON.stringify(registrationData, null, 2));
      const response = await axios.post(signupUrl, registrationData, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage(response.data || "Successfully signed up!");
      setTimeout(() => navigate("/signin", { replace: true }), 2000);
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Signup failed. Please try again.";
      if (error.isAxiosError) {
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          switch (error.response.status) {
            case 409:
              if (error.response.data.includes("Username")) {
                errorMessage = "Username is already taken.";
              } else if (error.response.data.includes("Email")) {
                errorMessage = "Email is already registered.";
              }
              break;
            case 400:
              if (error.response.data.includes("role")) {
                errorMessage = "Invalid role selected.";
              } else {
                errorMessage = error.response.data;
              }
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = error.response.data || errorMessage;
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          if (error.message.includes("CORS")) {
            errorMessage = "CORS error: Unable to reach the backend. Ensure CORS is configured correctly.";
          } else {
            errorMessage = "Network error: Unable to reach the backend. Please check if the server is running.";
          }
        } else {
          console.error("Error setting up request:", error.message);
          errorMessage = "An unexpected error occurred while setting up the request.";
        }
      } else {
        errorMessage = "An unexpected error occurred.";
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us today!</p>

        {message && (
          <p className={message.includes("Success") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              disabled={isLoading}
              autoComplete="username"
              required
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
              autoComplete="email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="password-strength">
              <div className={`strength-bar strength-${passwordStrength}`} />
              <span className="strength-text">
                {passwordStrength === 0 && 'Weak'}
                {passwordStrength === 1 && 'Fair'}
                {passwordStrength === 2 && 'Good'}
                {passwordStrength === 3 && 'Strong'}
                {passwordStrength === 4 && 'Very Strong'}
              </span>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Register As *</label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              required
            >
              <option value="patient">Patient</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Creating account...</span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/signin">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;